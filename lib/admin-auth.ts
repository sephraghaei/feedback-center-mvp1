import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "fc_admin";
export const ADMIN_MAX_AGE = 60 * 60 * 8;

export type AdminSession = {
  admin: true;
  createdAt: number;
  expiresAt: number;
};

export function adminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export function checkAdminPassword(input: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected || typeof input !== "string" || input.length === 0) return false;
  return timingSafeEqual(digest(input), digest(expected));
}

// The admin cookie is signed with a key derived from ADMIN_PASSWORD, so the
// panel never depends on BETTER_AUTH_SECRET. Changing the password also
// invalidates existing admin cookies.
function adminKey(): Buffer {
  const password = process.env.ADMIN_PASSWORD?.trim() ?? "";
  return createHash("sha256").update(`fc-admin-session.v1.${password}`).digest();
}

function signAdmin(body: string): string {
  return createHmac("sha256", adminKey()).update(`fc-admin-session.v1.${body}`).digest("base64url");
}

export function sealAdminSession(): string {
  const now = Date.now();
  const body = Buffer.from(
    JSON.stringify({
      admin: true,
      createdAt: now,
      expiresAt: now + ADMIN_MAX_AGE * 1000,
    } satisfies AdminSession),
  ).toString("base64url");
  return `${body}.${signAdmin(body)}`;
}

export function readAdminSession(token: string | undefined | null): AdminSession | null {
  if (!token || !adminPasswordConfigured()) return null;
  const index = token.lastIndexOf(".");
  if (index <= 0) return null;

  const body = token.slice(0, index);
  const mac = Buffer.from(token.slice(index + 1));
  const expected = Buffer.from(signAdmin(body));
  if (mac.length !== expected.length || !timingSafeEqual(mac, expected)) return null;

  let session: AdminSession | null = null;
  try {
    session = JSON.parse(Buffer.from(body, "base64url").toString()) as AdminSession;
  } catch {
    return null;
  }
  if (!session || session.admin !== true) return null;
  if (typeof session.expiresAt !== "number" || session.expiresAt < Date.now()) return null;
  return session;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  return readAdminSession(store.get(ADMIN_COOKIE)?.value);
}

export function adminFromRequest(request: NextRequest): AdminSession | null {
  return readAdminSession(request.cookies.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: ADMIN_MAX_AGE,
};