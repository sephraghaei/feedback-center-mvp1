import EmptyState from "@/components/empty-state";
import FeedGrid from "@/components/feed-grid";
import { requireUser } from "@/lib/auth";
import { formatNumber } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n";
import { announcementCardSelect } from "@/lib/queries";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { AnnouncementCardData } from "@/lib/types";

export const metadata = { title: "ذخیره‌ها | ساو" };

export default async function SavedPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const viewer = await requireUser("/saved");
  const supabase = await createSupabaseServer();

  const { data } = await supabase
    .from("saved_announcements")
    .select(`announcement_id, created_at, announcements!inner(${announcementCardSelect})`)
    .eq("user_id", viewer.user!.id)
    .eq("announcements.status", "published")
    .eq("announcements.businesses.status", "active")
    .order("created_at", { ascending: false });

  const cards = ((data ?? []) as unknown as {
    announcements: AnnouncementCardData | AnnouncementCardData[] | null;
  }[])
    .flatMap((row) => {
      const embedded = row.announcements;
      if (!embedded) return [];
      return Array.isArray(embedded) ? embedded : [embedded];
    });

  const saved = new Set(cards.map((card) => card.id));

  return (
    <div className="page">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{t.navSaved}</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">{t.savedTitle}</h1>
          <p className="muted mt-2 max-w-xl">{t.savedSub}</p>
        </div>
        <p className="text-xs font-medium text-ink-3">
          {t.feedResults.replace("{n}", formatNumber(cards.length, locale))}
        </p>
      </header>

      {cards.length > 0 ? (
        <FeedGrid cards={cards} locale={locale} t={t} saved={saved} authed next="/saved" />
      ) : (
        <div className="mt-6">
          <EmptyState
            icon="bookmark"
            title={t.savedEmpty}
            actionHref="/feed"
            actionLabel={t.feedLatest}
          />
        </div>
      )}
    </div>
  );
}
