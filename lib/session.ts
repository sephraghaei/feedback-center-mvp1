import { createHmac, timingSafeEqual } from "node:crypto";
import { logger } from "./logger";
import type { Session } from "./profile";

export const SESSION_COOKIE = "fc_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

const warned = new Set<string>();

/**
 * A session key is needed to sign cookies. BETTER_AUTH_SECRET is the intended
 * one; the Kavenegar key is a server only secret too, so it can stand in and
 * keep login working when the dedicated variable has not been set yet.
 */
function keyMaterial(): { value: string; source: string } | null {
  const explicit = process.env.BETTER_AUTH_SECRET?.trim();
  if (explicit) return { value: explicit, source: "BETTER_AUTH_SECRET" };

  const kavenegar = process.env.KAVENEGAR_API_KEY?.trim();
  if (kavenegar) return { value: kavenegar, source: "KAVENEGAR_API_KEY" };

  return null;
}

export function sessionConfigured(): boolean {
  return Boolean(keyMaterial()) || process.env.NODE_ENV !== "production";
}

function secret(): string {
  const material = keyMaterial();
  if (material) {
    if (material.source !== "BETTER_AUTH_SECRET" && !warned.has("fallback")) {
      warned.add("fallback");
      logger.warn("auth.session.secret_fallback", {
        message:
          "BETTER_AUTH_SECRET is not set, signing sessions with KAVENEGAR_API_KEY. Set BETTER_AUTH_SECRET to use a dedicated key.",
      });
    }
    return material.value;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("No session secret available: set BETTER_AUTH_SECRET");
  }
  return "dev-only-session-secret";
}

export function getSessionSecret(): string {
  return secret();
}

function sign(body: string): string {
  return createHmac("sha256", getSessionSecret()).update(`fc-session.v1.${body}`).digest("base64url");
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

export function createSession(phone: string, userId: string): Session {
  const now = Date.now();
  return {
    userId,
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
