import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/errors";
import { getAllItems, getSiteContent } from "@/lib/contentStore";
import { validatePortfolioSection } from "@/lib/validation/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const section = new URL(request.url).searchParams.get("section");
    if (section) {
      const items = await getAllItems({
        section: validatePortfolioSection(section),
        includeHidden: false
      });
      return NextResponse.json({ ok: true, items }, { headers: { "Cache-Control": "no-store" } });
    }

    const content = await getSiteContent({ includeHidden: false });
    return NextResponse.json({ ok: true, content }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiErrorResponse(error, "content-get");
  }
}
