import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Avatar from "@/app/components/feedback/avatar";
import FeedbackKindBadge from "@/app/components/feedback/kind-badge";
import {
  AlertIcon,
  BulbIcon,
  CommentIcon,
  HeartIcon,
  TagIcon,
  VoteUpIcon,
} from "@/app/components/feedback/icons";
import VoteButton from "@/app/components/feedback/vote-button";
import { getCompanyBySlug } from "@/lib/companies";
import {
  formatDate,
  formatNumber,
  feedbackKind,
  kindLabel,
  type FeedbackKind,
} from "@/lib/feedback/labels";
import { mediaUrl } from "@/lib/feedback/media";
import { excerpt, listFeed } from "@/lib/feedback/posts";
import { getViewer } from "@/lib/feedback/viewer";
import { translator } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";

type Search = { q?: string; kind?: string; sort?: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [company, locale] = await Promise.all([getCompanyBySlug(slug), getLocale()]);
  const t = translator(locale);
  if (!company) return { title: t("برد پیدا نشد | وسا", "Board not found | Vasa") };
  return {
    title: t(`${company.name} فیدبک | وسا`, `${company.name} feedback | Vasa`),
    description: company.tagline ?? t(`برای ${company.name} فیدبک بنویس.`, `Share feedback for ${company.name}.`),
  };
}

function kindOf(post: { type: string; category: string | null }): FeedbackKind | null {
  return feedbackKind(post.type, post.category);
}

function hrefFor(slug: string, current: Search, patch: Search): string {
  const next = { ...current, ...patch };
  const query = new URLSearchParams();
  if (next.q) query.set("q", next.q);
  if (next.kind) query.set("kind", next.kind);
  if (next.sort === "newest") query.set("sort", "newest");
  const text = query.toString();
  return text ? `/c/${slug}?${text}` : `/c/${slug}`;
}

