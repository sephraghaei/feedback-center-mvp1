import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { seal, unseal } from "./session";

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

export function sealAdminSession(): string {
  const now = Date.now();
  return seal({
    admin: true,
    createdAt: now,
    expiresAt: now + ADMIN_MAX_AGE * 1000,
  } satisfies AdminSession);
}

export function readAdminSession(token: string | undefined | null): AdminSession | null {
  const session = unseal<AdminSession>(token);
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