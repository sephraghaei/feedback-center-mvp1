"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BrandMark from "../brand-mark";
import { ClerkSignOutButton, LogoutButton } from "../logout-buttons";
import ThemeToggle from "../theme-toggle";
import { mediaUrl } from "@/lib/feedback/media";
import Avatar from "./avatar";
import { ChevronDownIcon, CompassIcon, MenuIcon, PlusIcon } from "./icons";

type HeaderViewer = {
  name: string;
  role: "customer" | "admin";
  method: "phone" | "email" | "clerk";
  avatarPath: string | null;
} | null;

const LINKS: { href: string; label: string; soon?: boolean }[] = [
  { href: "/feed", label: "فید‌بک‌ها" },
  { href: "/roadmap", label: "نقشه راه", soon: true },
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
        <Link href="/" className="nav-brand" aria-label="وسا">
          <BrandMark className="nav-mark" />
          <span className="nav-name">وسا</span>
        </Link>

        <nav className={`fb-nav ${open ? "open" : ""}`} aria-label="بخش‌های فید‌بک">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`fb-nav-link ${isActive(link.href) ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              {link.label}{" "}
              {link.soon ? <span className="fb-soon">به زودی</span> : null}
            </Link>
          ))}
          {!viewer ? (
            <Link
              href="/?next=/feed#account"
              className="fb-nav-link fb-nav-login"
              onClick={() => setOpen(false)}
            >
              ورود به حساب
            </Link>
          ) : null}
        </nav>

        <div className="fb-nav-actions">
          <ThemeToggle />
          <button
            type="button"
            className="fb-tour-btn"
            onClick={() => {
              setOpen(false);
              window.dispatchEvent(new Event("fc:start-tour"));
            }}
            aria-label="آموزش سریع سایت"
            title="آموزش سریع"
          >
            <CompassIcon size={16} />
            <span>آموزش</span>
          </button>
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
                <Avatar
                  name={viewer.name}
                  src={viewer.avatarPath ? mediaUrl(viewer.avatarPath) : null}
                  size={24}
                />
                <span className="fb-profile-name">{viewer.name}</span>
                <ChevronDownIcon size={10} className="fb-profile-caret" />
              </button>

              {profileOpen ? (
                <div className="fb-profile-menu">
                  <div className="fb-profile-head">
                    <strong>{viewer.name}</strong>
                    <span>{METHOD_LABELS[viewer.method]}</span>
                  </div>
                  <Link href="/profile" className="fb-profile-item" onClick={() => setProfileOpen(false)}>
                    پروفایل من
                  </Link>
                  <Link href="/requests" className="fb-profile-item" onClick={() => setProfileOpen(false)}>
                    درخواست‌های من
                  </Link>
                  {viewer.method === "clerk" ? <ClerkSignOutButton /> : <LogoutButton />}
                </div>
              ) : null}
            </div>
          ) : (
            <Link href="/?next=/feed#account" className="fb-link fb-login-inline">
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
            <PlusIcon size={15} />
            ثبت فید‌بک
          </button>
          <button
            type="button"
            className="fb-menu"
            aria-label="باز کردن منو"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <MenuIcon size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
