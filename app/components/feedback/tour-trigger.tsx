"use client";

import { useT } from "@/lib/i18n/client";
import { CompassIcon } from "./icons";

export default function TourTrigger({ className = "fb-path-tour" }: { className?: string }) {
  const t = useT();

  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event("fc:start-tour"))}
    >
      <CompassIcon />
      {t("یه دور کامل ببین", "Take the full tour")}
    </button>
  );
}
