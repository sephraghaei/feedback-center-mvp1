"use client";

import type { ReactNode } from "react";

export default function ComposerButton({
  children = "ثبت بازخورد",
  className = "fb-btn fb-btn-primary",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event("fc:open-composer"))}
    >
      {children}
    </button>
  );
}
