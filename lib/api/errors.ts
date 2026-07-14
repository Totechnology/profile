import { NextResponse } from "next/server";
import { AdminUnauthorizedError } from "@/lib/auth/admin-session";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function badRequest(message: string, code = "BAD_REQUEST"): never {
  throw new ApiError(400, code, message);
}

export function notFound(message = "请求的内容不存在。"): never {
  throw new ApiError(404, "NOT_FOUND", message);
}

export function conflict(message: string, code = "CONFLICT"): never {
  throw new ApiError(409, code, message);
}

export function apiErrorResponse(error: unknown, context: string) {
  if (error instanceof AdminUnauthorizedError) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHORIZED", message: "请先登录管理后台。" } },
      { status: 401 }
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      { ok: false, error: { code: error.code, message: error.message } },
      { status: error.status }
    );
  }

  console.error(`[api:${context}]`, error);
  return NextResponse.json(
    { ok: false, error: { code: "INTERNAL_ERROR", message: "服务暂时不可用，请稍后重试。" } },
    { status: 500 }
  );
}

export async function readJsonBody(request: Request, maxBytes = 1_000_000): Promise<unknown> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json")) {
    badRequest("请使用 application/json 提交数据。", "INVALID_CONTENT_TYPE");
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new ApiError(413, "PAYLOAD_TOO_LARGE", "请求内容过大。");
  }

  const raw = await request.text();
  if (!raw.trim()) badRequest("请求内容不能为空。", "EMPTY_BODY");
  if (new TextEncoder().encode(raw).byteLength > maxBytes) {
    throw new ApiError(413, "PAYLOAD_TOO_LARGE", "请求内容过大。");
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    badRequest("JSON 格式不正确。", "INVALID_JSON");
  }
}
