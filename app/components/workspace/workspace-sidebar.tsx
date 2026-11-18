"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { switchWorkspaceCompany } from "@/app/(workspace)/actions";
import { ClerkSignOutButton, LogoutButton } from "@/app/components/logout-buttons";
import ThemeToggle from "@/app/components/theme-toggle";

type Membership = { slug: string; name: string };

export default function WorkspaceSidebar({
  company,
  user,
  role,
  method,
  memberships,
}: {
  company: { slug: string; name: string };
  user: string;
  role: string;
  method: "phone" | "email" | "clerk";
  memberships: Membership[];
}) {
  const pathname = usePathname();

  const main = [
    { href: "/workspace", label: "Overview" },
    { href: "/workspace/feedback", label: "Feedback" },
    { href: "/workspace/roadmap", label: "Roadmap" },
    { href: "/workspace/updates", label: "Updates" },
  ];
  const companyLinks = [
    { href: "/workspace/team", label: "Team" },
    { href: "/workspace/settings", label: "Settings" },
  ];

  return (
    <aside className="wk-side">
      <Link href="/workspace" className="wk-brand">
        <span className="wk-brand-mark" aria-hidden="true">
          {company.name.slice(0, 1).toUpperCase()}
        </span>
        <span className="wk-brand-text">
          <strong>{company.name}</strong>
          <span>Company workspace</span>
        </span>
      </Link>

      {memberships.length > 1 ? (
        <form action={switchWorkspaceCompany} className="wk-side-switch">
          <label className="wk-nav-label" htmlFor="workspace-company">
            Switch company
          </label>
          <select
            id="workspace-company"
            name="slug"
            defaultValue={company.slug}
            className="bd-field"
            style={{ width: "100%" }}
          >
            {memberships.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {entry.name}
              </option>
            ))}
          </select>
          <button type="submit" className="wk-chip-btn">
            Switch
          </button>
        </form>
      ) : null}

      <nav className="wk-nav-group" aria-label="Workspace">
        <span className="wk-nav-label">Workspace</span>
        {main.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`wk-nav-link ${pathname === item.href ? "active" : ""}`}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <nav className="wk-nav-group" aria-label="Company">
        <span className="wk-nav-label">Company</span>
        {companyLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`wk-nav-link ${pathname === item.href ? "active" : ""}`}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="wk-side-foot">
        <div className="wk-side-links">
          <Link href={`/c/${company.slug}`} className="wk-nav-link">
            Public board ↗
          </Link>
          <Link href="/" className="wk-nav-link">
            Vasa home
          </Link>
        </div>
        <div className="wk-side-actions">
          <span className="wk-hint" title={role}>
            {user}
          </span>
          <ThemeToggle />
        </div>
        <div className="wk-side-actions">
          {method === "clerk" ? <ClerkSignOutButton /> : <LogoutButton />}
        </div>
      </div>
    </aside>
  );
}
