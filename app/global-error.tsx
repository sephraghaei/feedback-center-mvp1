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
          :root {
            --paper: #fcfcfc; --wash: #f0f4fe; --ink: #020520; --ink-3: #374151;
            --accent: #145aff; --on-accent: #ffffff; --accent-soft: #f0f4fe;
          }
          :root[data-theme="dark"] {
            --paper: #05070f; --wash: #101a33; --ink: #f2f5ff; --ink-3: #a3adc6;
            --accent: #3b82f6; --on-accent: #ffffff; --accent-soft: rgba(59, 130, 246, 0.16);
          }
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
          background:
            "radial-gradient(60% 50% at 50% 0%, var(--wash) 0%, transparent 72%), var(--paper)",
          color: "var(--ink)",
          fontFamily: '"Vazirmatn Variable", Vazirmatn, system-ui, sans-serif',
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <main>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 600 }}>
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
              border: "1px solid var(--accent)",
              borderRadius: "9999px",
              background: "var(--accent)",
              color: "var(--on-accent)",
              fontFamily: "inherit",
              fontSize: "0.9rem",
              fontWeight: 600,
              padding: "0.72rem 1.4rem",
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