export default async function CompanyBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Search>;
}) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const company = await getCompanyBySlug(slug);
  if (!company) notFound();

  const locale = await getLocale();
  const t = translator(locale);

  const categories: { value: FeedbackKind | null; label: string; Icon: typeof TagIcon }[] = [
    { value: null, label: t("همه فیدبک‌ها", "All feedback"), Icon: TagIcon },
    { value: "bug", label: kindLabel("bug", locale), Icon: AlertIcon },
    { value: "improvement", label: kindLabel("improvement", locale), Icon: BulbIcon },
    { value: "praise", label: kindLabel("praise", locale), Icon: HeartIcon },
  ];

  const viewer = await getViewer();
  const all = await listFeed({ companyId: company.id, viewerId: viewer?.userId, limit: 300 });

  const kind = categories.some((entry) => entry.value === search.kind)
    ? (search.kind as FeedbackKind)
    : null;
  const sortNewest = search.sort === "newest";
  const query = (search.q ?? "").trim();
  const needle = query.toLowerCase();

  const counts = new Map<string, number>();
  for (const post of all) {
    const key = kindOf(post) ?? "improvement";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const visible = all
    .filter((post) => (kind ? kindOf(post) === kind : true))
    .filter((post) =>
      needle
        ? post.title.toLowerCase().includes(needle) || post.body.toLowerCase().includes(needle)
        : true,
    )
    .sort((a, b) =>
      sortNewest
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : b.upvotes - a.upvotes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const helpful = [...all].sort((a, b) => b.upvotes - a.upvotes).slice(0, 5);
  const current: Search = {
    q: query || undefined,
    kind: kind ?? undefined,
    sort: sortNewest ? "newest" : undefined,
  };

  const base = `/c/${company.slug}`;
  const newHref = `${base}/new`;

  return (
    <>
      <section className="bd-hero">
        <div>
          <h1>{t("فیدبک", "Feedback")}</h1>
          <p>
            {company.tagline ??
              t(
                `ایده‌ها، باگ‌ها و تشکرها برای ${company.name}.`,
                `Ideas, bugs and praise for ${company.name}.`,
              )}{" "}
            {t(
              "به مهم‌ها رأی بده و هر مورد رو تا جلو رفتنش دنبال کن.",
              "Vote on what matters and follow each item as it moves forward.",
            )}
          </p>
        </div>
      </section>

      <div className="bd-board">
        <aside className="bd-side">
          <h2 className="bd-side-title">{t("برد", "Board")}</h2>
          <ul className="bd-cats">
            {categories.map(({ value, label, Icon }) => {
              const active = value === kind;
              const count = value ? counts.get(value) ?? 0 : all.length;
              return (
                <li key={label}>
                  <Link
                    href={hrefFor(company.slug, current, { kind: value ?? undefined })}
                    className={`bd-cat ${active ? "active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon size={14} />
                    {label}
                    <span className="bd-cat-count">{formatNumber(count, locale)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <h2 className="bd-side-title">{t("ترتیب", "Sort")}</h2>
          <ul className="bd-sort">
            <li>
              <Link
                href={hrefFor(company.slug, current, { sort: undefined })}
                className={`bd-cat ${!sortNewest ? "active" : ""}`}
              >
                {t("پررأی‌ترین", "Top voted")}
              </Link>
            </li>
            <li>
              <Link
                href={hrefFor(company.slug, current, { sort: "newest" })}
                className={`bd-cat ${sortNewest ? "active" : ""}`}
              >
                {t("تازه‌ها", "Newest")}
              </Link>
            </li>
          </ul>
        </aside>

        <section aria-labelledby="feedback-list-title">
          <div className="bd-list-head">
            <h2 id="feedback-list-title">
              {query
                ? t(`نتایج «${query}»`, `Results for “${query}”`)
                : kind
                  ? kindLabel(kind, locale)
                  : t("همه فیدبک‌ها", "All feedback")}
            </h2>
            <span className="bd-list-count">
              {t(
                `${formatNumber(visible.length, locale)} مورد`,
                `${formatNumber(visible.length, locale)} ${visible.length === 1 ? "post" : "posts"}`,
              )}
            </span>
          </div>

          {visible.length === 0 ? (
            <div className="bd-empty">
              <strong>{t("هنوز چیزی اینجا نیست.", "Nothing here yet.")}</strong>
              <p>
                {query
                  ? t(
                      "هیچ فیدبکی با این جستجو پیدا نشد. یک کلمه دیگر بزن یا جستجو رو پاک کن.",
                      "No feedback matches that search. Try another word or clear the search.",
                    )
                  : t(
                      "اولین نفر باش و یک ایده بنویس، باگ گزارش کن یا تشکر بفرست.",
                      "Be the first to share an idea, report a bug or send some praise.",
                    )}
              </p>
              <Link href={newHref} className="bd-btn bd-btn-primary">
                {t("اولین نوشته رو بنویس", "Write the first post")}
              </Link>
            </div>
          ) : (
            <ul className="bd-rows">
              {visible.map((post) => {
                const postKind = kindOf(post);
                const href = `${base}/p/${post.id}`;
                return (
                  <li key={post.id} className="bd-row">
                    <div className="bd-vote">
                      <VoteButton
                        postId={post.id}
                        count={post.upvotes}
                        upvoted={post.viewerUpvoted}
                        signedIn={Boolean(viewer)}
                        nextPath={href}
                      />
                    </div>
                    <div className="bd-row-main">
                      <div className="bd-row-top">
                        <h3 className="bd-row-title">
                          <Link href={href}>{post.title}</Link>
                        </h3>
                      </div>
                      <p className="bd-row-excerpt" dir="auto">
                        {excerpt(post.body)}
                      </p>
                      <div className="bd-row-meta">
                        {postKind ? <FeedbackKindBadge kind={postKind} locale={locale} /> : null}
                        <span className="bd-meta-item">
                          <Avatar
                            name={post.authorName ?? t("عضو", "Member")}
                            src={
                              post.authorAvatarPath ? mediaUrl(post.authorAvatarPath) : null
                            }
                            size={16}
                          />
                          {post.authorName ?? t("عضو", "Member")}
                        </span>
                        <span className="bd-meta-dot" aria-hidden="true" />
                        <time dateTime={post.createdAt.toISOString()}>
                          {formatDate(post.createdAt, locale)}
                        </time>
                        <span className="bd-meta-dot" aria-hidden="true" />
                        <span className="bd-meta-item">
                          <CommentIcon size={12} />
                          {formatNumber(post.commentCount, locale)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="bd-helpful">
          <h2>{t("بیشترین کمک", "Most helpful")}</h2>
          <p className="bd-helpful-sub">
            {t("فیدبکی که این جامعه بیش از همه می‌خواد.", "The feedback this community wants most.")}
          </p>
          <ol className="bd-helpful-list">
            {helpful.length === 0 ? (
              <li className="bd-col-empty">{t("هنوز رأیی نیست.", "No votes yet.")}</li>
            ) : (
              helpful.map((post, index) => (
                <li key={post.id} className="bd-helpful-item">
                  <span className="bd-helpful-rank">{formatNumber(index + 1, locale)}</span>
                  <div>
                    <Link href={`${base}/p/${post.id}`}>{post.title}</Link>
                    <span className="bd-helpful-votes">
                      <VoteUpIcon size={10} /> {t(`${formatNumber(post.upvotes, locale)} رأی`, `${formatNumber(post.upvotes, locale)} votes`)}
                    </span>
                  </div>
                </li>
              ))
            )}
          </ol>
        </aside>
      </div>
    </>
  );
}
