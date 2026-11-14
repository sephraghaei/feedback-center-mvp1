import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";

export default function FeedTabs({
  active,
  authed,
  t,
}: {
  active: "latest" | "following";
  authed: boolean;
  t: Dictionary;
}) {
  const base = "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors";

  return (
    <div className="flex items-center gap-1 rounded-2xl border border-line bg-surface-2/70 p-1">
      <Link
        href="/feed"
        aria-current={active === "latest" ? "page" : undefined}
        className={`${base} ${
          active === "latest"
            ? "border border-line bg-surface text-ink shadow-sm"
            : "border border-transparent text-ink-2 hover:text-ink"
        }`}
      >
        {t.feedLatest}
      </Link>
      <Link
        href="/following"
        aria-current={active === "following" ? "page" : undefined}
        className={`${base} ${
          active === "following"
            ? "border border-line bg-surface text-ink shadow-sm"
            : "border border-transparent text-ink-2 hover:text-ink"
        }`}
      >
        {t.feedFollowing}
        {!authed ? <span className="text-[0.7rem] text-ink-3">({t.navSignIn})</span> : null}
      </Link>
    </div>
  );
}
