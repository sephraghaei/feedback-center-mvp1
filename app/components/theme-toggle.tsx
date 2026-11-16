"use client";

import { MoonIcon, SunIcon } from "@/app/components/feedback/icons";

function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try {
    localStorage.setItem("fc-theme", next);
  } catch {
    // Private mode can block storage; the toggle still works for this visit.
  }
}

export default function ThemeToggle() {
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="تغییر حالت روشن و تاریک"
      title="تغییر حالت روشن و تاریک"
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
