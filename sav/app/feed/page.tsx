import Link from "next/link";
import AnnouncementCard from "@/components/announcement-card";
import EmptyState from "@/components/empty-state";
import FeedTabs from "@/components/feed-tabs";
import { Icon } from "@/components/icons";
import { getViewer } from "@/lib/auth";
import { loadFeed, savedIdsOf } from "@/lib/feed";
import { formatNumber } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n";
import { createSupabaseServer } from "@/lib/supabase/server";
import { topicName, type Topic } from "@/lib/types";

export const metadata = { title: "فید اعلان‌ها | ساو" };

export default async function FeedPage() {
  const [locale, viewer, supabase] = await Promise.all([
    getLocale(),
    getViewer(),
    createSupabaseServer(),
  ]);
  const t = getDictionary(locale);
  const authed = Boolean(viewer.user);

  const [cards, saved, { data: topicRows }] = await Promise.all([
    loadFeed(supabase),
    savedIdsOf(supabase, viewer.user?.id),
    supabase.from("topics").select("id, slug, name_fa, name_en").order("slug"),
  ]);
  const topics = (topicRows ?? []) as Topic[];

  return (
    <div className="page">
      <section className="card relative overflow-hidden px-6 py-10 sm:px-10 sm:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(560px 260px at 88% -10%, rgba(20,108,67,0.16), transparent 65%), radial-gradient(420px 220px at 0% 110%, rgba(226,178,60,0.12), transparent 60%)",
          }}
        />
        <div className="relative">
          <p className="eyebrow">{t.brandTagline}</p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight text-ink sm:text-[2.6rem]">
            {t.feedTitle}
          </h1>
          <p className="muted mt-3 max-w-xl">{t.feedSub}</p>

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <Link href="/search" className="btn btn-primary">
              <Icon name="search" size={16} />
              {t.navSearch}
            </Link>
            {authed ? (
              <Link href="/following" className="btn">
                <Icon name="feed" size={16} />
                {t.feedFollowing}
              </Link>
            ) : (
              <Link href="/sign-in" className="btn">
                <Icon name="user" size={16} />
                {t.navSignIn}
              </Link>
            )}
            <span className="hidden text-xs text-ink-3 sm:inline">
              {authed ? t.feedGuestNote : `${t.feedGuestNote} ${t.feedGuestFollowing}`}
            </span>
          </div>

          {topics.length > 0 ? (
            <div className="mt-7 flex flex-wrap gap-1.5">
              {topics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={`/topics/${topic.slug}`}
                  className="chip chip-topic bg-surface/60"
                >
                  {topicName(topic, locale)}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <FeedTabs active="latest" authed={authed} t={t} />
        <p className="text-xs font-medium text-ink-3">
          {t.feedResults.replace("{n}", formatNumber(cards.length, locale))}
        </p>
      </div>

      {cards.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <AnnouncementCard
              key={card.id}
              card={card}
              locale={locale}
              t={t}
              saved={saved.has(card.id)}
              authed={authed}
              next="/feed"
            />
          ))}
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState
            icon="feed"
            title={t.feedEmpty}
            body={authed ? t.feedFollowingEmpty : t.feedGuestNote}
            actionHref={authed ? "/manage" : "/sign-in"}
            actionLabel={authed ? t.navManage : t.navSignIn}
          />
        </div>
      )}
    </div>
  );
}
