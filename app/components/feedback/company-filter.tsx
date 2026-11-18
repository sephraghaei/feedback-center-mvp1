"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useT } from "@/lib/i18n/client";
import { ChevronDownIcon } from "./icons";

export default function CompanyFilter({
  companies,
  selected,
  sort,
}: {
  companies: string[];
  selected?: string;
  sort?: "newest";
}) {
  const t = useT();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const el = detailsRef.current;
      if (el?.open && !el.contains(event.target as Node)) el.open = false;
    }
    function onKeyDown(event: KeyboardEvent) {
      const el = detailsRef.current;
      if (event.key === "Escape" && el?.open) {
        el.open = false;
        el.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function close() {
    if (detailsRef.current) detailsRef.current.open = false;
  }

  function hrefFor(company?: string): string {
    const params = new URLSearchParams();
    if (company) params.set("company", company);
    if (sort === "newest") params.set("sort", "newest");
    const text = params.toString();
    return text ? `/feed?${text}` : "/feed";
  }

  return (
    <details className="fb-company" ref={detailsRef}>
      <summary className="fb-filter fb-company-trigger">
        <span className="fb-company-current" dir="auto">
          {selected ?? t("همه شرکت‌ها", "All companies")}
        </span>
        <ChevronDownIcon size={14} />
      </summary>
      <div className="fb-company-menu">
        <Link
          href={hrefFor()}
          className={`fb-company-item ${!selected ? "active" : ""}`}
          onClick={close}
        >
          {t("همه شرکت‌ها", "All companies")}
        </Link>
        {companies.map((company) => (
          <Link
            key={company}
            href={hrefFor(company)}
            className={`fb-company-item ${selected === company ? "active" : ""}`}
            dir="auto"
            onClick={close}
          >
            {company}
          </Link>
        ))}
      </div>
    </details>
  );
}
