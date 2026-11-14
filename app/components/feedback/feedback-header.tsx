"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "../theme-toggle";

type HeaderViewer = { name: string; role: "customer" | "admin" } | null;

const LINKS = [
  { href: "/feed", label: "بازخوردها" },
  { href: "/roadmap", label: "نقشه راه" },
  { href: "/changelog", label: "تغییرات" },
];

export default function FeedbackHeader({ viewer, admin }: { viewer: HeaderViewer; admin: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = viewer ? [...LINKS, { href: "/requests", label: "درخواست‌های من" }] : LINKS;

  function isActive(href: string): boolean {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="site-nav">
      <div className="nav-inner">
        <Link href="/" className="nav-brand" aria-label="Feedback-center">
          <span className="brand-triangle" aria-hidden="true" />
          <span className="nav-name" dir="ltr">
            Feedback-center
          </span>
        </Link>

        <nav className={`fb-nav ${open ? "open" : ""}`} aria-label="بخش‌های بازخورد">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`fb-nav-link ${isActive(link.href) ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="fb-nav-actions">
          <ThemeToggle />
          {admin ? (
            <Link href="/admin" className="fb-link">
              پنل مدیر
            </Link>
          ) : null}
          {viewer ? (
            <span className="fb-user" title={viewer.name}>
              {viewer.name}
            </span>
          ) : (
            <Link href="/?next=/feed#account" className="fb-link">
              ورود
            </Link>
          )}
          <button
            type="button"
            className="fb-btn fb-btn-primary fb-compose-btn"
            onClick={() => {
              setOpen(false);
              window.dispatchEvent(new Event("fc:open-composer"));
            }}
          >
            ثبت بازخورد
          </button>
          <button
            type="button"
            className="fb-menu"
            aria-label="باز کردن منو"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
