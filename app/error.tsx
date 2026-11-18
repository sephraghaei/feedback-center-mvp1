"use client";

import { useEffect } from "react";
import BrandMark from "@/app/components/brand-mark";
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

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.theme) return;
    let next = "light";
    try {
      const stored = localStorage.getItem("fc-theme");
      next =
        stored === "dark" || stored === "light"
          ? stored
          : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    } catch {}
    root.dataset.theme = next;
  }, []);

  return (
    <main className="page">
      <BrandMark className="error-mark" />
      <h1 className="error-title">Something went wrong</h1>
      <p className="subtitle">An unexpected error occurred. Please try again.</p>
      <button type="button" className="primary" style={{ maxWidth: "18rem" }} onClick={retry}>
        Try again
      </button>
    </main>
  );
}
