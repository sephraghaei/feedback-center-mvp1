import { logger } from "./logger";

export type EmailResult =
  | { status: "sent" }
  | { status: "skipped" }
  | { status: "failed"; message: string };

/** Normalizes an email address, or returns null when it is not plausible. */
export function normalizeEmail(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const value = input.trim().toLowerCase();
  if (value.length > 254) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ? value : null;
}

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM?.trim());
}

/**
 * Sends the login code through Resend. When RESEND_API_KEY or RESEND_FROM is
 * not set the send is skipped, matching the local development behaviour of
 * the SMS path.
 */
export async function sendOtpEmail(email: string, code: string): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  if (!apiKey || !from) {
    logger.debug("email.skipped", { message: "RESEND_API_KEY or RESEND_FROM is not set" });
    return { status: "skipped" };
  }

  const startedAt = Date.now();
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Your Vasa login code",
        html: `<p>Your login code is <b>${code}</b>. Do not share it, and only enter it on this site.</p>`,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    const payload = (await response.json().catch(() => null)) as { id?: string } | null;
    if (!response.ok || !payload?.id) {
      logger.warn("email.resend.rejected", {
        context: { httpStatus: response.status, durationMs: Date.now() - startedAt },
      });
      return { status: "failed", message: "The email could not be sent. Try again shortly." };
    }

    logger.debug("email.resend.sent", {
      context: { httpStatus: response.status, durationMs: Date.now() - startedAt },
    });
    return { status: "sent" };
  } catch (error) {
    logger.error("email.resend.network_error", {
      message: "Resend request failed",
      error,
      context: { durationMs: Date.now() - startedAt },
    });
    return { status: "failed", message: "The email service is unreachable. Try again shortly." };
  }
}
