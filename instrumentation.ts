import type { Instrumentation } from "next";
import { logger } from "@/lib/logger";

function stripQuery(path: string): string {
  const index = path.indexOf("?");
  return index === -1 ? path : path.slice(0, index);
}

export function register(): void {
  logger.info("app.server.started", {
    context: {
      runtime: process.env.NEXT_RUNTIME ?? "nodejs",
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
      deployment: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
    },
  });
}

export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  logger.error("app.request.error", {
    message: `${request.method} ${stripQuery(request.path)}`,
    error,
    context: {
      method: request.method,
      path: stripQuery(request.path),
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
      renderSource: context.renderSource,
      revalidateReason: context.revalidateReason,
    },
  });
};
