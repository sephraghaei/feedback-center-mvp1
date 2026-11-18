import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  adminPasswordConfigured,
  checkAdminPassword,
  sealAdminSession,
} from "@/lib/admin-auth";
import { withApiLogging } from "@/lib/api-logger";
import { localizeError } from "@/lib/i18n/errors";
import { getLocale } from "@/lib/i18n/server";

type ThrottleState = { attempts: number; windowStart: number };
const globalForThrottle = globalThis as typeof globalThis & {
  __adminLoginThrottle?: Map<string, ThrottleState>;
};
const throttle = (globalForThrottle.__adminLoginThrottle ??= new Map());

const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function throttled(key: string): boolean {
  const now = Date.now();
  const state = throttle.get(key);
  if (!state || now - state.windowStart > WINDOW_MS) {
    throttle.set(key, { attempts: 1, windowStart: now });
    return false;
  }
  state.attempts += 1;
  return state.attempts > MAX_ATTEMPTS;
}

export const POST = withApiLogging("/api/admin/login", async (request, _context, log) => {
  const locale = await getLocale();
  if (!adminPasswordConfigured()) {
    log.warn("admin.login.not_configured");
    return NextResponse.json(
      { message: localizeError("Admin sign-in is not enabled. Set ADMIN_PASSWORD in the environment.", locale) },
      { status: 503 },
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (throttled(ip)) {
    log.warn("admin.login.throttled", { context: { ip } });
    return NextResponse.json(
      { message: localizeError("Too many attempts. Try again in a few minutes.", locale) },
      { status: 429 },
    );
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ message: localizeError("Invalid request.", locale) }, { status: 400 });
  }

  const password = (input as { password?: unknown })?.password;
  if (!checkAdminPassword(password)) {
    log.warn("admin.login.failed", { context: { ip } });
    return NextResponse.json({ message: localizeError("Wrong password.", locale) }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    ...adminCookieOptions,
    name: ADMIN_COOKIE,
    value: sealAdminSession(),
  });
  log.info("admin.login.succeeded", { context: { ip } });
  return response;
});