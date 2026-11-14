import Link from "next/link";
import AnnouncementCard from "@/components/announcement-card";
import EmptyState from "@/components/empty-state";
import { Icon } from "@/components/icons";
import { getViewer } from "@/lib/auth";
import { savedIdsOf } from "@/lib/feed";
import { formatNumber } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n";
import { announcementCardSelect, asCards } from "@/lib/queries";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
  importanceKey,
  topicName,
  type AnnouncementCardData,
  type Business,
  type Importance,
  type Topic,
} from "@/lib/types";

export const metadata = { title: "جست‌وجو | ساو" };

const IMPORTANCE_VALUES: Importance[] = ["normal", "important", "urgent"];

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const [locale, viewer, supabase] = await Promise.all([
    getLocale(),
    getViewer(),
    createSupabaseServer(),
  ]);
  const t = getDictionary(locale);

  const q = first(query.q).trim();
  const topicSlug = first(query.topic).trim();
  const businessSlug = first(query.business).trim();
  const from = first(query.from).trim();
  const to = first(query.to).trim();
  const importance = first(query.importance).trim();
  const hasFilters = Boolean(q || topicSlug || businessSlug || from || to || importance);

  const [topicsResult, businessesResult, saved] = await Promise.all([
    supabase.from("topics").select("id, slug, name_fa, name_en").order("slug"),
    supabase
      .from("businesses")
      .select("id, slug, name")
      .eq("status", "active")
      .order("name"),
    savedIdsOf(supabase, viewer.user?.id),
  ]);

  const topics = (topicsResult.data ?? []) as Topic[];
  const businesses = (businessesResult.data ?? []) as Pick<Business, "id" | "slug" | "name">[];

  let cards: AnnouncementCardData[] = [];

  if (hasFilters) {
    const { data: ids } = await supabase.rpc("search_announcements", {
      p_q: q || null,
      p_topic: topicSlug || null,
      p_business: businessSlug || null,
      p_from: from ? new Date(`${from}T00:00:00`).toISOString() : null,
      p_to: to ? new Date(`${to}T23:59:59.999`).toISOString() : null,
      p_importance: importance || null,
    });

    const orderedIds = (ids ?? []) as string[];
    if (orderedIds.length > 0) {
      const { data } = await supabase
        .from("announcements")
        .select(announcementCardSelect)
        .in("id", orderedIds)
        .eq("businesses.status", "active");
      const byId = new Map(asCards(data).map((card) => [card.id, card]));
      cards = orderedIds.map((id) => byId.get(id)).filter(Boolean) as AnnouncementCardData[];
    }
  }

  const current = new URLSearchParams();
  if (q) current.set("q", q);
  if (topicSlug) current.set("topic", topicSlug);
  if (businessSlug) current.set("business", businessSlug);
  if (from) current.set("from", from);
  if (to) current.set("to", to);
  if (importance) current.set("importance", importance);
  const nextQuery = current.toString() ? `?${current.toString()}` : "";

  return (
    <div className="page">
      <header>
        <p className="eyebrow">{t.navSearch}</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">{t.searchTitle}</h1>
        <p className="muted mt-2 max-w-2xl">{t.searchSub}</p>
      </header>

      <form method="get" action="/search" className="card mt-6 grid gap-4 p-5 sm:p-6">
        <label className="field">
          <span className="label">{t.searchQuery}</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={t.searchQueryPlaceholder}
            className="input"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="field">
            <span className="label">{t.searchTopic}</span>
            <select name="topic" defaultValue={topicSlug} className="select">
              <option value="">{t.actionAll}</option>
              {topics.map((topic) => (
                <option key={topic.slug} value={topic.slug}>
                  {topicName(topic, locale)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="label">{t.searchBusiness}</span>
            <select name="business" defaultValue={businessSlug} className="select">
              <option value="">{t.actionAll}</option>
              {businesses.map((business) => (
                <option key={business.slug} value={business.slug}>
                  {business.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="label">{t.searchFrom}</span>
            <input type="date" name="from" defaultValue={from} className="input" />
          </label>

          <label className="field">
            <span className="label">{t.searchTo}</span>
            <input type="date" name="to" defaultValue={to} className="input" />
          </label>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <label className="field min-w-44">
            <span className="label">{t.searchImportance}</span>
            <select name="importance" defaultValue={importance} className="select">
              <option value="">{t.actionAll}</option>
              {IMPORTANCE_VALUES.map((value) => (
                <option key={value} value={value}>
                  {t[importanceKey(value)]}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-2">
            {hasFilters ? (
              <Link href="/search" className="btn btn-ghost">
                {t.actionClear}
              </Link>
            ) : null}
            <button type="submit" className="btn btn-primary">
              <Icon name="search" size={16} />
              {t.actionSearch}
            </button>
          </div>
        </div>
      </form>

      {hasFilters ? (
        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">{t.searchTitle}</h2>
            <p className="text-xs font-medium text-ink-3">
              {t.searchResults.replace("{n}", formatNumber(cards.length, locale))}
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
                  next={`/search${nextQuery}`}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                icon="search"
                title={t.searchNoResults}
                actionHref="/feed"
                actionLabel={t.feedLatest}
              />
            </div>
          )}
        </section>
      ) : (
        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="card-pad">
            <h2 className="text-sm font-semibold text-ink">{t.searchTopic}</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {topics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={`/topics/${topic.slug}`}
                  className="chip chip-topic"
                >
                  {topicName(topic, locale)}
                </Link>
              ))}
            </div>
          </div>
          <div className="card-pad">
            <h2 className="text-sm font-semibold text-ink">{t.searchBusiness}</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {businesses.map((business) => (
                <Link
                  key={business.slug}
                  href={`/b/${business.slug}`}
                  className="chip chip-topic"
                >
                  {business.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
