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
          background: "#000",
          color: "#f4f4f4",
          fontFamily: '"Vazirmatn Variable", Vazirmatn, system-ui, sans-serif',
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <main>
          <h1 style={{ margin: 0, fontSize: "2rem" }}>مشکلی پیش آمد</h1>
          <p style={{ color: "#8a8a8a", marginTop: "0.5rem" }}>
            یک خطای غیرمنتظره رخ داد. دوباره تلاش کن.
          </p>
          <button
            type="button"
            onClick={retry}
            style={{
              marginTop: "1rem",
              border: 0,
              borderRadius: "0.85rem",
              background: "#f4f4f4",
              color: "#0a0a0a",
              fontFamily: "inherit",
              fontSize: "0.95rem",
              fontWeight: 700,
              padding: "0.85rem 1.25rem",
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
