import { randomUUID } from "node:crypto";
import path from "node:path";
import { NextResponse } from "next/server";
import { apiErrorResponse, badRequest } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/auth/admin-session";
import { uploadPortfolioFile } from "@/lib/cloudbase/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MIME_EXTENSIONS: Record<string, readonly string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"]
};

function hasValidSignature(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return bytes.length >= signature.length && signature.every((value, index) => bytes[index] === value);
  }
  if (mimeType === "image/webp") {
    return (
      bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }
  return false;
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const contentLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_FILE_SIZE + 1024 * 1024) {
      badRequest("图片不能超过 10MB。", "UPLOAD_TOO_LARGE");
    }

    const formData = await request.formData();
    const upload = formData.get("file");
    if (!(upload instanceof File)) badRequest("缺少图片文件。", "UPLOAD_MISSING");
    if (upload.size <= 0) badRequest("图片内容为空。", "UPLOAD_EMPTY");
    if (upload.size > MAX_FILE_SIZE) badRequest("图片不能超过 10MB。", "UPLOAD_TOO_LARGE");

    const allowedExtensions = MIME_EXTENSIONS[upload.type];
    const sourceExtension = path.extname(upload.name).toLowerCase();
    if (!allowedExtensions || !allowedExtensions.includes(sourceExtension)) {
      badRequest("只支持扩展名与 MIME 一致的 JPG、JPEG、PNG 或 WebP 图片。", "UPLOAD_TYPE_INVALID");
    }

    const bytes = new Uint8Array(await upload.arrayBuffer());
    if (!hasValidSignature(bytes, upload.type)) {
      badRequest("图片文件内容与申报格式不一致。", "UPLOAD_SIGNATURE_INVALID");
    }

    const now = new Date();
    const year = String(now.getUTCFullYear());
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const cloudPath = `personal-portfolio/uploads/${year}/${month}/${randomUUID()}${sourceExtension}`;
    const file = await uploadPortfolioFile({
      cloudPath,
      bytes,
      mimeType: upload.type,
      upsert: false
    });

    return NextResponse.json(
      { ok: true, ...file, file },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return apiErrorResponse(error, "admin-upload");
  }
}
