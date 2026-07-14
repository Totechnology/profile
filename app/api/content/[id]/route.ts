import { NextResponse } from "next/server";
import { apiErrorResponse, notFound } from "@/lib/api/errors";
import { getItemById } from "@/lib/contentStore";
import { validateIdentifier } from "@/lib/validation/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const id = validateIdentifier((await params).id, "id");
    const item = await getItemById(id, { includeHidden: false });
    if (!item) notFound();
    return NextResponse.json({ ok: true, item }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiErrorResponse(error, "content-item-get");
  }
}
