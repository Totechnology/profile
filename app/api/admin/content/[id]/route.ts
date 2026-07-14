import { NextResponse } from "next/server";
import { apiErrorResponse, notFound, readJsonBody } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth/admin-session";
import { deleteItem, getItemById, updateItem } from "@/lib/contentStore";
import { validateIdentifier, validateUpdatePortfolioItem } from "@/lib/validation/content";
import { revalidatePortfolioItem } from "@/app/api/admin/_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

async function getValidatedId(context: RouteContext) {
  return validateIdentifier((await context.params).id, "id");
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const id = await getValidatedId(context);
    const existing = await getItemById(id, { includeHidden: true });
    if (!existing) notFound();

    const patch = validateUpdatePortfolioItem(await readJsonBody(request));
    const item = await updateItem(id, patch);
    if (!item) notFound();

    revalidatePortfolioItem(existing);
    revalidatePortfolioItem(item);
    return NextResponse.json({ ok: true, item });
  } catch (error) {
    return apiErrorResponse(error, "admin-content-update");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const id = await getValidatedId(context);
    const existing = await getItemById(id, { includeHidden: true });
    if (!existing) notFound();

    await deleteItem(id);
    revalidatePortfolioItem(existing);
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    return apiErrorResponse(error, "admin-content-delete");
  }
}
