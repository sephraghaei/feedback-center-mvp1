export const LOG_LEVELS = ["DEBUG", "INFO", "WARN", "ERROR"] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

export type LogContext = Record<string, unknown>;

export type LogError = {
  name: string;
  message: string;
  stack?: string;
  digest?: string;
  cause?: string;
};

export type LogDetails = {
  message?: string;
  context?: LogContext;
  error?: unknown;
};

export type LogEntry = {
  timestamp: string;
  level: LogLevel;
  event: string;
  message?: string;
  context?: LogContext;
  error?: LogError;
};

export type Logger = {
  debug: (event: string, details?: LogDetails) => void;
  info: (event: string, details?: LogDetails) => void;
  warn: (event: string, details?: LogDetails) => void;
  error: (event: string, details?: LogDetails) => void;
  child: (context: LogContext) => Logger;
};

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
};

const MAX_STRING = 1000;
const MAX_STACK = 4000;
const MAX_DEPTH = 6;
const MAX_ARRAY = 50;
const MAX_KEYS = 50;

const PUBLIC_LOG_LEVEL =
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_LOG_LEVEL : undefined;

/**
 * Context keys that commonly carry credentials, tokens or personal data.
 * Values are replaced before anything reaches a console or log sink.
 */
const SENSITIVE_KEYS = new Set([
  "password",
  "passcode",
  "token",
  "accesstoken",
  "refreshtoken",
  "secret",
  "apikey",
  "authorization",
  "cookie",
  "session",
  "otp",
  "code",
  "phone",
  "phonenumber",
  "telephone",
  "mobile",
  "mobilenumber",
  "email",
  "name",
  "username",
  "displayname",
  "fullname",
  "firstname",
  "lastname",
  "age",
  "company",
  "address",
  "ip",
  "ipaddress",
  "iban",
  "cardnumber",
  "nationalid",
]);

function env(name: string): string | undefined {
  try {
    return typeof process !== "undefined" ? process.env[name] : undefined;
  } catch {
    return undefined;
  }
}

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isSensitiveKey(key: string): boolean {
  const normalized = normalizeKey(key);
  if (SENSITIVE_KEYS.has(normalized)) return true;
  if (normalized.startsWith("otp")) return true;
  return /(?:password|passcode|secret|token|apikey|authorization|cookie|phonenumber|telephone|mobile|email|nationalid|cardnumber|iban)$/.test(
    normalized,
  );
}

const SECRET_ENV_NAMES = ["BETTER_AUTH_SECRET", "KAVENEGAR_API_KEY", "DATABASE_URL"];
let cachedSecrets: string[] | null = null;

function secretValues(): string[] {
  if (cachedSecrets) return cachedSecrets;
  try {
    cachedSecrets = SECRET_ENV_NAMES.map((name) => env(name)?.trim())
      .filter((value): value is string => Boolean(value && value.length >= 8));
  } catch {
    cachedSecrets = [];
  }
  return cachedSecrets;
}

function redactText(value: string): string {
  let text = value;
  try {
    for (const secret of secretValues()) {
      if (text.includes(secret)) text = text.split(secret).join("[REDACTED]");
    }
    text = text.replace(/\bBearer\s+[A-Za-z0-9._~+/=-]{8,}/gi, "Bearer [REDACTED]");
    text = text.replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[REDACTED_EMAIL]");
    text = text.replace(/(?:\+98|0098|98|0)?9\d{9}\b/g, "[REDACTED_PHONE]");
  } catch {
    // Keep the original text if redaction itself fails.
  }
  return text;
}

function truncate(value: string, limit = MAX_STRING): string {
  return value.length > limit ? `${value.slice(0, limit)}...[truncated]` : value;
}

function safeString(value: unknown, limit = MAX_STRING): string {
  try {
    if (typeof value === "string") return redactText(truncate(value, limit));
    if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
      return String(value);
    }
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (value instanceof Date) return value.toISOString();
    if (value instanceof Error) return redactText(truncate(`${value.name}: ${value.message}`, limit));
    return redactText(truncate(JSON.stringify(value) ?? String(value), limit));
  } catch {
    return "[unserializable]";
  }
}

export function normalizeError(error: unknown): LogError | undefined {
  if (error === undefined || error === null) return undefined;

  try {
    if (error instanceof Error) {
      const extra = error as Error & { digest?: unknown; cause?: unknown };
      return {
        name: redactText(truncate(error.name || "Error", 120)),
        message: redactText(truncate(error.message || "Unknown error", MAX_STRING)),
        ...(error.stack ? { stack: redactText(truncate(error.stack, MAX_STACK)) } : {}),
        ...(extra.digest !== undefined ? { digest: safeString(extra.digest, 200) } : {}),
        ...(extra.cause !== undefined ? { cause: safeString(extra.cause, MAX_STRING) } : {}),
      };
    }

    if (typeof error === "object") {
      const record = error as Record<string, unknown>;
      return {
        name: safeString(record.name ?? "Error", 120),
        message: safeString(record.message ?? error, MAX_STRING),
        ...(record.stack ? { stack: safeString(record.stack, MAX_STACK) } : {}),
        ...(record.digest !== undefined ? { digest: safeString(record.digest, 200) } : {}),
      };
    }

    return { name: "Error", message: safeString(error, MAX_STRING) };
  } catch {
    return { name: "Error", message: "[unserializable error]" };
  }
}

