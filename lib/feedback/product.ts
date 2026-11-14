export const MAX_PRODUCT_LENGTH = 120;

export type ProductParse = { ok: true; value: string | null } | { ok: false; message: string };

export type ProductContext = { label: string; href: string | null };

const SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;
const DOMAIN = /^[^\s/]+\.[^\s/]{2,}(?:\/.*)?$/i;

function normalizeUrl(raw: string, withScheme: boolean): ProductParse {
  let url: URL;
  try {
    url = new URL(withScheme ? raw : `https://${raw}`);
  } catch {
    return { ok: false, message: "آدرس سایت معتبر نیست." };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, message: "آدرس سایت باید با http یا https شروع شود." };
  }
  if (!url.hostname.includes(".")) {
    return { ok: false, message: "آدرس سایت معتبر نیست." };
  }
  return { ok: true, value: url.toString().replace(/\/$/, "") };
}

export function parseProduct(input: string | null | undefined): ProductParse {
  const text = (input ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .replace(/\s+/g, " ");
  if (!text) return { ok: true, value: null };
  if (text.length > MAX_PRODUCT_LENGTH) {
    return { ok: false, message: "نام محصول یا آدرس سایت حداکثر ۱۲۰ نویسه است." };
  }
  if (SCHEME.test(text)) return normalizeUrl(text, true);
  if (!/\s/.test(text) && DOMAIN.test(text)) return normalizeUrl(text, false);
  if (text.includes("://")) return { ok: false, message: "آدرس سایت معتبر نیست." };
  return { ok: true, value: text };
}

export function productContext(value: string | null | undefined): ProductContext | null {
  const parsed = parseProduct(value);
  if (!parsed.ok || !parsed.value) return null;
  if (SCHEME.test(parsed.value)) {
    return { label: parsed.value.replace(/^https?:\/\//i, "").replace(/\/$/, ""), href: parsed.value };
  }
  return { label: parsed.value, href: null };
}
