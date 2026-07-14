import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/errors";
import { destroyAdminSession } from "@/lib/auth/admin-session";

export const runtime = "nodejs";

export async function POST() {
  try {
    await destroyAdminSession();
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiErrorResponse(error, "admin-logout");
  }
}
