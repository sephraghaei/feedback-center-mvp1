"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageToggle from "@/app/components/language-toggle";
import ThemeToggle from "@/app/components/theme-toggle";
import { PlusIcon, SearchIcon } from "@/app/components/feedback/icons";
import { useT } from "@/lib/i18n/client";

type Company = { slug: string; name: string; tagline: string | null };

export default function BoardHeader({
  company,
  viewerName,
  member,
  query,
}: {
  company: Company;
  viewerName: string | null;
  member: boolean;
  query?: string;
}) {
  const t = useT();
  const pathname = usePathname();
  const base = `/c/${company.slug}`;

  const tabs = [
    { href: base, label: t("فیدبک", "Feedback") },
    { href: `${base}/roadmap`, label: t("نقشه راه", "Roadmap") },
    { href: `${base}/updates`, label: t("تغییرات", "Updates") },
  ];

  function isActive(href: string): boolean {
    if (href === base) {
      return pathname === base || pathname.startsWith(`${base}/p/`);
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="bd-nav">
      <div className="bd-nav-inner">
        <Link href={base} className="bd-brand">
          <span className="bd-brand-mark" aria-hidden="true">
            {company.name.slice(0, 1).toUpperCase()}
          </span>
          <span className="bd-brand-name">{company.name}</span>
        </Link>
        {company.tagline ? <span className="bd-brand-tag">{company.tagline}</span> : null}

        <nav className="bd-tabs" aria-label={t(`صفحه‌های ${company.name}`, `${company.name} pages`)}>
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`bd-tab ${isActive(tab.href) ? "active" : ""}`}
              aria-current={isActive(tab.href) ? "page" : undefined}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <div className="bd-nav-side">
          <form className="bd-search" action={base} method="get" role="search">
            <SearchIcon size={14} />
            <input
              type="search"
              name="q"
              defaultValue={query ?? ""}
              placeholder={t("جستجو", "Search")}
              aria-label={t("جستجوی فیدبک", "Search feedback")}
            />
          </form>
          {member ? (
            <Link href="/workspace" className="bd-nav-link quiet">
              {t("مدیریت", "Manage")}
            </Link>
          ) : null}
          {viewerName ? (
            <Link href="/requests" className="bd-nav-link quiet">
              {viewerName.split(" ")[0]}
            </Link>
          ) : (
            <Link href={`/?next=${encodeURIComponent(base)}#account`} className="bd-nav-link">
              {t("ورود", "Log in")}
            </Link>
          )}
          <LanguageToggle className="bd-nav-link" />
          <ThemeToggle />
          <Link href={`${base}/new`} className="bd-submit">
            <PlusIcon size={14} />
            <span>{t("ثبت فیدبک", "Submit feedback")}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
