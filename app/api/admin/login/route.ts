import { NextResponse } from "next/server";
import { adminCookieOptions, createSessionToken, SESSION_COOKIE, verifyAdminPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  const password = body?.password || "";

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ ok: false, message: "密码不正确" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createSessionToken(), adminCookieOptions());
  return response;
}
