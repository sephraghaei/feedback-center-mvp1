"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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
    { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
    { href: "/admin/inbox", label: "Support inbox", icon: "mail", badge: openSupport },
    { href: "/admin/posts", label: "Feedback", icon: "list", badge: feedbackCount },
    { href: "/admin/changelog", label: "Updates", icon: "calendar" },
    { href: "/admin/users", label: "Users", icon: "users", badge: userCount },
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
            <span className="brand-name">Vasa</span>
            <br />
            <span className="brand-sub">Admin panel</span>
          </span>
        </div>

        <nav className="side-section" aria-label="Panel sections">
          <p className="side-label">General</p>
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
                <span className="badge">{item.badge}</span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="side-footer">
          <div className="side-card">
            <p>This panel opens with the admin password only and works on live user data.</p>
            <Link href="/" className="btn btn-ghost" onClick={() => setOpen(false)}>
              <Icon name="external" size={15} />
              Back to site
            </Link>
          </div>
          <button type="button" className="btn btn-ghost" onClick={logout} disabled={leaving}>
            <Icon name="logout" size={16} />
            {leaving ? "Signing out..." : "Sign out"}
          </button>
          <p className="side-version">Version 1.0.0</p>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="btn btn-icon menu-btn"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open menu"
          >
            <Icon name="menu" size={20} />
          </button>
          <nav className="crumb" aria-label="Breadcrumb">
            <Link href="/admin">Admin panel</Link>
            <span className="crumb-sep">/</span>
            <span className="current">
              <Icon name={active.icon} size={15} />
              {active.label}
            </span>
          </nav>
          <span className="topbar-user">
            <span className="topbar-avatar">A</span>
            Admin
          </span>
          <ThemeToggle />
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}