"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BrandMark from "../brand-mark";
import { ClerkSignOutButton, LogoutButton } from "../logout-buttons";
import ThemeToggle from "../theme-toggle";

type HeaderViewer = { name: string; role: "customer" | "admin"; method: "phone" | "email" | "clerk" } | null;

const LINKS = [
  { href: "/feed", label: "بازخوردها" },
  { href: "/roadmap", label: "نقشه راه" },
  { href: "/changelog", label: "تغییرات" },
];

const METHOD_LABELS: Record<"phone" | "email" | "clerk", string> = {
  phone: "ورود با شماره موبایل",
  email: "ورود با ایمیل",
  clerk: "ورود با ایمیل یا گوگل",
};

export default function FeedbackHeader({ viewer, admin }: { viewer: HeaderViewer; admin: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const links = viewer ? [...LINKS, { href: "/requests", label: "درخواست‌های من" }] : LINKS;

  function isActive(href: string): boolean {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  useEffect(() => {
    if (!profileOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [profileOpen]);

  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  return (
    <header className="site-nav">
      <div className="nav-inner">
        <Link href="/" className="nav-brand" aria-label="Feedback-center">
          <BrandMark className="nav-mark" />
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
            <div className="fb-profile" ref={profileRef}>
              <button
                type="button"
                className="fb-profile-btn"
                onClick={() => setProfileOpen((value) => !value)}
                aria-expanded={profileOpen}
                aria-haspopup="true"
                aria-label={`حساب ${viewer.name}`}
                title={viewer.name}
              >
                <span className="fb-avatar" aria-hidden="true">
                  {viewer.name.trim().charAt(0)}
                </span>
                <span className="fb-profile-name">{viewer.name}</span>
                <svg
                  className="fb-profile-caret"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {profileOpen ? (
                <div className="fb-profile-menu">
                  <div className="fb-profile-head">
                    <strong>{viewer.name}</strong>
                    <span>{METHOD_LABELS[viewer.method]}</span>
                  </div>
                  <Link href="/requests" className="fb-profile-item" onClick={() => setProfileOpen(false)}>
                    درخواست‌های من
                  </Link>
                  {viewer.method === "clerk" ? <ClerkSignOutButton /> : <LogoutButton />}
                </div>
              ) : null}
            </div>
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
