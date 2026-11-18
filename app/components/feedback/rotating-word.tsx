"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/client";

const SWAP_MS = 2800;

export default function RotatingWord() {
  const t = useT();
  const words = ["وب‌سایت", "اپلیکیشن", "فروشگاه", "محصول"].map((word, position) =>
    t(word, ["website", "app", "store", "product"][position]),
  );
  const [index, setIndex] = useState({ active: 0, previous: -1 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setIndex((current) => ({
        active: (current.active + 1) % words.length,
        previous: current.active,
      }));
    }, SWAP_MS);

    return () => window.clearInterval(timer);
  }, [words.length]);

  return (
    <span className="fb-rotate" aria-hidden="true">
      {words.map((word, position) => (
        <span
          key={word}
          className={
            position === index.active
              ? "fb-rotate-word is-active"
              : position === index.previous
                ? "fb-rotate-word is-leaving"
                : "fb-rotate-word"
          }
        >
          {word}
        </span>
      ))}
    </span>
  );
}
