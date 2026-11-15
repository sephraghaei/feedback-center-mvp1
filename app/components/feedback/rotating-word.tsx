"use client";

import { useEffect, useState } from "react";

const WORDS = ["وب‌سایت", "اپلیکیشن", "فروشگاه", "محصول"];
const SWAP_MS = 2800;

export default function RotatingWord() {
  const [index, setIndex] = useState({ active: 0, previous: -1 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setIndex((current) => ({
        active: (current.active + 1) % WORDS.length,
        previous: current.active,
      }));
    }, SWAP_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="fb-rotate" aria-hidden="true">
      {WORDS.map((word, position) => (
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
