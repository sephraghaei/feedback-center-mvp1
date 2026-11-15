"use client";

import { useEffect } from "react";

export default function PointerFx() {
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let pending: PointerEvent | null = null;
    let lastSpot: HTMLElement | null = null;

    const paint = () => {
      frame = 0;
      const event = pending;
      pending = null;
      if (!event) return;

      const target = event.target instanceof Element ? event.target : null;

      const spot = target?.closest<HTMLElement>("[data-spotlight]") ?? null;
      if (lastSpot && lastSpot !== spot) {
        lastSpot.style.removeProperty("--mx");
        lastSpot.style.removeProperty("--my");
      }
      lastSpot = spot;
      if (spot) {
        const rect = spot.getBoundingClientRect();
        spot.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        spot.style.setProperty("--my", `${event.clientY - rect.top}px`);
      }
    };

    const onMove = (event: PointerEvent) => {
      pending = event;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onLeave = () => {
      if (lastSpot) {
        lastSpot.style.removeProperty("--mx");
        lastSpot.style.removeProperty("--my");
        lastSpot = null;
      }
    };

    const onOut = (event: PointerEvent) => {
      if (!event.relatedTarget) onLeave();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerout", onOut);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerout", onOut);
    };
  }, []);

  return null;
}
