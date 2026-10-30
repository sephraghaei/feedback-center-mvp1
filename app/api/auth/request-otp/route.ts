import { NextResponse } from "next/server";
import { normalizePhone } from "@/lib/phone";
import { OTP_COOKIE, createOtpCode, otpCookieOptions, otpPolicy, sealOtp } from "@/lib/otp";
import { sessionConfigured } from "@/lib/session";
import { sendOtpSms, smsConfigured } from "@/lib/sms";

export async function POST(request: Request) {
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

  const phone = normalizePhone((input as { phone?: unknown } | null)?.phone);
  if (!phone) {
    return NextResponse.json(
      { message: "شماره موبایل را درست وارد کن، مثل ۰۹۱۲۳۴۵۶۷۸۹." },
      { status: 400 },
    );
  }

  const code = createOtpCode();
  const sent = await sendOtpSms(phone, code);

  if (sent.status === "failed") {
    return NextResponse.json({ message: sent.message }, { status: 502 });
  }

  const token = sealOtp({
    phone,
    code,
    attempts: 0,
    expiresAt: Date.now() + otpPolicy.ttlSeconds * 1000,
  });

  const devCode = sent.status === "skipped" && process.env.NODE_ENV !== "production" ? code : undefined;
  if (devCode) {
    console.info(`[otp] ${phone} -> ${code} (KAVENEGAR_API_KEY is not set)`);
  }

  const response = NextResponse.json({
    ok: true,
    phone,
    devCode,
    smsSent: smsConfigured() && sent.status === "sent",
    expiresIn: otpPolicy.ttlSeconds,
    codeLength: otpPolicy.length,
  });
  response.cookies.set({ ...otpCookieOptions, name: OTP_COOKIE, value: token });
  return response;
}
