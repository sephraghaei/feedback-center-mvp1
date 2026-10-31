import { NextResponse } from "next/server";
import { withApiLogging } from "@/lib/api-logger";
import { validateProfile } from "@/lib/profile";
import {
  SESSION_COOKIE,
  readSession,
  sealSession,
  sessionCookieOptions,
} from "@/lib/session";
import { userRef } from "@/lib/user-ref";

export const POST = withApiLogging("/api/auth/profile", async (request, _context, log) => {
  const session = readSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    log.warn("auth.profile.unauthorized");
    return NextResponse.json({ message: "اول با شماره موبایل وارد شو." }, { status: 401 });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    log.warn("auth.profile.invalid_body", { context: { userRef: userRef(session.phone) } });
    return NextResponse.json({ message: "درخواست معتبر نیست." }, { status: 400 });
  }

  const result = validateProfile(input);
  if ("error" in result) {
    log.warn("auth.profile.invalid", {
      message: result.error,
      context: { userRef: userRef(session.phone) },
    });
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  const updated = { ...session, profile: result.profile };
  const response = NextResponse.json({ ok: true, profile: result.profile });
  response.cookies.set({
    ...sessionCookieOptions,
    name: SESSION_COOKIE,
    value: sealSession(updated),
  });

  log.info("auth.profile.updated", {
    context: {
      userRef: userRef(session.phone),
      hasAge: Boolean(result.profile.age),
      hasSex: Boolean(result.profile.sex),
      hasCompany: Boolean(result.profile.company),
    },
  });

  return response;
});
