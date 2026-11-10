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
            --paper: #08090a; --surface: #0f1011; --hairline: #23252a; --ink: #ffffff;
            --ink-3: #8a8f98; --accent: #e4f222; --on-accent: #08090a;
          }
          :root[data-theme="light"] {
            --paper: #ffffff; --surface: #fafafa; --hairline: #e5e5e6; --ink: #08090a;
            --ink-3: #62666d; --accent: #e4f222; --on-accent: #08090a;
          }
        `}</style>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("fc-theme");if(t!=="light"&&t!=="dark"){t="dark";}document.documentElement.dataset.theme=t;}catch(e){}',
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
            "radial-gradient(55% 45% at 50% 0%, rgba(138, 143, 152, 0.1) 0%, transparent 72%), var(--paper)",
          color: "var(--ink)",
          fontFamily: '"Vazirmatn Variable", Vazirmatn, system-ui, sans-serif',
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <main>
          <h1
            style={{
              margin: 0,
              fontSize: "2.125rem",
              fontWeight: 590,
              letterSpacing: "-0.022em",
              lineHeight: 1.1,
            }}
          >
            مشکلی پیش آمد
          </h1>
          <p style={{ color: "var(--ink-3)", marginTop: "0.6rem", fontSize: "0.9rem" }}>
            یک خطای غیرمنتظره رخ داد. دوباره تلاش کن.
          </p>
          <button
            type="button"
            onClick={retry}
            style={{
              marginTop: "1.25rem",
              border: "1px solid var(--accent)",
              borderRadius: "6px",
              background: "var(--accent)",
              color: "var(--on-accent)",
              fontFamily: "inherit",
              fontSize: "0.875rem",
              fontWeight: 510,
              padding: "10px 16px",
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
