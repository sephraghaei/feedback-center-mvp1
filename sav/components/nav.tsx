"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";

export type NavItem = {
  href: string;
  label: string;
  icon: "feed" | "search" | "bookmark" | "bell" | "sliders" | "user";
  badge?: number;
};

export function DesktopNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link flex items-center gap-1.5 ${active ? "nav-link-active" : ""}`}
          >
            {item.label}
            {item.badge ? (
              <span className="rounded-full bg-urgent px-1.5 py-0.5 text-[0.6rem] font-semibold text-white">
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur md:hidden"
      aria-label="Main"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2 py-1.5">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-w-14 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[0.62rem] font-medium ${
                active ? "text-brand" : "text-ink-3"
              }`}
            >
              <Icon name={item.icon} size={19} />
              {item.badge ? (
                <span className="absolute top-0 end-2 rounded-full bg-urgent px-1 text-[0.55rem] font-semibold leading-4 text-white">
                  {item.badge}
                </span>
              ) : null}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
