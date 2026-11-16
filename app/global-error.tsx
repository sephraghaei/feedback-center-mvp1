"use client";

import { useEffect } from "react";
import { clientLogger } from "@/lib/client-logger";
import { Estedad } from "./fonts";

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
            --paper: #f4f7fd; --surface: #ffffff; --hairline: #e1e8f4; --ink: #0d1b33;
            --ink-3: #5a6b87; --accent: #2563eb; --on-accent: #ffffff; --mark: #1d4ed8;
          }
          :root[data-theme="dark"] {
            color-scheme: dark;
            --paper: #0f1218; --surface: #151922; --hairline: #262c38; --ink: #dfe4ee;
            --ink-3: #96a0b2; --accent: #e4e9f2; --on-accent: #10131a; --mark: #e4e9f2;
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
          fontFamily: Estedad.style.fontFamily,
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
