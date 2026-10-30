import { NextRequest, NextResponse } from "next/server";
import { OTP_MAX_ATTEMPTS } from "@/lib/config";
import { normalizeCode, OTP_COOKIE, otpCookieOptions, otpPolicy, readOtp, sealOtp } from "@/lib/otp";
import { toPersianDigits } from "@/lib/phone";
import {
  SESSION_COOKIE,
  createSession,
  readSession,
  sealSession,
  sessionConfigured,
  sessionCookieOptions,
} from "@/lib/session";

export async function POST(request: NextRequest) {
  if (!sessionConfigured()) {
    console.error("[auth] BETTER_AUTH_SECRET is not set");
    return NextResponse.json(
      { message: "پیکربندی سرور کامل نشده. کمی بعد دوباره تلاش کن." },
      { status: 503 },
    );
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ message: "درخواست معتبر نیست." }, { status: 400 });
  }

  const pending = readOtp(request.cookies.get(OTP_COOKIE)?.value);
  if (!pending) {
    return NextResponse.json(
      { message: "کد منقضی شده. شماره را دوباره بفرست تا کد تازه بگیریم." },
      { status: 400 },
    );
  }

  const code = normalizeCode((input as { code?: unknown } | null)?.code);
  if (!code) {
    return NextResponse.json(
      { message: `کد ${toPersianDigits(String(otpPolicy.length))} رقمی را کامل وارد کن.` },
      { status: 400 },
    );
  }

  if (pending.expiresAt < Date.now()) {
    const response = NextResponse.json(
      { message: "زمان این کد تمام شد. یک کد تازه بگیر." },
      { status: 400 },
    );
    response.cookies.delete(OTP_COOKIE);
    return response;
  }

  if (pending.attempts >= OTP_MAX_ATTEMPTS) {
    const response = NextResponse.json(
      { message: "تعداد تلاش‌ها زیاد شد. یک کد تازه بگیر." },
      { status: 429 },
    );
    response.cookies.delete(OTP_COOKIE);
    return response;
  }

  if (pending.code !== code) {
    const attempts = pending.attempts + 1;
    const remaining = OTP_MAX_ATTEMPTS - attempts;
    const response = NextResponse.json(
      {
        message:
          remaining > 0
            ? `کد درست نیست. ${remaining} تلاش دیگر باقی مانده.`
            : "تعداد تلاش‌ها زیاد شد. یک کد تازه بگیر.",
      },
      { status: 400 },
    );
    if (remaining > 0) {
      const ttl = Math.max(1, Math.floor((pending.expiresAt - Date.now()) / 1000));
      response.cookies.set({
        ...otpCookieOptions,
        maxAge: ttl,
        name: OTP_COOKIE,
        value: sealOtp({ ...pending, attempts }),
      });
    } else {
      response.cookies.delete(OTP_COOKIE);
    }
    return response;
  }

  const existing = readSession(request.cookies.get(SESSION_COOKIE)?.value);
  const session =
    existing && existing.phone === pending.phone
      ? existing
      : createSession(pending.phone);

  const response = NextResponse.json({
    ok: true,
    phone: session.phone,
    hasProfile: Boolean(session.profile),
  });
  response.cookies.set({
    ...sessionCookieOptions,
    name: SESSION_COOKIE,
    value: sealSession(session),
  });
  response.cookies.delete(OTP_COOKIE);
  return response;
}
