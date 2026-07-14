import { NextResponse } from "next/server";
import { AdminUnauthorizedError } from "@/lib/auth/admin-session";

const noStoreHeaders = { "Cache-Control": "no-store" };

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
    const message = "请先登录管理后台。";
    return NextResponse.json(
      { ok: false, message, error: { code: "UNAUTHORIZED", message } },
      { status: 401, headers: noStoreHeaders }
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      { ok: false, message: error.message, error: { code: error.code, message: error.message } },
      { status: error.status, headers: noStoreHeaders }
    );
  }

  const code =
    typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
      ? error.code
      : undefined;
  if (code === "CONTENT_NOT_FOUND") {
    const message = "请求的内容不存在。";
    return NextResponse.json(
      { ok: false, message, error: { code: "NOT_FOUND", message } },
      { status: 404, headers: noStoreHeaders }
    );
  }
  if (code === "CONTENT_CONFLICT") {
    const message = "内容已发生变化，请刷新后重试。";
    return NextResponse.json(
      { ok: false, message, error: { code: "CONFLICT", message } },
      { status: 409, headers: noStoreHeaders }
    );
  }
  if (code === "CLOUDBASE_NOT_CONFIGURED") {
    const message = "CloudBase 运行环境尚未配置完整。";
    return NextResponse.json(
      { ok: false, message, error: { code: "SERVICE_UNAVAILABLE", message } },
      { status: 503, headers: noStoreHeaders }
    );
  }

  console.error(`[api:${context}]`, error);
  const message = "服务暂时不可用，请稍后重试。";
  return NextResponse.json(
    { ok: false, message, error: { code: "INTERNAL_ERROR", message } },
    { status: 500, headers: noStoreHeaders }
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
