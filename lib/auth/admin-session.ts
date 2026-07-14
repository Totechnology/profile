import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "portfolio_admin_session";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const INVALID_PASSWORD_SENTINEL = "portfolio-password-not-configured";

type AdminSessionPayload = {
  sub: "admin";
  iat: number;
  exp: number;
  version: 1;
};

export class AdminUnauthorizedError extends Error {
  readonly status = 401;

  constructor() {
    super("未登录或登录状态已失效。");
    this.name = "AdminUnauthorizedError";
  }
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) throw new Error("AUTH_SECRET 未配置。");
  return secret;
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

function safeEqual(left: string, right: string) {
  return timingSafeEqual(digest(left), digest(right));
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

function createSessionToken() {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = {
    sub: "admin",
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
    version: 1
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

function verifySessionToken(token?: string) {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [encodedPayload, signature] = parts;

  try {
    if (!safeEqual(signature, sign(encodedPayload))) return false;

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as Partial<AdminSessionPayload>;
    const now = Math.floor(Date.now() / 1000);

    return payload.sub === "admin" && payload.version === 1 && typeof payload.exp === "number" && payload.exp > now;
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  const safeExpected = expected || INVALID_PASSWORD_SENTINEL;
  const matches = safeEqual(password, safeExpected);
  return Boolean(expected) && matches;
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  });
}

export async function verifyAdminSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function requireAdmin() {
  if (!(await verifyAdminSession())) throw new AdminUnauthorizedError();
  return true;
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}
