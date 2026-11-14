import Link from "next/link";
import { getViewer } from "@/lib/auth";
import { getDictionary, getLocale } from "@/lib/i18n";
import { signOutAction } from "@/app/actions";
import { initials } from "@/lib/format";
import { BrandMark, Icon } from "./icons";
import LanguageSwitch from "./language-switch";
import { DesktopNav, MobileNav, type NavItem } from "./nav";

export default async function SiteHeader() {
  const [locale, viewer] = await Promise.all([getLocale(), getViewer()]);
  const t = getDictionary(locale);
  const authed = Boolean(viewer.user);

  const desktop: NavItem[] = [
    { href: "/feed", label: t.navFeed, icon: "feed" },
    ...(authed ? [{ href: "/following", label: t.navFollowing, icon: "feed" as const }] : []),
    { href: "/search", label: t.navSearch, icon: "search" },
    ...(authed ? [{ href: "/saved", label: t.navSaved, icon: "bookmark" as const }] : []),
  ];

  const mobile: NavItem[] = authed
    ? [
        { href: "/feed", label: t.navFeed, icon: "feed" },
        { href: "/search", label: t.navSearch, icon: "search" },
        { href: "/following", label: t.navFollowing, icon: "feed" },
        { href: "/saved", label: t.navSaved, icon: "bookmark" },
        { href: "/notifications", label: t.navNotifications, icon: "bell", badge: viewer.unread },
      ]
    : [
        { href: "/feed", label: t.navFeed, icon: "feed" },
        { href: "/search", label: t.navSearch, icon: "search" },
        { href: "/sign-in", label: t.navSignIn, icon: "user" },
      ];

  const displayName =
    viewer.profile?.display_name || viewer.user?.email?.split("@")[0] || t.navSignIn;

  return (
    <>
      <div
        className="h-1 w-full"
        style={{ background: "linear-gradient(90deg,#146c43,#7bbf9b,#e2b23c)" }}
        aria-hidden="true"
      />
      <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
          <Link href="/feed" className="flex items-center gap-2.5" aria-label="SAV">
            <BrandMark size={34} />
            <span className="flex flex-col leading-none">
              <span className="text-[1.05rem] font-semibold tracking-[-0.03em] text-ink">SAV</span>
              <span className="mt-1 hidden text-[0.66rem] font-normal tracking-normal text-ink-3 lg:block">
                {t.brandTagline}
              </span>
            </span>
          </Link>

          <div className="ms-3">
            <DesktopNav items={desktop} />
          </div>

          <div className="ms-auto flex items-center gap-1.5">
            {authed ? (
              <Link
                href="/notifications"
                className="relative hidden h-9 w-9 items-center justify-center rounded-lg border border-transparent text-ink-2 hover:border-line hover:bg-surface-2 hover:text-ink sm:flex"
                aria-label={t.navNotifications}
              >
                <Icon name="bell" />
                {viewer.unread > 0 ? (
                  <span className="absolute -top-1 -end-1 rounded-full bg-urgent px-1.5 text-[0.6rem] font-semibold leading-4 text-white">
                    {viewer.unread > 9 ? "9+" : viewer.unread}
                  </span>
                ) : null}
              </Link>
            ) : null}

            <LanguageSwitch locale={locale} />

            {authed ? (
              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg p-1 [&::-webkit-details-marker]:hidden">
                  <span className="avatar h-9 w-9 text-xs">{initials(displayName)}</span>
                  <span className="hidden max-w-28 truncate text-sm font-medium text-ink sm:block">
                    {displayName}
                  </span>
                </summary>
                <div className="card absolute end-0 top-full z-50 mt-2 w-60 overflow-hidden p-1.5">
                  <div className="px-2.5 py-2">
                    <p className="truncate text-sm font-medium text-ink">{displayName}</p>
                    <p className="truncate text-xs text-ink-3" dir="ltr">
                      {viewer.user?.email}
                    </p>
                  </div>
                  <div className="divider my-1" />
                  <Link href="/manage" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink">
                    <Icon name="building" size={16} />
                    {t.navManage}
                  </Link>
                  <Link href="/preferences" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink">
                    <Icon name="sliders" size={16} />
                    {t.navPreferences}
                  </Link>
                  {viewer.isAdmin ? (
                    <Link href="/admin" className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink">
                      <Icon name="shield" size={16} />
                      {t.navAdmin}
                    </Link>
                  ) : null}
                  <div className="divider my-1" />
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-start text-sm text-ink-2 hover:bg-surface-2 hover:text-ink"
                    >
                      <Icon name="logout" size={16} />
                      {t.navSignOut}
                    </button>
                  </form>
                </div>
              </details>
            ) : (
              <Link href="/sign-in" className="btn btn-primary btn-sm">
                <Icon name="user" size={15} />
                {t.navSignIn}
              </Link>
            )}
          </div>
        </div>
      </header>
      <MobileNav items={mobile} />
    </>
  );
}
