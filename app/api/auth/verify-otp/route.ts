import { NextResponse } from "next/server";
import { withApiLogging } from "@/lib/api-logger";
import { OTP_MAX_ATTEMPTS } from "@/lib/config";
import {
  matchesOtpCode,
  normalizeCode,
  OTP_COOKIE,
  otpCookieOptions,
  otpPolicy,
  readOtp,
  sealOtp,
} from "@/lib/otp";
import {
  SESSION_COOKIE,
  createSession,
  sealSession,
  sessionConfigured,
  sessionCookieOptions,
} from "@/lib/session";
import { ensureUserByEmail, ensureUserByPhone, getProfile } from "@/lib/user-store";
import { userRef } from "@/lib/user-ref";
import {
  consumeVerification,
  getVerification,
  incrementAttempts,
  verificationIdentifier,
} from "@/lib/verification-store";

export const POST = withApiLogging("/api/auth/verify-otp", async (request, _context, log) => {
  if (!sessionConfigured()) {
    log.error("auth.config.missing_secret");
    return NextResponse.json(
      { message: "The server is not configured yet. Try again later." },
      { status: 503 },
    );
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    log.warn("auth.otp.invalid_body");
    return NextResponse.json({ message: "That request is not valid." }, { status: 400 });
  }

  const pending = readOtp(request.cookies.get(OTP_COOKIE)?.value);
  const verification = pending ? await getVerification(pending.verificationId) : null;
  const ref = userRef(verification?.phone ?? verification?.email);

  if (!verification || verification.consumedAt) {
    log.warn("auth.otp.missing");
    const response = NextResponse.json(
      { message: "That code expired. Request a new one." },
      { status: 400 },
    );
    response.cookies.delete(OTP_COOKIE);
    return response;
  }

  const code = normalizeCode((input as { code?: unknown } | null)?.code);
  if (!code) {
    log.warn("auth.otp.invalid_format", { context: { userRef: ref } });
    return NextResponse.json(
      { message: `Enter the full ${otpPolicy.length} digit code.` },
      { status: 400 },
    );
  }

  if (verification.expiresAt.getTime() < Date.now()) {
    log.warn("auth.otp.expired", { context: { userRef: ref } });
    const response = NextResponse.json(
      { message: "That code timed out. Request a new one." },
      { status: 400 },
    );
    response.cookies.delete(OTP_COOKIE);
    return response;
  }

  if (verification.attempts >= OTP_MAX_ATTEMPTS) {
    log.warn("auth.otp.too_many_attempts", {
      context: { userRef: ref, attempts: verification.attempts },
    });
    const response = NextResponse.json(
      { message: "Too many attempts. Request a new code." },
      { status: 429 },
    );
    response.cookies.delete(OTP_COOKIE);
    return response;
  }

  if (!matchesOtpCode(code, verification.codeHash)) {
    const attempts = await incrementAttempts(verification.id);
    const remaining = Math.max(0, OTP_MAX_ATTEMPTS - attempts);
    log.warn("auth.otp.incorrect", {
      context: { userRef: ref, attempts, remaining },
    });
    const response = NextResponse.json(
      {
        message:
          remaining > 0
            ? `That code is wrong. ${remaining} attempts left.`
            : "Too many attempts. Request a new code.",
      },
      { status: 400 },
    );
    if (remaining > 0) {
      const ttl = Math.max(1, Math.floor((verification.expiresAt.getTime() - Date.now()) / 1000));
      response.cookies.set({
        ...otpCookieOptions,
        maxAge: ttl,
        name: OTP_COOKIE,
        value: sealOtp({ verificationId: verification.id }),
      });
    } else {
      response.cookies.delete(OTP_COOKIE);
    }
    return response;
  }

  const consumed = await consumeVerification(verification.id, verificationIdentifier(verification));
  if (!consumed) {
    log.warn("auth.otp.missing");
    const response = NextResponse.json(
      { message: "That code expired. Request a new one." },
      { status: 400 },
    );
    response.cookies.delete(OTP_COOKIE);
    return response;
  }

  const identifier = verificationIdentifier(verification);
  const userId = "phone" in identifier
    ? await ensureUserByPhone(identifier.phone)
    : await ensureUserByEmail(identifier.email);
  const profile = await getProfile(userId);
  const session = createSession(identifier, userId);

  log.info("auth.otp.verified", {
    context: {
      userRef: ref,
      hasProfile: Boolean(profile),
    },
  });

  const response = NextResponse.json({
    ok: true,
    phone: session.phone ?? null,
    email: session.email ?? null,
    hasProfile: Boolean(profile),
  });
  response.cookies.set({
    ...sessionCookieOptions,
    name: SESSION_COOKIE,
    value: sealSession(session),
  });
  response.cookies.delete(OTP_COOKIE);
  return response;
});
