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
import { toPersianDigits } from "@/lib/phone";
import {
  SESSION_COOKIE,
  createSession,
  sealSession,
  sessionConfigured,
  sessionCookieOptions,
} from "@/lib/session";
import { ensureUser, getProfile } from "@/lib/user-store";
import { userRef } from "@/lib/user-ref";
import { consumeVerification, getVerification, incrementAttempts } from "@/lib/verification-store";

export const POST = withApiLogging("/api/auth/verify-otp", async (request, _context, log) => {
  if (!sessionConfigured()) {
    log.error("auth.config.missing_secret");
    return NextResponse.json(
      { message: "پیکربندی سرور کامل نشده. کمی بعد دوباره تلاش کن." },
      { status: 503 },
    );
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    log.warn("auth.otp.invalid_body");
    return NextResponse.json({ message: "درخواست معتبر نیست." }, { status: 400 });
  }

  const pending = readOtp(request.cookies.get(OTP_COOKIE)?.value);
  const verification = pending ? await getVerification(pending.verificationId) : null;
  const ref = userRef(verification?.phone);

  if (!verification || verification.consumedAt) {
    log.warn("auth.otp.missing");
    const response = NextResponse.json(
      { message: "کد منقضی شده. شماره را دوباره بفرست تا کد تازه بگیریم." },
      { status: 400 },
    );
    response.cookies.delete(OTP_COOKIE);
    return response;
  }

  const code = normalizeCode((input as { code?: unknown } | null)?.code);
  if (!code) {
    log.warn("auth.otp.invalid_format", { context: { userRef: ref } });
    return NextResponse.json(
      { message: `کد ${toPersianDigits(String(otpPolicy.length))} رقمی را کامل وارد کن.` },
      { status: 400 },
    );
  }

  if (verification.expiresAt.getTime() < Date.now()) {
    log.warn("auth.otp.expired", { context: { userRef: ref } });
    const response = NextResponse.json(
      { message: "زمان این کد تمام شد. یک کد تازه بگیر." },
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
      { message: "تعداد تلاش‌ها زیاد شد. یک کد تازه بگیر." },
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
            ? `کد درست نیست. ${toPersianDigits(String(remaining))} تلاش دیگر باقی مانده.`
            : "تعداد تلاش‌ها زیاد شد. یک کد تازه بگیر.",
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

  const consumed = await consumeVerification(verification.id, verification.phone);
  if (!consumed) {
    log.warn("auth.otp.missing");
    const response = NextResponse.json(
      { message: "کد منقضی شده. شماره را دوباره بفرست تا کد تازه بگیریم." },
      { status: 400 },
    );
    response.cookies.delete(OTP_COOKIE);
    return response;
  }

  const userId = await ensureUser(verification.phone);
  const profile = await getProfile(userId);
  const session = createSession(verification.phone, userId);

  log.info("auth.otp.verified", {
    context: {
      userRef: ref,
      hasProfile: Boolean(profile),
    },
  });

  const response = NextResponse.json({
    ok: true,
    phone: session.phone,
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
