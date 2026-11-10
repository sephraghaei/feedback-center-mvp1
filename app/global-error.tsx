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
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <style>{`
          :root { --paper: #fafafa; --ink: #171717; --ink-3: #666666; --btn-ink: #ffffff; }
          :root[data-theme="dark"] { --paper: #000000; --ink: #ededed; --ink-3: #8f8f8f; --btn-ink: #0a0a0a; }
        `}</style>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("fc-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.dataset.theme=t;}catch(e){}',
          }}
        />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "var(--paper)",
          color: "var(--ink)",
          fontFamily: '"Vazirmatn Variable", Vazirmatn, system-ui, sans-serif',
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <main>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 500, letterSpacing: "-0.025em" }}>
            مشکلی پیش آمد
          </h1>
          <p style={{ color: "var(--ink-3)", marginTop: "0.5rem" }}>
            یک خطای غیرمنتظره رخ داد. دوباره تلاش کن.
          </p>
          <button
            type="button"
            onClick={retry}
            style={{
              marginTop: "1rem",
              border: "1px solid var(--ink)",
              borderRadius: "6px",
              background: "var(--ink)",
              color: "var(--btn-ink)",
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
