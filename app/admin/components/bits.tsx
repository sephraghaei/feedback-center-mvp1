import type { CSSProperties } from "react";
import type { UserMethod } from "@/lib/admin-store";

export type IconName =
  | "dashboard" | "users" | "logout" | "search" | "plus" | "edit" | "trash"
  | "close" | "chevron-down" | "chevron-left" | "chevron-right" | "table"
  | "board" | "list" | "sort" | "arrow-up" | "arrow-down" | "home" | "lock"
  | "eye" | "eye-off" | "check" | "alert" | "menu" | "external" | "calendar"
  | "mail" | "phone" | "sparkle" | "user" | "chart" | "undo";

const PATHS: Record<IconName, React.ReactNode> = {
  dashboard: (<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>),
  users: (<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>),
  logout: (<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>),
  search: (<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></>),
  plus: (<><path d="M12 5v14" /><path d="M5 12h14" /></>),
  edit: (<><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></>),
  trash: (<><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M10 11v6" /><path d="M14 11v6" /></>),
  close: (<><path d="M18 6L6 18" /><path d="M6 6l12 12" /></>),
  "chevron-down": (<path d="M6 9l6 6 6-6" />),
  "chevron-left": (<path d="M15 18l-6-6 6-6" />),
  "chevron-right": (<path d="M9 18l6-6-6-6" />),
  table: (<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18" /><path d="M10 4v16" /></>),
  board: (<><rect x="3" y="4" width="5" height="16" rx="1.5" /><rect x="10" y="4" width="5" height="10" rx="1.5" /><rect x="17" y="4" width="4" height="13" rx="1.5" /></>),
  list: (<><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><path d="M3 6h.01" /><path d="M3 12h.01" /><path d="M3 18h.01" /></>),
  sort: (<><path d="M8 9l4-4 4 4" /><path d="M8 15l4 4 4-4" /></>),
  "arrow-up": (<><path d="M12 19V5" /><path d="M5 12l7-7 7 7" /></>),
  "arrow-down": (<><path d="M12 5v14" /><path d="M19 12l-7 7-7-7" /></>),
  home: (<><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>),
  lock: (<><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>),
  eye: (<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>),
  "eye-off": (<><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 8 10 8a9.74 9.74 0 0 0 5.39-1.61" /><path d="M2 2l20 20" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /></>),
  check: (<path d="M20 6L9 17l-5-5" />),
  alert: (<><circle cx="12" cy="12" r="9" /><path d="M12 8v4" /><path d="M12 16h.01" /></>),
  menu: (<><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>),
  external: (<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6" /><path d="M10 14L21 3" /></>),
  calendar: (<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></>),
  mail: (<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 6L2 7" /></>),
  phone: (<><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></>),
  sparkle: (<><path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2Z" /><path d="M19 15l.9 2.6L22 18l-2.1.4L19 21l-.9-2.6L16 18l2.1-.4Z" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></>),
  chart: (<><path d="M3 3v18h18" /><path d="M7 15l4-5 3 3 5-7" /></>),
  undo: (<><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-15-6.7L3 13" /></>),
};

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

const AVATAR_COLORS: [string, string][] = [
  ["#f4f4f4", "#8a8a8a"],
  ["#ffffff", "#a3a3a3"],
  ["#d4d4d4", "#6a6a6a"],
  ["#e8e8e8", "#9a9a9a"],
  ["#c8c8c8", "#7a7a7a"],
  ["#fafafa", "#b0b0b0"],
  ["#dedede", "#888888"],
  ["#f0f0f0", "#969696"],
];

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}

export function initialsOf(label: string, fallback: string): string {
  const source = label.trim() || fallback.trim();
  if (!source) return "؟";
  const parts = source.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[1]?.[0] ?? "" : "";
  return (first + second).toUpperCase() || "؟";
}

export function Avatar({
  seed,
  label,
  size = 34,
}: {
  seed: string;
  label: string;
  size?: number;
}) {
  const [from, to] = AVATAR_COLORS[hash(seed) % AVATAR_COLORS.length];
  const style: CSSProperties = {
    width: size,
    height: size,
    background: `linear-gradient(135deg, ${from}, ${to})`,
    fontSize: Math.round(size * 0.36),
  };
  return (
    <span className="avatar" style={style} aria-hidden="true">
      {initialsOf(label, seed)}
    </span>
  );
}

const METHOD_LABEL: Record<UserMethod, string> = {
  phone: "موبایل",
  email: "ایمیل",
  clerk: "Clerk",
  unknown: "نامشخص",
};
const METHOD_ICON: Record<UserMethod, IconName> = {
  phone: "phone",
  email: "mail",
  clerk: "sparkle",
  unknown: "user",
};

export function MethodBadge({ method }: { method: UserMethod }) {
  return (
    <span className={`badge-method ${method}`}>
      <Icon name={METHOD_ICON[method]} size={13} />
      <span className={method === "clerk" ? "ltr" : undefined}>{METHOD_LABEL[method]}</span>
    </span>
  );
}

export function ProfilePill({ complete }: { complete: boolean }) {
  return (
    <span className={`pill ${complete ? "ok" : "warn"}`}>
      <span className="dot" />
      {complete ? "پروفایل کامل" : "پروفایل ناقص"}
    </span>
  );
}

export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}