import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieOptions } from "@/lib/admin-auth";
import { withApiLogging } from "@/lib/api-logger";

export const POST = withApiLogging("/api/admin/logout", async (_request, _context, log) => {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({ ...adminCookieOptions, name: ADMIN_COOKIE, value: "", maxAge: 0 });
  log.info("admin.logout");
  return response;
});