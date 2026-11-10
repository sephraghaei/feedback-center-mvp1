"use client";

import { useEffect } from "react";
import { clientLogger } from "@/lib/client-logger";

export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    clientLogger.error("ui.global_error", {
      message: "Global error boundary caught an error",
      error,
      context: { boundary: "global" },
    });
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#fafafa",
          color: "#171717",
          fontFamily: '"Vazirmatn Variable", Vazirmatn, system-ui, sans-serif',
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <main>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 500, letterSpacing: "-0.025em" }}>
            مشکلی پیش آمد
          </h1>
          <p style={{ color: "#666666", marginTop: "0.5rem" }}>
            یک خطای غیرمنتظره رخ داد. دوباره تلاش کن.
          </p>
          <button
            type="button"
            onClick={retry}
            style={{
              marginTop: "1rem",
              border: "1px solid #171717",
              borderRadius: "6px",
              background: "#171717",
              color: "#ffffff",
              fontFamily: "inherit",
              fontSize: "0.9rem",
              fontWeight: 500,
              padding: "0.72rem 1.25rem",
              cursor: "pointer",
            }}
          >
            تلاش دوباره
          </button>
        </main>
      </body>
    </html>
  );
}
