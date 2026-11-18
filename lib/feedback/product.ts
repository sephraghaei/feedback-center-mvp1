export const MAX_PRODUCT_LENGTH = 120;
export const MAX_SITE_URL_LENGTH = 200;

export type ProductParse = { ok: true; value: string | null } | { ok: false; message: string };

export type ProductContext = { label: string; href: string | null };

const SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;
const DOMAIN = /^[^\s/]+\.[^\s/]{2,}(?:\/.*)?$/i;

function cleanText(input: string | null | undefined): string {
  return (input ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeUrl(raw: string, withScheme: boolean): ProductParse {
  let url: URL;
  try {
    url = new URL(withScheme ? raw : `https://${raw}`);
  } catch {
    return { ok: false, message: "That website address is not valid." };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, message: "Website must start with http or https." };
  }
  if (!url.hostname.includes(".")) {
    return { ok: false, message: "That website address is not valid." };
  }
  return { ok: true, value: url.toString().replace(/\/$/, "") };
}

export function parseProduct(input: string | null | undefined): ProductParse {
  const text = cleanText(input);
  if (!text) return { ok: true, value: null };
  if (text.length > MAX_PRODUCT_LENGTH) {
    return { ok: false, message: "Product name or website can be at most 120 characters." };
  }
  if (SCHEME.test(text)) return normalizeUrl(text, true);
  if (!/\s/.test(text) && DOMAIN.test(text)) return normalizeUrl(text, false);
  if (text.includes("://")) return { ok: false, message: "That website address is not valid." };
  return { ok: true, value: text };
}

export function parseSiteUrl(input: string | null | undefined): ProductParse {
  const text = cleanText(input);
  if (!text) return { ok: true, value: null };
  if (text.length > MAX_SITE_URL_LENGTH) {
    return { ok: false, message: "Website address can be at most 200 characters." };
  }
  if (/\s/.test(text)) return { ok: false, message: "That website address is not valid." };
  if (SCHEME.test(text)) return normalizeUrl(text, true);
  if (DOMAIN.test(text)) return normalizeUrl(text, false);
  return { ok: false, message: "That website address is not valid." };
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

export function productBrand(
  value: string | null | undefined,
  siteValue?: string | null,
): ProductBrand | null {
  const name = parseProduct(value);
  const site = parseSiteUrl(siteValue);

  let url: URL | null = null;
  if (site.ok && site.value) {
    url = new URL(site.value);
  }

  const nameValue = name.ok ? name.value : null;
  const nameIsLink = Boolean(nameValue && SCHEME.test(nameValue));
  if (!url && nameIsLink && nameValue) {
    url = new URL(nameValue);
  }

  const host = url ? url.hostname.replace(/^www\./i, "") : null;
  const display = nameValue && !nameIsLink ? nameValue : host;
  if (!display) return null;

  const first = Array.from(display)[0] ?? "?";
  const initial = /[a-z]/i.test(first) ? first.toUpperCase() : first;

  return {
    display,
    href: url ? url.toString().replace(/\/$/, "") : null,
    host,
    origin: url ? url.origin : null,
    initial,
    hue: MARK_HUES[hashOf((host ?? display).toLowerCase()) % MARK_HUES.length],
  };
}
