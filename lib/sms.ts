import { KAVENEGAR_SENDER, KAVENEGAR_SENDER_TYPE, KAVENEGAR_TEMPLATE } from "./config";
import { logger } from "./logger";

export type SmsResult =
  | { status: "sent"; channel: "template" | "text" }
  | { status: "skipped" }
  | { status: "failed"; message: string };

export function smsConfigured(): boolean {
  return Boolean(process.env.KAVENEGAR_API_KEY?.trim());
}

async function callKavenegar(
  apiKey: string,
  endpoint: string,
  params: Record<string, string>,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const startedAt = Date.now();

  try {
    const response = await fetch(
      `https://api.kavenegar.com/v1/${encodeURIComponent(apiKey)}/${endpoint}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(params),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );

    const payload = (await response.json().catch(() => null)) as
      | { return?: { status?: number; message?: string } }
      | null;

    if (!response.ok || payload?.return?.status !== 200) {
      const message =
        payload?.return?.message ??
        `ارسال پیامک انجام نشد. کد پاسخ کاوه‌نگار: ${payload?.return?.status ?? response.status}`;
      logger.warn("sms.kavenegar.rejected", {
        message,
        context: {
          endpoint,
          httpStatus: response.status,
          providerStatus: payload?.return?.status,
          durationMs: Date.now() - startedAt,
        },
      });
      return { ok: false, message };
    }

    logger.debug("sms.kavenegar.sent", {
      context: { endpoint, httpStatus: response.status, durationMs: Date.now() - startedAt },
    });
    return { ok: true };
  } catch (error) {
    logger.error("sms.kavenegar.network_error", {
      message: "Kavenegar request failed",
      error,
      context: { endpoint, durationMs: Date.now() - startedAt },
    });
    return {
      ok: false,
      message: "ارتباط با کاوه‌نگار برقرار نشد. کمی بعد دوباره تلاش کن.",
    };
  }
}

/**
 * Sends the login code through Kavenegar. When KAVENEGAR_TEMPLATE is set the
 * code goes through the approved OTP template, otherwise as a plain SMS.
 */
export async function sendOtpSms(phone: string, code: string): Promise<SmsResult> {
  const apiKey = process.env.KAVENEGAR_API_KEY?.trim();
  if (!apiKey) {
    logger.debug("sms.skipped", { message: "KAVENEGAR_API_KEY is not set" });
    return { status: "skipped" };
  }

  if (KAVENEGAR_TEMPLATE) {
    const result = await callKavenegar(apiKey, "verify/lookup.json", {
      receptor: phone,
      token: code,
      template: KAVENEGAR_TEMPLATE,
      type: KAVENEGAR_SENDER_TYPE,
    });
    return result.ok ? { status: "sent", channel: "template" } : { status: "failed", message: result.message };
  }

  const params: Record<string, string> = {
    receptor: phone,
    message: `${code} کد ورود شماست. اگر این درخواست را نداده‌اید پیام را نادیده بگیرید.`,
    type: KAVENEGAR_SENDER_TYPE,
  };
  if (KAVENEGAR_SENDER) params.sender = KAVENEGAR_SENDER;

  const result = await callKavenegar(apiKey, "sms/send.json", params);
  return result.ok ? { status: "sent", channel: "text" } : { status: "failed", message: result.message };
}
