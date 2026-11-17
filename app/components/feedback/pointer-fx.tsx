"use client";

import { useEffect } from "react";

type Mode = "spot" | "cursor" | "tilt";

const clamp = (value: number) => Math.max(-1, Math.min(1, value));

export default function PointerFx() {
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let pending: PointerEvent | null = null;
    const active: Partial<Record<Mode, HTMLElement>> = {};

    const reset = (mode: Mode) => {
      const el = active[mode];
      if (!el) return;
      if (mode === "spot") {
        el.style.removeProperty("--mx");
        el.style.removeProperty("--my");
      } else if (mode === "cursor") {
        el.style.removeProperty("--px");
        el.style.removeProperty("--py");
      } else {
        el.style.removeProperty("--tx");
        el.style.removeProperty("--ty");
      }
      delete active[mode];
    };

    const track = (mode: Mode, el: HTMLElement | null) => {
      if (active[mode] === el) return el;
      reset(mode);
      if (el) active[mode] = el;
      return el;
    };

    const paint = () => {
      frame = 0;
      const event = pending;
      pending = null;
      if (!event) return;

      const target = event.target instanceof Element ? event.target : null;

      const spot = track(
        "spot",
        target?.closest<HTMLElement>("[data-spotlight], [data-glow]") ?? null,
      );
      if (spot) {
        const rect = spot.getBoundingClientRect();
        spot.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        spot.style.setProperty("--my", `${event.clientY - rect.top}px`);
      }

      const cursor = track("cursor", target?.closest<HTMLElement>("[data-cursor]") ?? null);
      if (cursor) {
        const rect = cursor.getBoundingClientRect();
        const px = clamp(((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1);
        const py = clamp(((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
        cursor.style.setProperty("--px", px.toFixed(3));
        cursor.style.setProperty("--py", py.toFixed(3));
      }

      const tilt = track("tilt", target?.closest<HTMLElement>("[data-tilt]") ?? null);
      if (tilt) {
        const rect = tilt.getBoundingClientRect();
        const tx = clamp(((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1);
        const ty = clamp(((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
        tilt.style.setProperty("--tx", tx.toFixed(3));
        tilt.style.setProperty("--ty", ty.toFixed(3));
      }
    };

    const onMove = (event: PointerEvent) => {
      pending = event;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onLeave = () => {
      reset("spot");
      reset("cursor");
      reset("tilt");
    };

    const onOut = (event: PointerEvent) => {
      if (!event.relatedTarget) onLeave();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerout", onOut);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      onLeave();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerout", onOut);
    };
  }, []);

  return null;
}
