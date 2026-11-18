"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export default function Avatar({
  name,
  src,
  size = 24,
  className,
}: {
  name: string | null | undefined;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const initial = (name ?? "").trim().charAt(0) || "?";
  const showImage = Boolean(src) && failedSrc !== src;
  const loaded = Boolean(src) && loadedSrc === src;

  useEffect(() => {
    const el = imgRef.current;
    if (!el || !el.complete) return;
    if (el.naturalWidth > 0) setLoadedSrc(src ?? null);
    else setFailedSrc(src ?? null);
  }, [src]);

  return (
    <span
      className={`fb-avatar${loaded ? " has-image" : ""}${className ? ` ${className}` : ""}`}
      style={{ "--avatar-size": `${size}px` } as CSSProperties}
      aria-hidden="true"
    >
      <span className="fb-avatar-initial">{initial}</span>
      {showImage ? (
        <img
          ref={imgRef}
          className="fb-avatar-img"
          src={src ?? undefined}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoadedSrc(src ?? null)}
          onError={() => setFailedSrc(src ?? null)}
        />
      ) : null}
    </span>
  );
}
