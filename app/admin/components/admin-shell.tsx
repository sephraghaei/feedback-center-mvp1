"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toPersianDigits } from "@/lib/phone";
import BrandMark from "../../components/brand-mark";
import ThemeToggle from "../../components/theme-toggle";
import { Icon, type IconName } from "./bits";

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  exact?: boolean;
  badge?: number;
};

export default function AdminShell({
  userCount,
  openSupport,
  feedbackCount,
  children,
}: {
  userCount: number;
  openSupport: number;
  feedbackCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const items: NavItem[] = [
    { href: "/admin", label: "داشبورد", icon: "dashboard", exact: true },
    { href: "/admin/inbox", label: "صندوق پشتیبانی", icon: "mail", badge: openSupport },
    { href: "/admin/posts", label: "مدیریت بازخوردها", icon: "list", badge: feedbackCount },
    { href: "/admin/changelog", label: "تغییرات", icon: "calendar" },
    { href: "/admin/users", label: "مدیریت کاربران", icon: "users", badge: userCount },
  ];

  const active =
    items.find((item) =>
      item.exact ? pathname === item.href : pathname.startsWith(item.href),
    ) ?? items[0];

  async function logout() {
    setLeaving(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } finally {
      setLeaving(false);
    }
  }

  return (
    <div className="admin-shell">
      {open ? <div className="side-scrim" onClick={() => setOpen(false)} /> : null}

      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <div className="side-brand">
          <BrandMark className="brand-mark" />
          <span>
            <span className="brand-name">Feedback-center</span>
            <br />
            <span className="brand-sub">پنل مدیریت</span>
          </span>
        </div>

        <nav className="side-section" aria-label="بخش‌های پنل">
          <p className="side-label">کلی</p>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`side-link ${active.href === item.href ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <Icon name={item.icon} />
              {item.label}
              {typeof item.badge === "number" && item.badge > 0 ? (
                <span className="badge">{toPersianDigits(String(item.badge))}</span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="side-footer">
          <div className="side-card">
            <p>این پنل فقط با رمز عبور مدیر باز می‌شود و به داده‌های زنده کاربران وصل است.</p>
            <Link href="/" className="btn btn-ghost" onClick={() => setOpen(false)}>
              <Icon name="external" size={15} />
              بازگشت به سایت
            </Link>
          </div>
          <button type="button" className="btn btn-ghost" onClick={logout} disabled={leaving}>
            <Icon name="logout" size={16} />
            {leaving ? "در حال خروج..." : "خروج از پنل"}
          </button>
          <p className="side-version">نسخه ۱٫۰٫۰</p>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="btn btn-icon menu-btn"
            onClick={() => setOpen((v) => !v)}
            aria-label="باز کردن منو"
          >
            <Icon name="menu" size={20} />
          </button>
          <nav className="crumb" aria-label="مسیر">
            <Link href="/admin">پنل مدیریت</Link>
            <span className="crumb-sep">/</span>
            <span className="current">
              <Icon name={active.icon} size={15} />
              {active.label}
            </span>
          </nav>
          <span className="topbar-user">
            <span className="topbar-avatar">م</span>
            مدیر
          </span>
          <ThemeToggle />
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}