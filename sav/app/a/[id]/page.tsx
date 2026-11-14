import Link from "next/link";
import { notFound } from "next/navigation";
import AnnouncementCard from "@/components/announcement-card";
import FollowButton from "@/components/follow-button";
import ImportanceBadge from "@/components/importance-badge";
import SaveButton from "@/components/save-button";
import { Icon } from "@/components/icons";
import { getViewer } from "@/lib/auth";
import { savedIdsOf } from "@/lib/feed";
import { formatDate, initials } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n";
import { announcementCardSelect, asCards, taggedTopics } from "@/lib/queries";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { AnnouncementStatus, Importance } from "@/lib/types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Detail = {
  id: string;
  title: string;
  body: string;
  importance: Importance;
  status: AnnouncementStatus;
  published_at: string | null;
  attachment_url: string | null;
  businesses: {
    id: string;
    slug: string;
    name: string;
    logo_url: string | null;
    description: string | null;
    status: string;
    website_url: string | null;
  } | null;
  announcement_topics: { topics: { id: string; slug: string; name_fa: string; name_en: string } | null }[];
};

export default async function AnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) notFound();

  const [locale, viewer, supabase] = await Promise.all([
    getLocale(),
    getViewer(),
    createSupabaseServer(),
  ]);
  const t = getDictionary(locale);
  const authed = Boolean(viewer.user);

  const { data } = await supabase
    .from("announcements")
    .select(`
      id,
      title,
      body,
      importance,
      status,
      published_at,
      attachment_url,
      businesses!inner (id, slug, name, logo_url, description, status, website_url),
      announcement_topics (topics (id, slug, name_fa, name_en))
    `)
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const detail = data as unknown as Detail;
  if (detail.businesses?.status !== "active") {
    const isMember = viewer.memberships.some(
      (item) => item.business_id === detail.businesses?.id,
    );
    if (!isMember && !viewer.isAdmin) notFound();
  }

  const business = detail.businesses!;
  const [saved, followResult, relatedResult] = await Promise.all([
    savedIdsOf(supabase, viewer.user?.id),
    viewer.user
      ? supabase
          .from("business_follows")
          .select("business_id")
          .eq("user_id", viewer.user.id)
          .eq("business_id", business.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("announcements")
      .select(announcementCardSelect)
      .eq("business_id", business.id)
      .eq("status", "published")
      .neq("id", detail.id)
      .order("published_at", { ascending: false })
      .limit(2),
  ]);

  const following = Boolean(followResult.data);
  const related = asCards(relatedResult.data);
  const topics = taggedTopics(detail, locale);

  return (
    <div className="page">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="card px-6 py-8 sm:px-9 sm:py-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <ImportanceBadge importance={detail.importance} t={t} />
              <p className="flex items-center gap-1 text-xs text-ink-3">
                <Icon name="clock" size={13} />
                {formatDate(detail.published_at, locale) || t.statusDraft}
              </p>
            </div>
            <SaveButton
              announcementId={detail.id}
              saved={saved.has(detail.id)}
              authed={authed}
              next={`/a/${detail.id}`}
              t={t}
            />
          </div>

          <h1 className="mt-4 text-2xl font-semibold leading-snug text-ink sm:text-[2rem]">
            {detail.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href={`/b/${business.slug}`}
              className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-brand"
            >
              <Icon name="building" size={14} />
              {business.name}
            </Link>
            {topics.map((topic) => (
              <Link key={topic.slug} href={`/topics/${topic.slug}`} className="chip chip-topic">
                {topic.name}
              </Link>
            ))}
          </div>

          <div className="divider my-6" />

          <div className="whitespace-pre-line text-[0.95rem] leading-8 text-ink-2">
            {detail.body}
          </div>

          {detail.attachment_url ? (
            <a
              href={detail.attachment_url}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-soft mt-7"
              dir="ltr"
            >
              <Icon name="external" size={16} />
              {t.manageAttachment}
            </a>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            <Link href="/feed" className="btn btn-ghost btn-sm">
              <Icon name="arrow" size={14} className="flip" />
              {t.actionBack}
            </Link>
            <SaveButton
              announcementId={detail.id}
              saved={saved.has(detail.id)}
              authed={authed}
              next={`/a/${detail.id}`}
              t={t}
            />
          </div>
        </article>

        <aside className="flex flex-col gap-4">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface-2 text-base font-semibold text-brand">
                {business.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={business.logo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials(business.name)
                )}
              </span>
              <div className="min-w-0">
                <Link
                  href={`/b/${business.slug}`}
                  className="block truncate text-sm font-semibold text-ink hover:text-brand"
                >
                  {business.name}
                </Link>
                <p className="mt-0.5 text-xs text-ink-3">{t.businessAbout}</p>
              </div>
            </div>

            {business.description ? (
              <p className="mt-3 line-clamp-4 text-sm leading-7 text-ink-2">
                {business.description}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-1.5">
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
            </div>

            <div className="mt-4">
              <FollowButton
                kind="business"
                id={business.id}
                following={following}
                authed={authed}
                next={`/a/${detail.id}`}
                t={t}
              />
            </div>
          </div>

          {related.length > 0 ? (
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-ink">{t.businessAnnouncements}</h2>
              {related.map((card) => (
                <AnnouncementCard
                  key={card.id}
                  card={card}
                  locale={locale}
                  t={t}
                  saved={saved.has(card.id)}
                  authed={authed}
                  next={`/a/${detail.id}`}
                  showBusiness={false}
                />
              ))}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
