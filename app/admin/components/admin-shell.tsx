"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import BrandMark from "../../components/brand-mark";
import ThemeToggle from "../../components/theme-toggle";
import { formatNumber } from "@/lib/feedback/labels";
import { useLocale, useT } from "@/lib/i18n/client";
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
  const locale = useLocale();
  const t = useT();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const items: NavItem[] = [
    { href: "/admin", label: t("داشبورد", "Dashboard"), icon: "dashboard", exact: true },
    { href: "/admin/inbox", label: t("صندوق پشتیبانی", "Support inbox"), icon: "mail", badge: openSupport },
    { href: "/admin/posts", label: t("مدیریت فیدبک‌ها", "Feedback"), icon: "list", badge: feedbackCount },
    { href: "/admin/changelog", label: t("تغییرات", "Updates"), icon: "calendar" },
    { href: "/admin/users", label: t("مدیریت کاربران", "Users"), icon: "users", badge: userCount },
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
            <span className="brand-name">{t("وسا", "Vasa")}</span>
            <br />
            <span className="brand-sub">{t("پنل مدیریت", "Admin panel")}</span>
          </span>
        </div>

        <nav className="side-section" aria-label={t("بخش‌های پنل", "Panel sections")}>
          <p className="side-label">{t("کلی", "General")}</p>
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
                <span className="badge">{formatNumber(item.badge, locale)}</span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="side-footer">
          <div className="side-card">
            <p>
              {t(
                "این پنل فقط با رمز عبور مدیر باز می‌شود و به داده‌های زنده کاربران وصل است.",
                "This panel opens with the admin password only and works on live user data.",
              )}
            </p>
            <Link href="/" className="btn btn-ghost" onClick={() => setOpen(false)}>
              <Icon name="external" size={15} />
              {t("بازگشت به سایت", "Back to site")}
            </Link>
          </div>
          <button type="button" className="btn btn-ghost" onClick={logout} disabled={leaving}>
            <Icon name="logout" size={16} />
            {leaving ? t("در حال خروج...", "Signing out...") : t("خروج از پنل", "Sign out")}
          </button>
          <p className="side-version">{t("نسخه ۱.۰.۰", "Version 1.0.0")}</p>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="btn btn-icon menu-btn"
            onClick={() => setOpen((v) => !v)}
            aria-label={t("باز کردن منو", "Open menu")}
          >
            <Icon name="menu" size={20} />
          </button>
          <nav className="crumb" aria-label={t("مسیر", "Breadcrumb")}>
            <Link href="/admin">{t("پنل مدیریت", "Admin panel")}</Link>
            <span className="crumb-sep">/</span>
            <span className="current">
              <Icon name={active.icon} size={15} />
              {active.label}
            </span>
          </nav>
          <span className="topbar-user">
            <span className="topbar-avatar">{t("م", "A")}</span>
            {t("مدیر", "Admin")}
          </span>
          <ThemeToggle />
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}