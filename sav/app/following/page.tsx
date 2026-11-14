import FeedGrid from "@/components/feed-grid";
import EmptyState from "@/components/empty-state";
import FeedTabs from "@/components/feed-tabs";
import { requireUser } from "@/lib/auth";
import { loadFollowingFeed, savedIdsOf } from "@/lib/feed";
import { formatNumber } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n";
import { createSupabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "دنبال‌شده‌ها | ساو" };

export default async function FollowingPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const viewer = await requireUser("/following");
  const supabase = await createSupabaseServer();

  const [cards, saved] = await Promise.all([
    loadFollowingFeed(supabase, viewer.user!.id),
    savedIdsOf(supabase, viewer.user!.id),
  ]);

  return (
    <div className="page">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{t.feedFollowing}</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">{t.feedTitle}</h1>
          <p className="muted mt-2 max-w-xl">{t.feedFollowingEmpty}</p>
        </div>
        <p className="text-xs font-medium text-ink-3">
          {t.feedResults.replace("{n}", formatNumber(cards.length, locale))}
        </p>
      </header>

      <div className="mt-6">
        <FeedTabs active="following" authed t={t} />
      </div>

      {cards.length > 0 ? (
        <FeedGrid
          cards={cards}
          locale={locale}
          t={t}
          saved={saved}
          authed
          next="/following"
        />
      ) : (
        <div className="mt-5">
          <EmptyState
            icon="feed"
            title={t.feedFollowingEmpty}
            actionHref="/feed"
            actionLabel={t.feedLatest}
          />
        </div>
      )}
    </div>
  );
}
