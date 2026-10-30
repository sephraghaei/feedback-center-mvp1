function readInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

/** Everything OTP related comes from the environment, with safe fallbacks. */
export const OTP_LENGTH = Math.min(Math.max(readInt("OTP_LENGTH", 4), 4), 8);
export const OTP_TTL_SECONDS = readInt("OTP_EXPIRES_IN_SECONDS", 120);
export const OTP_MAX_ATTEMPTS = readInt("OTP_ALLOWED_ATTEMPS", 5);

export const KAVENEGAR_TEMPLATE = process.env.KAVENEGAR_TEMPLATE?.trim() ?? "";
export const KAVENEGAR_SENDER = process.env.KAVENEGAR_SENDER?.trim() ?? "";
export const KAVENEGAR_SENDER_TYPE = process.env.KAVENEGAR_SENDER_TYPE?.trim() || "sms";

export const APP_NAME = process.env.NEXT_PUBLIC_NAME?.trim() || "پروژه سیاه";
