import { NextResponse } from "next/server";
import { getCloudBaseStorage } from "@/lib/cloudbase/server";
import {
  decodePortfolioFileToken,
  PortfolioStorageError
} from "@/lib/cloudbase/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ token: string }> };

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
    if (signedUrl.protocol !== "https:") {
      throw new PortfolioStorageError("CloudBase 返回了非 HTTPS 媒体地址。");
    }

    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: signedUrl.toString(),
        "Cache-Control": "private, no-store, max-age=0"
      }
    });
  } catch (error) {
    console.warn("[cloudbase-storage:media-request]", mediaErrorDetails(error));
    return NextResponse.json({ ok: false, error: "media_not_found" }, { status: 404 });
  }
}
