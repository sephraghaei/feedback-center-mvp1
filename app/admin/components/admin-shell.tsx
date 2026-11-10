"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toPersianDigits } from "@/lib/phone";
import { Icon } from "./bits";
import ThemeToggle from "../../components/theme-toggle";

export default function AdminShell({
  userCount,
  children,
}: {
  userCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const isUsers = pathname.startsWith("/admin/users");
  const current = isUsers ? "مدیریت کاربران" : "داشبورد";

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
          <span className="brand-mark">
            <span className="brand-triangle" aria-hidden="true" />
          </span>
          <span>
            <span className="brand-name">Feedback-center</span>
            <br />
            <span className="brand-sub">پنل مدیریت</span>
          </span>
        </div>

        <nav className="side-section" aria-label="بخش‌های پنل">
          <p className="side-label">کلی</p>
          <Link
            href="/admin"
            className={`side-link ${!isUsers ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            <Icon name="dashboard" />
            داشبورد
          </Link>
          <Link
            href="/admin/users"
            className={`side-link ${isUsers ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            <Icon name="users" />
            مدیریت کاربران
            <span className="badge">{toPersianDigits(String(userCount))}</span>
          </Link>
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
              <Icon name={isUsers ? "users" : "dashboard"} size={15} />
              {current}
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