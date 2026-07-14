import { NextResponse } from "next/server";
import { apiErrorResponse, readJsonBody } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth/admin-session";
import { createItem, getAllItems, getSiteContent, saveSiteContent } from "@/lib/contentStore";
import {
  validateCreatePortfolioItem,
  validatePortfolioSection,
  validateSiteContent
} from "@/lib/validation/content";
import { revalidateAllPublicContent, revalidatePortfolioItem } from "@/app/api/admin/_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const section = new URL(request.url).searchParams.get("section");

    if (section) {
      const items = await getAllItems({
        section: validatePortfolioSection(section),
        includeHidden: true
      });
      return NextResponse.json({ ok: true, items }, { headers: { "Cache-Control": "no-store" } });
    }

    const content = await getSiteContent({ includeHidden: true });
    return NextResponse.json({ ok: true, content }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiErrorResponse(error, "admin-content-get");
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const input = validateCreatePortfolioItem(await readJsonBody(request));
    const item = await createItem(input);
    revalidatePortfolioItem(item);
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, "admin-content-create");
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const content = validateSiteContent(await readJsonBody(request, 4_000_000));
    const savedContent = await saveSiteContent(content);
    revalidateAllPublicContent();
    return NextResponse.json({ ok: true, content: savedContent });
  } catch (error) {
    return apiErrorResponse(error, "admin-content-replace");
  }
}
