import { notFound } from "next/navigation";
import AnnouncementCard from "@/components/announcement-card";
import EmptyState from "@/components/empty-state";
import FollowButton from "@/components/follow-button";
import { getViewer } from "@/lib/auth";
import { savedIdsOf } from "@/lib/feed";
import { formatNumber } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n";
import { announcementCardSelect } from "@/lib/queries";
import { createSupabaseServer } from "@/lib/supabase/server";
import { topicName, type AnnouncementCardData, type Topic } from "@/lib/types";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [locale, viewer, supabase] = await Promise.all([
    getLocale(),
    getViewer(),
    createSupabaseServer(),
  ]);
  const t = getDictionary(locale);

  const { data: topicRow } = await supabase
    .from("topics")
    .select("id, slug, name_fa, name_en")
    .eq("slug", slug)
    .maybeSingle();

  if (!topicRow) notFound();
  const topic = topicRow as Topic;

  const [tagged, saved, followResult] = await Promise.all([
    supabase
      .from("announcement_topics")
      .select(`announcements!inner(${announcementCardSelect})`)
      .eq("topic_id", topic.id)
      .eq("announcements.status", "published")
      .eq("announcements.businesses.status", "active")
      .limit(60),
    savedIdsOf(supabase, viewer.user?.id),
    viewer.user
      ? supabase
          .from("topic_follows")
          .select("topic_id")
          .eq("user_id", viewer.user.id)
          .eq("topic_id", topic.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const cards = ((tagged.data ?? []) as unknown as {
    announcements: AnnouncementCardData | AnnouncementCardData[] | null;
  }[])
    .flatMap((row) => {
      const embedded = row.announcements;
      if (!embedded) return [];
      return Array.isArray(embedded) ? embedded : [embedded];
    })
    .sort((left, right) => (right.published_at ?? "").localeCompare(left.published_at ?? ""));

  const following = Boolean(followResult.data);
  const name = topicName(topic, locale);

  return (
    <div className="page">
      <section className="card relative overflow-hidden px-6 py-8 sm:px-9 sm:py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(460px 220px at 12% -20%, rgba(148,98,0,0.12), transparent 65%)",
          }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="eyebrow">{t.topicAnnouncements}</p>
            <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">{name}</h1>
            <p className="muted mt-2">
              {t.feedResults.replace("{n}", formatNumber(cards.length, locale))}
            </p>
          </div>
          <FollowButton
            kind="topic"
            id={topic.id}
            following={following}
            authed={Boolean(viewer.user)}
            next={`/topics/${topic.slug}`}
            t={t}
          />
        </div>
      </section>

      {cards.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <AnnouncementCard
              key={card.id}
              card={card}
              locale={locale}
              t={t}
              saved={saved.has(card.id)}
              authed={Boolean(viewer.user)}
              next={`/topics/${topic.slug}`}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5">
          <EmptyState
            icon="search"
            title={t.topicNoAnnouncements}
            actionHref="/feed"
            actionLabel={t.feedLatest}
          />
        </div>
      )}
    </div>
  );
}
