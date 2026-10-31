import { NextResponse } from "next/server";
import { withApiLogging } from "@/lib/api-logger";
import { SESSION_COOKIE, readSession } from "@/lib/session";

export const POST = withApiLogging("/api/auth/logout", async (request, _context, log) => {
  const session = readSession(request.cookies.get(SESSION_COOKIE)?.value);

  log.info("auth.logout", { context: { hadSession: Boolean(session) } });

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
});
