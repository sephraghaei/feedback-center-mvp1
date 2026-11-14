import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/i18n";
import { BrandMark } from "./icons";

export default async function SiteFooter() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <footer className="border-t border-line bg-surface/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 pt-8 pb-24 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:pb-8">
        <div className="flex items-center gap-2.5">
          <BrandMark size={28} />
          <div>
            <p className="text-sm font-semibold text-ink">SAV</p>
            <p className="text-xs text-ink-3">{t.footerNote}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-ink-3">
          <Link href="/feed" className="hover:text-ink">
            {t.navFeed}
          </Link>
          <Link href="/search" className="hover:text-ink">
            {t.navSearch}
          </Link>
          <Link href="/manage" className="hover:text-ink">
            {t.navManage}
          </Link>
          <span className="rounded-full border border-line px-2 py-0.5">{t.footerPhase}</span>
        </div>
      </div>
    </footer>
  );
}
