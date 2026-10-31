import {
  buildLogEntry,
  emitLogEntry,
  isLevelEnabled,
  type LogDetails,
  type LogEntry,
  type LogLevel,
} from "./logger";

const MAX_QUEUE = 100;
const MAX_BATCH = 20;
const MAX_BODY = 24000;
const FLUSH_DELAY = 2000;

const queue: LogEntry[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let installed = false;

function flush(keepalive = false): void {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (queue.length === 0 || typeof window === "undefined") return;

  const entries = queue.splice(0, MAX_BATCH);

  try {
    let body = JSON.stringify({ entries });
    while (body.length > MAX_BODY && entries.length > 1) {
      entries.pop();
      body = JSON.stringify({ entries });
    }
    if (body.length > MAX_BODY) return;

    void fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive,
    }).catch(() => undefined);
  } catch {
    // Forwarding is best effort. The local console line already exists.
  }

  if (queue.length > 0) scheduleFlush();
}

function scheduleFlush(): void {
  if (timer || typeof window === "undefined") return;
  try {
    timer = setTimeout(() => {
      timer = null;
      flush();
    }, FLUSH_DELAY);
  } catch {
    timer = null;
  }
}

export function logClientEvent(
  level: LogLevel,
  event: string,
  details: LogDetails = {},
): void {
  try {
    if (!isLevelEnabled(level)) return;
    const entry = buildLogEntry(level, event, details, { source: "client" });
    emitLogEntry(entry);

    if (typeof window === "undefined") return;

    queue.push(entry);
    if (queue.length > MAX_QUEUE) queue.splice(0, queue.length - MAX_QUEUE);

    if (queue.length >= MAX_BATCH) flush();
    else scheduleFlush();
  } catch {
    // Logging must never break the application.
  }
}

export const clientLogger = {
  debug: (event: string, details?: LogDetails) => logClientEvent("DEBUG", event, details),
  info: (event: string, details?: LogDetails) => logClientEvent("INFO", event, details),
  warn: (event: string, details?: LogDetails) => logClientEvent("WARN", event, details),
  error: (event: string, details?: LogDetails) => logClientEvent("ERROR", event, details),
};

function cleanPath(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const index = value.indexOf("?");
  return index === -1 ? value : value.slice(0, index);
}

export function installClientLogging(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    clientLogger.error("client.error", {
      message: event.message || "Unhandled browser error",
      error: event.error,
      context: {
        filename: cleanPath(event.filename),
        line: event.lineno,
        column: event.colno,
      },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    clientLogger.error("client.unhandled_rejection", {
      message: "Unhandled promise rejection",
      error: event.reason,
    });
  });

  window.addEventListener("pagehide", () => flush(true));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush(true);
  });
}
