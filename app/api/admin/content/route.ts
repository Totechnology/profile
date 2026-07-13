import { NextResponse } from "next/server";
import { contentStore } from "@/lib/contentStore";
import { isAdminAuthenticated } from "@/lib/auth";
import type { SiteContent } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "未登录" }, { status: 401 });
  }

  const content = await contentStore.getContent();
  return NextResponse.json({ ok: true, content });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "未登录" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { content?: SiteContent } | null;
  if (!body?.content) {
    return NextResponse.json({ ok: false, message: "缺少内容" }, { status: 400 });
  }

  const content = await contentStore.saveContent(body.content);
  return NextResponse.json({ ok: true, content });
}
