import { NextResponse, type NextRequest } from "next/server";
import { withApiLogging } from "@/lib/api-logger";
import { LOG_LEVELS, logger, type LogContext, type LogDetails, type LogLevel } from "@/lib/logger";

const MAX_BODY = 24000;
const MAX_ENTRIES = 20;
const LEVELS = new Set<string>(LOG_LEVELS);

type ClientEntry = {
  level?: unknown;
  event?: unknown;
  message?: unknown;
  timestamp?: unknown;
  context?: unknown;
  error?: unknown;
};

function write(level: LogLevel, event: string, details: LogDetails): void {
  if (level === "ERROR") logger.error(event, details);
  else if (level === "WARN") logger.warn(event, details);
  else if (level === "DEBUG") logger.debug(event, details);
  else logger.info(event, details);
}

export const POST = withApiLogging(
  "/api/logs",
  async (request: NextRequest) => {
    const raw = await request.text();
    if (raw.length === 0) return new NextResponse(null, { status: 204 });
    if (raw.length > MAX_BODY) {
      return NextResponse.json({ message: "حجم لاگ بیش از حد مجاز است." }, { status: 413 });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      return NextResponse.json({ message: "درخواست معتبر نیست." }, { status: 400 });
    }

    const entries =
      typeof payload === "object" && payload !== null && Array.isArray((payload as { entries?: unknown }).entries)
        ? ((payload as { entries: unknown[] }).entries ?? [])
        : [];

    for (const item of entries.slice(0, MAX_ENTRIES)) {
      if (typeof item !== "object" || item === null) continue;
      const entry = item as ClientEntry;
      const level =
        typeof entry.level === "string" && LEVELS.has(entry.level)
          ? (entry.level as LogLevel)
          : "INFO";
      if (typeof entry.event !== "string" || entry.event.trim().length === 0) continue;

      const name = entry.event.startsWith("client.") ? entry.event : `client.${entry.event}`;
      const rawClientContext =
        typeof entry.context === "object" && entry.context !== null && !Array.isArray(entry.context)
          ? (entry.context as LogContext)
          : {};
      const { source: _source, ...clientContext } = rawClientContext;
      const context: LogContext = {
        ...(entry.timestamp ? { clientTimestamp: entry.timestamp } : {}),
        ...(Object.keys(clientContext).length > 0 ? { client: clientContext } : {}),
        source: "client",
      };

      write(level, name, {
        ...(typeof entry.message === "string" ? { message: entry.message } : {}),
        context,
        ...(entry.error !== undefined ? { error: entry.error } : {}),
      });
    }

    return new NextResponse(null, { status: 204 });
  },
  { completionLevel: "DEBUG" },
);
