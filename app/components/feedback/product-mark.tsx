"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { ProductBrand } from "@/lib/feedback/product";

export default function ProductMark({
  brand,
  size = 40,
  className,
}: {
  brand: ProductBrand;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState<string[]>([]);
  const [loaded, setLoaded] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const sources =
    brand.host && brand.origin
      ? [
          `https://unavatar.io/${brand.host}?fallback=false`,
          `${brand.origin}/favicon.ico`,
        ]
      : [];
  const src = sources.find((candidate) => !failed.includes(candidate)) ?? null;
  const showIcon = src !== null && loaded === src;

  useEffect(() => {
    const el = imgRef.current;
    if (!el || !src || !el.complete) return;
    if (el.naturalWidth > 0) setLoaded(src);
    else setFailed((current) => (current.includes(src) ? current : [...current, src]));
  }, [src]);

  return (
    <span
      className={`fb-mark${showIcon ? " has-icon" : ""}${className ? ` ${className}` : ""}`}
      style={
        {
          "--mark-size": `${size}px`,
          "--mark-hue": brand.hue,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <span className="fb-mark-initial">{brand.initial}</span>
      {src ? (
        <img
          key={src}
          ref={imgRef}
          className="fb-mark-img"
          src={src}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(src)}
          onError={() =>
            setFailed((current) => (current.includes(src) ? current : [...current, src]))
          }
        />
      ) : null}
    </span>
  );
}
