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

export type ProductBrand = {
  label: string;
  display: string;
  href: string | null;
  host: string | null;
  origin: string | null;
  initial: string;
  hue: number;
};

/** Hues picked to sit beside the blue accent in both themes. */
const MARK_HUES = [214, 262, 190, 158, 32, 350, 288, 16];

function hashOf(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function productBrand(value: string | null | undefined): ProductBrand | null {
  const context = productContext(value);
  if (!context) return null;

  let host: string | null = null;
  let origin: string | null = null;
  if (context.href) {
    try {
      const url = new URL(context.href);
      origin = url.origin;
      host = url.hostname.replace(/^www\./i, "");
    } catch {
      origin = null;
    }
  }

  const source = (host ?? context.label).trim();
  const first = Array.from(source)[0] ?? "؟";
  const initial = /[a-z]/i.test(first) ? first.toUpperCase() : first;

  return {
    label: context.label,
    display: host ?? context.label,
    href: context.href,
    host,
    origin,
    initial,
    hue: MARK_HUES[hashOf(source.toLowerCase()) % MARK_HUES.length],
  };
}
