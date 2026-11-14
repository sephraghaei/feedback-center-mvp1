import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/i18n";
import { BrandMark } from "@/components/icons";

export default async function NotFound() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="page flex min-h-[55vh] flex-col items-center justify-center text-center">
      <BrandMark size={44} />
      <p className="mt-5 text-[0.7rem] font-medium tracking-[0.2em] text-ink-3">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">{t.notFoundTitle}</h1>
      <p className="mt-2 max-w-md text-sm leading-7 text-ink-2">{t.notFoundBody}</p>
      <Link href="/feed" className="btn btn-primary mt-6">
        {t.navFeed}
      </Link>
    </div>
  );
}
