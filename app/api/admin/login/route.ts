import { NextResponse } from "next/server";
import { apiErrorResponse, badRequest, readJsonBody } from "@/lib/api/errors";
import { createAdminSession, verifyAdminPassword } from "@/lib/auth/admin-session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request, 4_096);
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      badRequest("登录信息格式不正确。", "INVALID_LOGIN");
    }

    const password = (body as { password?: unknown }).password;
    if (typeof password !== "string" || !password || password.length > 512) {
      badRequest("请输入管理员密码。", "INVALID_LOGIN");
    }

    if (!verifyAdminPassword(password)) {
      const message = "登录信息不正确。";
      return NextResponse.json(
        { ok: false, message, error: { code: "INVALID_CREDENTIALS", message } },
        { status: 401 }
      );
    }

    await createAdminSession();
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiErrorResponse(error, "admin-login");
  }
}
