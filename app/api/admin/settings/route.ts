import { NextResponse } from "next/server";
import { apiErrorResponse, readJsonBody } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth/admin-session";
import { getSiteSettings, updateSiteSettings } from "@/lib/contentStore";
import { validateSettingsPatch } from "@/lib/validation/content";
import { revalidateAllPublicContent } from "@/app/api/admin/_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const settings = await getSiteSettings();
    return NextResponse.json({ ok: true, settings }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiErrorResponse(error, "admin-settings-get");
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const patch = validateSettingsPatch(await readJsonBody(request));
    const settings = await updateSiteSettings(patch);
    revalidateAllPublicContent();
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    return apiErrorResponse(error, "admin-settings-update");
  }
}
