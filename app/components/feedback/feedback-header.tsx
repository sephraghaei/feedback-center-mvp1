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

const LINKS: { href: string; label: string }[] = [
  { href: "/feed", label: "فید‌بک‌ها" },
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
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (!open) return;
    const mobile = window.matchMedia("(max-width: 760px)");
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        return;
      }
      const nav = navRef.current;
      if (event.key !== "Tab" || !mobile.matches || !nav) return;
      const focusable = Array.from(
        nav.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const onViewportChange = () => {
      if (!mobile.matches) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    mobile.addEventListener("change", onViewportChange);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (mobile.matches) {
      navRef.current?.querySelector<HTMLElement>(".fb-nav-link")?.focus();
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      mobile.removeEventListener("change", onViewportChange);
      document.body.style.overflow = previous;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function closeMenu() {
    setOpen(false);
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  }

  return (
    <header className="site-nav">
      <div className="nav-inner">
        <Link href="/" className="nav-brand" aria-label="وسا">
          <BrandMark className="nav-mark" />
          <span className="nav-name">وسا</span>
        </Link>

        {open ? (
          <div className="fb-nav-scrim" aria-hidden="true" onClick={closeMenu} />
        ) : null}

        <nav
          ref={navRef}
          id="fb-nav"
          className={`fb-nav ${open ? "open" : ""}`}
          aria-label="بخش‌های فید‌بک"
        >
          <div className="fb-sheet-head">
            <span className="fb-sheet-grab" aria-hidden="true" />
            <div className="fb-sheet-row">
              <span className="fb-sheet-title">منو</span>
              <button
                type="button"
                className="fb-sheet-close"
                onClick={closeMenu}
                aria-label="بستن منو"
              >
                بستن
              </button>
            </div>
          </div>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`fb-nav-link ${isActive(link.href) ? "active" : ""}`}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
          {!viewer ? (
            <Link
              href="/?next=/feed#account"
              className="fb-nav-link fb-nav-login"
              onClick={closeMenu}
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
            فید‌بک بده
          </button>
          <button
            ref={menuButtonRef}
            type="button"
            className="fb-menu"
            aria-label={open ? "بستن منو" : "باز کردن منو"}
            aria-expanded={open}
            aria-controls="fb-nav"
            onClick={() => (open ? closeMenu() : setOpen(true))}
          >
            <MenuIcon size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
