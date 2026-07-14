import { NextResponse } from "next/server";
import {
  getSiteSettings,
  isCloudBaseConfigured,
  usesLocalContentStore
} from "@/lib/contentStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  const local = usesLocalContentStore();
  const cloudBaseConfigured = isCloudBaseConfigured();
  const headers = { "Cache-Control": "no-store" };

  if (!local && !cloudBaseConfigured) {
    return NextResponse.json(
      {
        ok: false,
        service: "personal-portfolio",
        status: "unhealthy",
        store: "cloudbase",
        reason: "configuration_missing",
        responseTimeMs: Date.now() - startedAt
      },
      { status: 503, headers }
    );
  }

  try {
    await getSiteSettings();
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
    console.error("[api:health]", error);
    return NextResponse.json(
      {
        ok: false,
        service: "personal-portfolio",
        status: "unhealthy",
        store: local ? "local" : "cloudbase",
        reason: "data_store_unavailable",
        responseTimeMs: Date.now() - startedAt
      },
      { status: 503, headers }
    );
  }
}
