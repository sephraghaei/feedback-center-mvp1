"use client";

import type { ReactNode } from "react";
import { useT } from "@/lib/i18n/client";

export default function ComposerButton({
  children,
  className = "fb-btn fb-btn-primary",
}: {
  children?: ReactNode;
  className?: string;
}) {
  const t = useT();

  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event("fc:open-composer"))}
    >
      {children ?? t("ثبت فیدبک", "Submit feedback")}
    </button>
  );
}
