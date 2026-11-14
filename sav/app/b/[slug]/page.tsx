import Link from "next/link";
import { notFound } from "next/navigation";
import AnnouncementCard from "@/components/announcement-card";
import EmptyState from "@/components/empty-state";
import FollowButton from "@/components/follow-button";
import { Icon } from "@/components/icons";
import { getViewer } from "@/lib/auth";
import { savedIdsOf } from "@/lib/feed";
import { formatNumber, initials } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n";
import { announcementCardSelect, asCards } from "@/lib/queries";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
  statusLabel,
  topicName,
  type Business,
  type Topic,
} from "@/lib/types";

export default async function BusinessPage({
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

  const { data: businessRow } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!businessRow) notFound();
  const business = businessRow as Business;

  const [cardsResult, saved, followResult, topicResult] = await Promise.all([
    supabase
      .from("announcements")
      .select(announcementCardSelect)
      .eq("business_id", business.id)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50),
    savedIdsOf(supabase, viewer.user?.id),
    viewer.user
      ? supabase
          .from("business_follows")
          .select("business_id")
          .eq("user_id", viewer.user.id)
          .eq("business_id", business.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    business.primary_topic_id
      ? supabase
          .from("topics")
          .select("id, slug, name_fa, name_en")
          .eq("id", business.primary_topic_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const cards = asCards(cardsResult.data);
  const following = Boolean(followResult.data);
  const primaryTopic = topicResult.data as Topic | null;

  return (
    <div className="page">
      <section className="card relative overflow-hidden px-6 py-8 sm:px-9 sm:py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(480px 240px at 90% -20%, rgba(20,108,67,0.14), transparent 65%)",
          }}
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line bg-surface-2 text-2xl font-semibold text-brand">
            {business.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={business.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(business.name)
            )}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="eyebrow">{t.businessAbout}</p>
              {business.status !== "active" ? (
                <span className="chip chip-important">{statusLabel(t, business.status)}</span>
              ) : null}
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">{business.name}</h1>
            {business.description ? (
              <p className="muted mt-2 max-w-2xl">{business.description}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {primaryTopic ? (
                <Link href={`/topics/${primaryTopic.slug}`} className="chip chip-topic">
                  <Icon name="feed" size={12} />
                  {t.businessPrimaryTopic}: {topicName(primaryTopic, locale)}
                </Link>
              ) : null}
              {business.website_url ? (
                <a
                  href={business.website_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="chip chip-topic"
                  dir="ltr"
                >
                  <Icon name="external" size={12} />
                  {t.businessWebsite}
                </a>
              ) : null}
              {business.contact_email ? (
                <a href={`mailto:${business.contact_email}`} className="chip chip-topic" dir="ltr">
                  <Icon name="mail" size={12} />
                  {business.contact_email}
                </a>
              ) : null}
            </div>
          </div>

          <div className="shrink-0">
            <FollowButton
              kind="business"
              id={business.id}
              following={following}
              authed={Boolean(viewer.user)}
              next={`/b/${business.slug}`}
              t={t}
            />
          </div>
        </div>
      </section>

      <section className="mt-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-ink">{t.businessAnnouncements}</h2>
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
                authed={Boolean(viewer.user)}
                next={`/b/${business.slug}`}
                showBusiness={false}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              icon="building"
              title={t.businessNoAnnouncements}
              actionHref="/feed"
              actionLabel={t.feedLatest}
            />
          </div>
        )}
      </section>
    </div>
  );
}
