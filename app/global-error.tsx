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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("fc-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.dataset.theme=t;}catch(e){}',
          }}
        />
        <style>{`
          :root {
            color-scheme: light;
            --paper: #fafafa; --surface: #ffffff; --hairline: #ebebeb; --ink: #171717;
            --ink-3: #666666; --accent: #171717; --on-accent: #ffffff; --mark: #000000;
          }
          :root[data-theme="dark"] {
            color-scheme: dark;
            --paper: #0a0a0a; --surface: #111111; --hairline: #262626; --ink: #ededed;
            --ink-3: #a1a1a1; --accent: #ededed; --on-accent: #0a0a0a; --mark: #ededed;
          }
        `}</style>
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
          <span
            aria-hidden="true"
            style={{
              display: "block",
              width: "22px",
              height: "19px",
              margin: "0 auto 1rem",
              background: "var(--mark)",
              clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
            }}
          />
          <h1
            style={{
              margin: 0,
              fontSize: "2.125rem",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
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
              fontWeight: 500,
              padding: "10px 20px",
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
