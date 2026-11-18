"use client";

import type { MouseEvent } from "react";
import { MoonIcon, SunIcon } from "@/app/components/feedback/icons";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => unknown;
};

function applyTheme(next: "light" | "dark") {
  const root = document.documentElement;
  root.dataset.theme = next;
  try {
    localStorage.setItem("fc-theme", next);
  } catch {
    // Private mode can block storage; the toggle still works for this visit.
  }
}

function toggleTheme(event: MouseEvent<HTMLButtonElement>) {
  const root = document.documentElement;
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  const doc = document as ViewTransitionDocument;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!doc.startViewTransition || reduce) {
    applyTheme(next);
    return;
  }

  const rect = event.currentTarget.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  root.style.setProperty("--vt-x", `${x}px`);
  root.style.setProperty("--vt-y", `${y}px`);
  root.style.setProperty("--vt-r", `${radius}px`);

  doc.startViewTransition(() => applyTheme(next));
}

export default function ThemeToggle() {
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle light and dark theme"
      title="Toggle light and dark theme"
    >
      <span className="theme-icon theme-icon-moon" aria-hidden="true">
        <MoonIcon size={16} />
      </span>
      <span className="theme-icon theme-icon-sun" aria-hidden="true">
        <SunIcon size={16} />
      </span>
    </button>
  );
}
