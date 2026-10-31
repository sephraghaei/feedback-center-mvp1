import { createHmac } from "node:crypto";

const FALLBACK_SALT = "feedback-center-log-ref";

/**
 * A stable, non reversible reference for a user. Logs never receive the raw
 * phone number, but related entries can still be grouped for debugging.
 */
export function userRef(value: string | null | undefined): string | undefined {
  if (!value) return undefined;

  try {
    const key =
      process.env.BETTER_AUTH_SECRET?.trim() ||
      process.env.KAVENEGAR_API_KEY?.trim() ||
      FALLBACK_SALT;
    return createHmac("sha256", key).update(`feedback-center.user.v1:${value}`).digest("hex").slice(0, 16);
  } catch {
    return undefined;
  }
}
