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
  const [failedOrigin, setFailedOrigin] = useState<string | null>(null);
  const [loadedOrigin, setLoadedOrigin] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const showIcon = Boolean(brand.origin) && failedOrigin !== brand.origin;
  const loaded = Boolean(brand.origin) && loadedOrigin === brand.origin;

  useEffect(() => {
    const el = imgRef.current;
    if (!el || !el.complete) return;
    if (el.naturalWidth > 0) setLoadedOrigin(brand.origin);
    else setFailedOrigin(brand.origin);
  }, [brand.origin]);

  return (
    <span
      className={`fb-mark${loaded ? " has-icon" : ""}${className ? ` ${className}` : ""}`}
      style={
        {
          "--mark-size": `${size}px`,
          "--mark-hue": brand.hue,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <span className="fb-mark-initial">{brand.initial}</span>
      {showIcon && brand.origin ? (
        <img
          ref={imgRef}
          className="fb-mark-img"
          src={`${brand.origin}/favicon.ico`}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setLoadedOrigin(brand.origin)}
          onError={() => setFailedOrigin(brand.origin)}
        />
      ) : null}
    </span>
  );
}
