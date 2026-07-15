import { NextResponse } from "next/server";
import {
  checkContentStoreHealth,
  isCloudBaseConfigured,
  usesLocalContentStore
} from "@/lib/contentStore";
import { getCloudBaseErrorDiagnostic } from "@/lib/cloudbase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  const local = usesLocalContentStore();
  const cloudBaseConfigured = isCloudBaseConfigured();
  const debug = process.env.HEALTH_DEBUG?.trim().toLowerCase() === "true";
  const headers = { "Cache-Control": "no-store" };

  if (!local && !cloudBaseConfigured) {
    return NextResponse.json(
      {
        ok: false,
        service: "personal-portfolio",
        status: "unhealthy",
        store: "cloudbase",
        reason: "configuration_missing",
        ...(debug
          ? {
              errorName: "CloudBaseConfigurationError",
              errorCode: "CLOUDBASE_ENV_MISSING"
            }
          : {}),
        responseTimeMs: Date.now() - startedAt
      },
      { status: 503, headers }
    );
  }

  try {
    await checkContentStoreHealth();
    return NextResponse.json(
      {
        ok: true,
        service: "personal-portfolio",
        status: "healthy",
        store: local ? "local" : "cloudbase",
        responseTimeMs: Date.now() - startedAt
      },
      { headers }
    );
  } catch (error) {
    const diagnostic = getCloudBaseErrorDiagnostic(error);
    console.error("[api:health]", {
      event: "data_store_unavailable",
      category: diagnostic.category,
      errorName: diagnostic.errorName,
      errorCode: diagnostic.errorCode
    });
    return NextResponse.json(
      {
        ok: false,
        service: "personal-portfolio",
        status: "unhealthy",
        store: local ? "local" : "cloudbase",
        reason: "data_store_unavailable",
        ...(debug
          ? {
              errorName: diagnostic.errorName,
              errorCode: diagnostic.errorCode
            }
          : {}),
        responseTimeMs: Date.now() - startedAt
      },
      { status: 503, headers }
    );
  }
}
