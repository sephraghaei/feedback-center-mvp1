import { NextResponse } from "next/server";
import { withApiLogging } from "@/lib/api-logger";
import { normalizePhone } from "@/lib/phone";
import { OTP_COOKIE, createOtpCode, hashOtpCode, otpCookieOptions, otpPolicy, sealOtp } from "@/lib/otp";
import { sessionConfigured } from "@/lib/session";
import { sendOtpSms, smsConfigured } from "@/lib/sms";
import { userRef } from "@/lib/user-ref";
import { createVerification, deleteVerification } from "@/lib/verification-store";

export const POST = withApiLogging("/api/auth/request-otp", async (request, _context, log) => {
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

  const phone = normalizePhone((input as { phone?: unknown } | null)?.phone);
  if (!phone) {
    log.warn("auth.otp.invalid_phone");
    return NextResponse.json(
      { message: "شماره موبایل را درست وارد کن، مثل ۰۹۱۲۳۴۵۶۷۸۹." },
      { status: 400 },
    );
  }

  const ref = userRef(phone);
  const code = createOtpCode();
  const verificationId = await createVerification(
    phone,
    hashOtpCode(code),
    new Date(Date.now() + otpPolicy.ttlSeconds * 1000),
  );
  const sent = await sendOtpSms(phone, code);

  if (sent.status === "failed") {
    await deleteVerification(verificationId);
    log.error("auth.otp.send_failed", { message: sent.message, context: { userRef: ref } });
    return NextResponse.json({ message: sent.message }, { status: 502 });
  }

  const token = sealOtp({ verificationId });

  if (sent.status === "skipped") {
    log.warn("auth.otp.sms_skipped", { context: { userRef: ref } });
  } else {
    log.info("auth.otp.sent", { context: { userRef: ref, channel: sent.channel } });
  }

  const devCode = sent.status === "skipped" && process.env.NODE_ENV !== "production" ? code : undefined;
  if (devCode) {
    log.info("auth.otp.dev_code_ready", { context: { userRef: ref } });
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
});
