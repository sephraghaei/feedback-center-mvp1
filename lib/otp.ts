import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { OTP_LENGTH, OTP_MAX_ATTEMPTS, OTP_TTL_SECONDS } from "./config";
import { getSessionSecret, seal, unseal } from "./session";

export const OTP_COOKIE = "fc_otp";

/**
 * Kavenegar login codes are round and easy to type, as the project spec asks.
 * Same digit pairs and short runs keep them memorable without being trivial.
 */
const ROUND_CODES = [
  "1212",
  "2425",
  "2345",
  "8787",
  "4545",
  "6789",
  "1122",
  "7070",
  "3141",
  "9090",
  "1234",
  "2525",
];

export type PendingOtp = {
  verificationId: string;
};

export function createOtpCode(): string {
  if (OTP_LENGTH === 4) {
    return ROUND_CODES[randomInt(ROUND_CODES.length)];
  }

  // Other lengths still stay numeric and readable.
  let code = "";
  for (let index = 0; index < OTP_LENGTH; index += 1) {
    code += String(randomInt(0, 10));
  }
  return code;
}

export function sealOtp(pending: PendingOtp): string {
  return seal(pending);
}

export function readOtp(token: string | undefined | null): PendingOtp | null {
  const pending = unseal<{ verificationId?: unknown }>(token);
  if (!pending || typeof pending.verificationId !== "string") {
    return null;
  }
  return { verificationId: pending.verificationId };
}

export function hashOtpCode(code: string): string {
  return createHmac("sha256", getSessionSecret()).update(`fc-otp.v1.${code}`).digest("hex");
}

export function matchesOtpCode(code: string, storedHash: string): boolean {
  const expected = Buffer.from(hashOtpCode(code));
  const actual = Buffer.from(storedHash);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function normalizeCode(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const digits = input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/\D/g, "");
  if (digits.length !== OTP_LENGTH) return null;
  return digits;
}

export const otpCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: OTP_TTL_SECONDS,
};

export const otpPolicy = {
  length: OTP_LENGTH,
  ttlSeconds: OTP_TTL_SECONDS,
  maxAttempts: OTP_MAX_ATTEMPTS,
};
