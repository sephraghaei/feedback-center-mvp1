import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { withApiLogging } from "@/lib/api-logger";
import { validateProfile } from "@/lib/profile";
import {
  SESSION_COOKIE,
  readSession,
  sealSession,
  sessionCookieOptions,
} from "@/lib/session";
import {
  ensureUserByClerkId,
  ensureUserByEmail,
  ensureUserByPhone,
  saveProfile,
} from "@/lib/user-store";
import { userRef } from "@/lib/user-ref";

export const POST = withApiLogging("/api/auth/profile", async (request, _context, log) => {
  const session = readSession(request.cookies.get(SESSION_COOKIE)?.value);
  const clerkAuth = session ? null : await auth();
  const clerkId = clerkAuth?.userId ?? null;
  if (!session && !clerkId) {
    log.warn("auth.profile.unauthorized");
    return NextResponse.json({ message: "اول وارد حسابت شو." }, { status: 401 });
  }

  const sessionRef = userRef(session?.phone ?? session?.email ?? clerkId);

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    log.warn("auth.profile.invalid_body", { context: { userRef: sessionRef } });
    return NextResponse.json({ message: "درخواست معتبر نیست." }, { status: 400 });
  }

  const result = validateProfile(input);
  if ("error" in result) {
    log.warn("auth.profile.invalid", {
      message: result.error,
      context: { userRef: sessionRef },
    });
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  const userId = session
    ? session.phone
      ? await ensureUserByPhone(session.phone)
      : await ensureUserByEmail(session.email ?? "")
    : await ensureUserByClerkId(clerkId as string);
  await saveProfile(userId, result.profile);

  const response = NextResponse.json({ ok: true, profile: result.profile });
  if (session) {
    const updated = {
      userId,
      ...(session.phone ? { phone: session.phone } : {}),
      ...(session.email ? { email: session.email } : {}),
      method: session.method,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    };
    response.cookies.set({
      ...sessionCookieOptions,
      name: SESSION_COOKIE,
      value: sealSession(updated),
    });
  }

  log.info("auth.profile.updated", {
    context: {
      userRef: sessionRef,
      hasAge: Boolean(result.profile.age),
      hasSex: Boolean(result.profile.sex),
      hasCompany: Boolean(result.profile.company),
    },
  });

  return response;
});
