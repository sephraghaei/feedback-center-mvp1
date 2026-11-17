"use client";

import { CompassIcon } from "./icons";

export default function TourTrigger({ className = "fb-path-tour" }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event("fc:start-tour"))}
    >
      <CompassIcon />
      یه دور کامل ببین
    </button>
  );
}
