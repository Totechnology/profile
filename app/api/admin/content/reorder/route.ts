import { NextResponse } from "next/server";
import { apiErrorResponse, readJsonBody } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth/admin-session";
import { reorderItems } from "@/lib/contentStore";
import { validateReorderPortfolioItems } from "@/lib/validation/content";
import { revalidatePortfolioSection } from "@/app/api/admin/_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { section, orderedIds } = validateReorderPortfolioItems(await readJsonBody(request));
    const items = await reorderItems(section, orderedIds);
    revalidatePortfolioSection(section);
    return NextResponse.json({ ok: true, items });
  } catch (error) {
    return apiErrorResponse(error, "admin-content-reorder");
  }
}
