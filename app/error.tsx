"use client";

import { useEffect } from "react";
import { clientLogger } from "@/lib/client-logger";

export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    clientLogger.error("ui.error_boundary", {
      message: "Route error boundary caught an error",
      error,
      context: { boundary: "route" },
    });
  }, [error]);

  return (
    <main className="page">
      <h1 className="title">مشکلی پیش آمد</h1>
      <p className="subtitle">یک خطای غیرمنتظره رخ داد. دوباره تلاش کن.</p>
      <button type="button" className="primary" style={{ maxWidth: "18rem" }} onClick={retry}>
        تلاش دوباره
      </button>
    </main>
  );
}