function sanitizeValue(value: unknown, depth: number, seen: WeakSet<object>): unknown {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const kind = typeof value;
  if (kind === "string") return redactText(truncate((value as string).replace(/[\r\n\t]+/g, " ")));
  if (kind === "number" || kind === "boolean") return value;
  if (kind === "bigint") return String(value);
  if (kind === "symbol" || kind === "function") return undefined;

  if (value instanceof Date) return value.toISOString();
  if (value instanceof Error) return normalizeError(value);

  if (depth >= MAX_DEPTH) return "[max depth]";

  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_ARRAY)
      .map((item) => sanitizeValue(item, depth + 1, seen));
  }

  if (kind === "object") {
    const object = value as object;
    if (seen.has(object)) return "[circular]";
    seen.add(object);

    const result: Record<string, unknown> = {};
    let count = 0;
    for (const key of Object.keys(object)) {
      if (count >= MAX_KEYS) {
        result.__truncated = true;
        break;
      }
      if (isSensitiveKey(key)) {
        result[key] = "[REDACTED]";
      } else {
        const item = sanitizeValue((object as Record<string, unknown>)[key], depth + 1, seen);
        if (item !== undefined) result[key] = item;
      }
      count += 1;
    }

    seen.delete(object);
    return result;
  }

  return undefined;
}

export function sanitizeContext(context: LogContext | undefined): LogContext | undefined {
  if (!context) return undefined;
  try {
    const result = sanitizeValue(context, 0, new WeakSet<object>());
    return result && typeof result === "object" && !Array.isArray(result)
      ? (result as LogContext)
      : undefined;
  } catch {
    return undefined;
  }
}

function sanitizeEvent(event: string): string {
  const value = safeString(event, 120).replace(/[^a-zA-Z0-9._:-]/g, "_");
  return value || "log";
}

export function configuredLevel(): LogLevel {
  const raw = (env("LOG_LEVEL") || PUBLIC_LOG_LEVEL || "").toUpperCase();
  return (LOG_LEVELS as readonly string[]).includes(raw) ? (raw as LogLevel) : "INFO";
}

export function isLevelEnabled(level: LogLevel): boolean {
  return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[configuredLevel()];
}

export function emitLogEntry(entry: LogEntry): void {
  try {
    if (!isLevelEnabled(entry.level)) return;
    write(entry.level, entry);
  } catch {
    // Logging must never break the application.
  }
}

function isPretty(): boolean {
  const format = (env("LOG_FORMAT") || "").toLowerCase();
  if (format === "json") return false;
  if (format === "pretty") return true;
  return env("NODE_ENV") !== "production";
}

function formatEntry(entry: LogEntry): string {
  if (!isPretty()) return JSON.stringify(entry);

  const parts = [entry.timestamp, entry.level.padEnd(5), entry.event];
  if (entry.message) parts.push(entry.message);
  let line = parts.join(" ");
  if (entry.context && Object.keys(entry.context).length > 0) {
    line += ` ${JSON.stringify(entry.context)}`;
  }
  if (entry.error) {
    line += ` | ${entry.error.name}: ${entry.error.message}`;
  }
  return line;
}

function write(level: LogLevel, entry: LogEntry): void {
  try {
    const line = formatEntry(entry);
    if (level === "ERROR") console.error(line);
    else if (level === "WARN") console.warn(line);
    else console.info(line);
  } catch {
    try {
      console.error(`[logger] ${level} ${entry.event}`);
    } catch {
      // Logging must never break the application.
    }
  }
}

export function buildLogEntry(
  level: LogLevel,
  event: string,
  details: LogDetails = {},
  baseContext: LogContext = {},
): LogEntry {
  const context = sanitizeContext({ ...baseContext, ...(details.context ?? {}) });
  return {
    timestamp: new Date().toISOString(),
    level,
    event: sanitizeEvent(event),
    ...(details.message
      ? { message: safeString(details.message, MAX_STRING).replace(/[\r\n\t]+/g, " ") }
      : {}),
    ...(context && Object.keys(context).length > 0 ? { context } : {}),
    ...(details.error !== undefined ? { error: normalizeError(details.error) } : {}),
  };
}

function emit(
  level: LogLevel,
  event: string,
  details: LogDetails | undefined,
  baseContext: LogContext,
): void {
  try {
    if (!isLevelEnabled(level)) return;
    write(level, buildLogEntry(level, event, details, baseContext));
  } catch {
    // Logging must never break the application.
  }
}

export function createLogger(baseContext: LogContext = {}): Logger {
  const base: LogContext = { service: "feedback-center", ...baseContext };

  return {
    debug: (event, details) => emit("DEBUG", event, details, base),
    info: (event, details) => emit("INFO", event, details, base),
    warn: (event, details) => emit("WARN", event, details, base),
    error: (event, details) => emit("ERROR", event, details, base),
    child: (context) => createLogger({ ...base, ...context }),
  };
}

export const logger = createLogger();
