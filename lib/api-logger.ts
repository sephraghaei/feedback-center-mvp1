import { NextResponse, type NextRequest } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { createLogger, type LogDetails, type LogLevel, type Logger } from "./logger";
import { SESSION_COOKIE, readSession } from "./session";
import { userRef } from "./user-ref";

export type RequestLogger = {
  readonly requestId: string;
  debug: (event: string, details?: LogDetails) => void;
  info: (event: string, details?: LogDetails) => void;
  warn: (event: string, details?: LogDetails) => void;
  error: (event: string, details?: LogDetails) => void;
  child: (context: Record<string, unknown>) => Logger;
};

export type ApiHandler<Context = unknown> = (
  request: NextRequest,
  context: Context,
  log: RequestLogger,
) => Response | Promise<Response>;

type ApiLoggingOptions = {
  /** Force a level for the completion line, for high volume routes. */
  completionLevel?: LogLevel;
};

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{8,80}$/;

function createRequestId(request: NextRequest): string {
  const incoming = request.headers.get("x-request-id");
  if (incoming && REQUEST_ID_PATTERN.test(incoming)) return incoming;

  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // Fall through to the simple random id.
  }

  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function requestPath(request: NextRequest): string {
  try {
    return new URL(request.url).pathname;
  } catch {
    return "/";
  }
}

function requestUserRef(request: NextRequest): string | undefined {
  try {
    const token = request.cookies?.get?.(SESSION_COOKIE)?.value;
    return userRef(readSession(token)?.phone);
  } catch {
    return undefined;
  }
}

function completion(log: RequestLogger, level: LogLevel, status: number, durationMs: number): void {
  const details: LogDetails = { context: { status, durationMs } };
  if (level === "ERROR") log.error("api.request.completed", details);
  else if (level === "WARN") log.warn("api.request.completed", details);
  else if (level === "DEBUG") log.debug("api.request.completed", details);
  else log.info("api.request.completed", details);
}

/**
 * Wraps an API route with request logging and a safe 500 response. The handler
 * receives a request scoped logger whose context includes the request id, so
 * domain events and the completion line can be correlated.
 */
export function withApiLogging<Context = unknown>(
  route: string,
  handler: ApiHandler<Context>,
  options: ApiLoggingOptions = {},
) {
  return async (request: NextRequest, context: Context): Promise<Response> => {
    const startedAt = Date.now();
    const requestId = createRequestId(request);
    const path = requestPath(request);
    const ref = requestUserRef(request);

    const baseLogger = createLogger({
      requestId,
      route,
      method: request.method.toUpperCase(),
      path,
      ...(ref ? { userRef: ref } : {}),
    });
    const log: RequestLogger = {
      requestId,
      debug: baseLogger.debug,
      info: baseLogger.info,
      warn: baseLogger.warn,
      error: baseLogger.error,
      child: baseLogger.child,
    };

    try {
      const response = await handler(request, context, log);
      const durationMs = Date.now() - startedAt;
      const level: LogLevel =
        response.status >= 500
          ? "ERROR"
          : response.status >= 400
            ? "WARN"
            : options.completionLevel ?? "INFO";

      completion(log, level, response.status, durationMs);

      try {
        response.headers.set("x-request-id", requestId);
      } catch {
        // Some Response objects expose immutable headers.
      }

      return response;
    } catch (error) {
      unstable_rethrow(error);

      const durationMs = Date.now() - startedAt;
      log.error("api.request.failed", {
        message: "Unhandled error in API route",
        error,
        context: { status: 500, durationMs },
      });

      const response = NextResponse.json(
        {
          message: "یک مشکل پیش آمد. لطفا دوباره تلاش کن.",
          requestId,
        },
        { status: 500 },
      );
      response.headers.set("x-request-id", requestId);
      return response;
    }
  };
}
