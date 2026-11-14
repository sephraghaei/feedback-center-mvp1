import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { excerpt, formatDate, initials } from "@/lib/format";
import { taggedTopics } from "@/lib/queries";
import type { AnnouncementCardData } from "@/lib/types";
import ImportanceBadge from "./importance-badge";
import SaveButton from "./save-button";
import { Icon } from "./icons";

export default function AnnouncementCard({
  card,
  locale,
  t,
  saved,
  authed,
  next,
  showBusiness = true,
}: {
  card: AnnouncementCardData;
  locale: Locale;
  t: Dictionary;
  saved: boolean;
  authed: boolean;
  next: string;
  showBusiness?: boolean;
}) {
  const business = card.businesses;
  const topics = taggedTopics(card, locale);
  const accent =
    card.importance === "urgent"
      ? "var(--color-urgent)"
      : card.importance === "important"
        ? "var(--color-important)"
        : undefined;

  return (
    <article
      className="card group flex h-full flex-col p-5 transition-colors hover:border-line-strong"
      style={
        accent
          ? { borderInlineStartColor: accent, borderInlineStartWidth: "3px" }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-3">
        {showBusiness && business ? (
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface-2 text-xs font-semibold text-brand">
              {business.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={business.logo_url}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                initials(business.name)
              )}
            </span>
            <div className="min-w-0">
              <Link
                href={`/b/${business.slug}`}
                className="block truncate text-sm font-medium text-ink hover:text-brand"
              >
                {business.name}
              </Link>
              <p className="mt-0.5 flex items-center gap-1 text-[0.68rem] text-ink-3">
                <Icon name="clock" size={12} />
                {card.published_at ? formatDate(card.published_at, locale) : t.statusDraft}
              </p>
            </div>
          </div>
        ) : (
          <p className="flex items-center gap-1 text-[0.68rem] text-ink-3">
            <Icon name="clock" size={12} />
            {card.published_at ? formatDate(card.published_at, locale) : t.statusDraft}
          </p>
        )}
        <ImportanceBadge importance={card.importance} t={t} />
      </div>

      <h3 className="mt-4 text-base font-semibold leading-7 text-ink transition-colors group-hover:text-brand sm:text-[1.05rem]">
        <Link href={`/a/${card.id}`}>{card.title}</Link>
      </h3>

      <p className="mt-2 line-clamp-3 text-sm leading-7 text-ink-2">
        {excerpt(card.body, 190)}
      </p>

      {topics.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {topics.slice(0, 3).map((topic) => (
            <Link key={topic.slug} href={`/topics/${topic.slug}`} className="chip chip-topic">
              {topic.name}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-auto pt-5">
        <div className="flex items-center justify-between gap-3 border-t border-line pt-3.5">
          <Link
            href={`/a/${card.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-strong"
          >
            {t.actionReadMore}
            <Icon name="arrow" size={14} className="flip" />
          </Link>
          <SaveButton
            announcementId={card.id}
            saved={saved}
            authed={authed}
            next={next}
            t={t}
          />
        </div>
      </div>
    </article>
  );
}
