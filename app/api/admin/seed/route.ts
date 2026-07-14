import { NextResponse } from "next/server";
import { revalidateAllPublicContent } from "@/app/api/admin/_shared";
import { apiErrorResponse } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth/admin-session";
import { CloudBaseSeedError, seedCloudBaseContent } from "@/lib/cloudbase/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await requireAdmin();
    const result = await seedCloudBaseContent();
    revalidateAllPublicContent();
    return NextResponse.json(
      { ok: result.failed === 0, result },
      { status: result.failed === 0 ? 200 : 500, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof CloudBaseSeedError) {
      const status = error.code === "SEED_DISABLED" || error.code === "SEED_REQUIRES_CLOUDBASE" ? 403 : 500;
      return NextResponse.json(
        {
          ok: false,
          message: error.message,
          error: { code: error.code, message: error.message },
          ...(error.details ? { details: error.details } : {})
        },
        { status, headers: { "Cache-Control": "no-store" } }
      );
    }
    return apiErrorResponse(error, "admin-seed");
  }
}
