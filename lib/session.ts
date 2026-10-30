import { createHmac, timingSafeEqual } from "node:crypto";
import type { Session } from "./profile";

export const SESSION_COOKIE = "fc_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export function sessionConfigured(): boolean {
  return Boolean(process.env.BETTER_AUTH_SECRET?.trim()) || process.env.NODE_ENV !== "production";
}

function secret(): string {
  const value = process.env.BETTER_AUTH_SECRET?.trim();
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error("BETTER_AUTH_SECRET is not set");
  }
  return "dev-only-session-secret";
}

function sign(body: string): string {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

export function seal(payload: unknown): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function unseal<T>(token: string | undefined | null): T | null {
  if (!token) return null;
  const index = token.lastIndexOf(".");
  if (index <= 0) return null;

  const body = token.slice(0, index);
  const mac = Buffer.from(token.slice(index + 1));
  const expected = Buffer.from(sign(body));
  if (mac.length !== expected.length || !timingSafeEqual(mac, expected)) return null;

  try {
    return JSON.parse(Buffer.from(body, "base64url").toString()) as T;
  } catch {
    return null;
  }
}

export function sealSession(session: Session): string {
  return seal(session);
}

export function readSession(token: string | undefined | null): Session | null {
  if (!sessionConfigured()) return null;
  let session: Session | null = null;
  try {
    session = unseal<Session>(token);
  } catch {
    return null;
  }
  if (!session || typeof session.phone !== "string") return null;
  if (typeof session.expiresAt !== "number" || session.expiresAt < Date.now()) return null;
  return session;
}

export function createSession(phone: string): Session {
  const now = Date.now();
  return {
    phone,
    method: "phone",
    createdAt: now,
    expiresAt: now + SESSION_MAX_AGE * 1000,
  };
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
