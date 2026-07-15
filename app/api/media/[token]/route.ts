import { NextResponse } from "next/server";
import { getCloudBaseStorage } from "@/lib/cloudbase/server";
import {
  decodePortfolioFileToken,
  PortfolioStorageError
} from "@/lib/cloudbase/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ token: string }> };

const MAX_MEDIA_RESPONSE_BYTES = 12 * 1024 * 1024;
const ALLOWED_MEDIA_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function isTrustedStorageHost(hostname: string) {
  const host = hostname.toLowerCase();
  return (
    host.endsWith(".tcb.qcloud.la") ||
    host.endsWith(".tcloudbaseapp.com") ||
    /^.+\.cos\.[a-z0-9-]+\.myqcloud\.com$/.test(host)
  );
}

function mediaErrorDetails(error: unknown) {
  if (!error || typeof error !== "object") return { name: "Error", code: "UNKNOWN" };
  const record = error as Record<string, unknown>;
  return {
    name: typeof record.name === "string" ? record.name : "Error",
    code:
      typeof record.code === "string"
        ? record.code
        : typeof record.errorCode === "string"
          ? record.errorCode
          : "UNKNOWN"
  };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { token } = await context.params;
    const fileID = decodePortfolioFileToken(token);
    const result = await getCloudBaseStorage().getPublicUrl(fileID);

    if (!("data" in result) || !result.data) {
      const error = "error" in result ? result.error : undefined;
      console.error("[cloudbase-storage:media-sign]", mediaErrorDetails(error));
      return NextResponse.json({ ok: false, error: "media_unavailable" }, { status: 503 });
    }

    const signedUrl = new URL(result.data.publicUrl);
    if (signedUrl.protocol !== "https:" || !isTrustedStorageHost(signedUrl.hostname)) {
      throw new PortfolioStorageError("CloudBase 返回了不受信任的媒体地址。");
    }

    const upstream = await fetch(signedUrl, {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15_000)
    });

    if (!upstream.ok || !upstream.body) {
      console.error("[cloudbase-storage:media-fetch]", {
        status: upstream.status,
        contentType: upstream.headers.get("content-type") || "unknown"
      });
      return NextResponse.json({ ok: false, error: "media_unavailable" }, { status: 503 });
    }

    const contentType = upstream.headers.get("content-type")?.split(";")[0].trim().toLowerCase() || "";
    const contentLength = Number(upstream.headers.get("content-length"));
    if (
      !ALLOWED_MEDIA_TYPES.has(contentType) ||
      (Number.isFinite(contentLength) && contentLength > MAX_MEDIA_RESPONSE_BYTES)
    ) {
      console.warn("[cloudbase-storage:media-invalid]", {
        contentType: contentType || "unknown",
        contentLength: Number.isFinite(contentLength) ? contentLength : "unknown"
      });
      return NextResponse.json({ ok: false, error: "media_invalid" }, { status: 415 });
    }

    const headers = new Headers({
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff"
    });
    const etag = upstream.headers.get("etag");
    const lastModified = upstream.headers.get("last-modified");
    if (Number.isFinite(contentLength)) headers.set("Content-Length", String(contentLength));
    if (etag) headers.set("ETag", etag);
    if (lastModified) headers.set("Last-Modified", lastModified);

    return new NextResponse(upstream.body, { status: 200, headers });
  } catch (error) {
    console.warn("[cloudbase-storage:media-request]", mediaErrorDetails(error));
    return NextResponse.json({ ok: false, error: "media_not_found" }, { status: 404 });
  }
}
