import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const maxFileSize = 8 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "未登录" }, { status: 401 });
  }

  const formData = await request.formData();
  const upload = formData.get("file");

  if (!upload || typeof upload === "string") {
    return NextResponse.json({ ok: false, message: "缺少图片文件" }, { status: 400 });
  }

  const file = upload as File;
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, message: "只支持图片文件" }, { status: 400 });
  }

  if (file.size > maxFileSize) {
    return NextResponse.json({ ok: false, message: "图片不能超过 8MB" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase() || ".png";
  if (!allowedExtensions.has(ext)) {
    return NextResponse.json({ ok: false, message: "只支持 jpg、png、webp、gif" }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const filename = `${Date.now()}-${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadsDir, filename), buffer);

  return NextResponse.json({
    ok: true,
    url: `/uploads/${filename}`
  });
}
