import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Avatar from "@/app/components/feedback/avatar";
import CommentSection from "@/app/components/feedback/comment-section";
import FeedbackKindBadge from "@/app/components/feedback/kind-badge";
import { CommentIcon, ShareIcon, VoteUpIcon } from "@/app/components/feedback/icons";
import Markdown from "@/app/components/feedback/markdown";
import StatusChip from "@/app/components/feedback/status-chip";
import VoteButton from "@/app/components/feedback/vote-button";
import { updateFeedbackStatusAction } from "../../../../actions";
import { getCompanyBySlug, getMembership } from "@/lib/companies";
import { listComments } from "@/lib/feedback/comments";
import {
  formatDate,
  formatNumber,
  feedbackKind,
  kindLabel,
  STATUS_LABELS,
  STATUS_LABELS_FA,
} from "@/lib/feedback/labels";
import { mediaUrl } from "@/lib/feedback/media";
import { getPostDetail, isUuid, listFeed } from "@/lib/feedback/posts";
import { getViewer, isAdminRequest } from "@/lib/feedback/viewer";
import { translator } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";

type Params = { slug: string; id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, id } = await params;
  const [company, post, locale] = await Promise.all([
    getCompanyBySlug(slug),
    getPostDetail(id, { isAdmin: false }),
    getLocale(),
  ]);
  const t = translator(locale);
  if (!company || !post) return { title: t("فیدبک | وسا", "Feedback | Vasa") };
  return { title: `${post.title} | ${company.name}` };
}

function fileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(Math.round((bytes / (1024 * 1024)) * 10) / 10).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default async function BoardPostPage({ params }: { params: Promise<Params> }) {
  const { slug, id } = await params;
  if (!isUuid(id)) notFound();

  const company = await getCompanyBySlug(slug);
  if (!company) notFound();

  const [viewer, admin] = await Promise.all([getViewer(), isAdminRequest()]);
  const post = await getPostDetail(id, { userId: viewer?.userId, isAdmin: admin });
  if (!post || post.companyId !== company.id || post.type !== "feedback") notFound();

  const locale = await getLocale();
  const t = translator(locale);
  const base = `/c/${company.slug}`;
  const here = `${base}/p/${post.id}`;
  const kind = feedbackKind(post.type, post.category);
  const role = viewer ? await getMembership(company.id, viewer.userId) : null;
  const canManage = admin || Boolean(role);

  const [comments, related] = await Promise.all([
    listComments(post.id, viewer?.userId),
    listFeed({
      companyId: company.id,
      excludeId: post.id,
      viewerId: viewer?.userId,
      limit: 3,
    }),
  ]);

  return (
    <>
      <Link href={base} className="bd-back">
        <span aria-hidden="true">←</span>
        {t("بازگشت به فیدبک", "Back to feedback")}
      </Link>

      <div className="bd-detail">
        <div>
          <header className="bd-detail-head">
            <div className="bd-vote">
              <VoteButton
                postId={post.id}
                count={post.upvotes}
                upvoted={post.viewerUpvoted}
                signedIn={Boolean(viewer)}
                nextPath={here}
              />
            </div>
            <div>
              <div className="bd-detail-kicker">
                {kind ? <FeedbackKindBadge kind={kind} locale={locale} /> : null}
                <StatusChip status={post.status} locale={locale} />
              </div>
              <h1>{post.title}</h1>
              <div className="bd-detail-author">
                <Avatar
                  name={post.authorName ?? t("یکی از اعضا", "Member")}
                  src={post.authorAvatarPath ? mediaUrl(post.authorAvatarPath) : null}
                  size={20}
                />
                {post.authorName ?? t("یکی از اعضا", "Member")}
                <span className="bd-meta-dot" aria-hidden="true" />
                <time dateTime={post.createdAt.toISOString()}>
                  {formatDate(post.createdAt, locale)}
                </time>
              </div>
            </div>
          </header>

          <div className="bd-detail-body">
            <Markdown source={post.body} />
          </div>

          {post.attachments.length > 0 ? (
            <div className="fb-attachments">
              <h2 className="label">{t("پیوست‌ها", "Attachments")}</h2>
              {post.attachments.map((file) => (
                <a
                  key={file.id}
                  className="fb-attachment"
                  href={mediaUrl(file.path)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>{file.fileName}</span>
                  <span>{fileSize(file.size)}</span>
                </a>
              ))}
            </div>
          ) : null}

          <div className="bd-detail-actions">
            <a href="#comments" className="fb-action-btn">
              <CommentIcon size={14} />
              {formatNumber(post.commentCount, locale)}
            </a>
            <a
              className="fb-action-btn"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ShareIcon size={14} />
              {t("هم‌رسانی", "Share")}
            </a>
          </div>

          <CommentSection
            postId={post.id}
            postAuthorId={post.authorId}
            comments={comments}
            signedIn={Boolean(viewer)}
            viewerId={viewer?.userId ?? null}
            nextPath={here}
            locked={post.hidden}
          />

          {related.length > 0 ? (
            <section className="fb-detail-related" aria-labelledby="related-title">
              <div className="fb-detail-related-head">
                <div>
                  <h2 id="related-title">{t("بیشتر از این برد", "More from this board")}</h2>
                  <p>{t(`فیدبک‌های دیگر که برای ${company.name} نوشته شده.`, `Other feedback people shared with ${company.name}.`)}</p>
                </div>
                <Link href={base} className="fb-link">
                  {t("همه", "All")}
                </Link>
              </div>
              <div className="fb-related-list">
                {related.map((item) => (
                  <Link key={item.id} href={`${base}/p/${item.id}`} className="fb-related-row">
                    <strong>{item.title}</strong>
                    <span className="fb-related-votes">
                      <VoteUpIcon size={11} />
                      {formatNumber(item.upvotes, locale)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="bd-rail">
          <dl className="bd-rail-rows">
            <div className="bd-rail-row">
              <dt>{t("برد", "Board")}</dt>
              <dd>{kind ? kindLabel(kind, locale) : t("فیدبک", "Feedback")}</dd>
            </div>
            <div className="bd-rail-row">
              <dt>{t("وضعیت", "Status")}</dt>
              <dd>
                <StatusChip status={post.status} locale={locale} />
              </dd>
            </div>
            <div className="bd-rail-row">
              <dt>{t("نویسنده", "Created by")}</dt>
              <dd>
                <span className="bd-rail-person">
                  <Avatar
                    name={post.authorName ?? t("یکی از اعضا", "Member")}
                    src={post.authorAvatarPath ? mediaUrl(post.authorAvatarPath) : null}
                    size={18}
                  />
                  {post.authorName ?? t("یکی از اعضا", "Member")}
                </span>
              </dd>
            </div>
            <div className="bd-rail-row">
              <dt>{t("تاریخ", "Date")}</dt>
              <dd>{formatDate(post.createdAt, locale)}</dd>
            </div>
            <div className="bd-rail-row">
              <dt>{t("رأی‌ها", "Votes")}</dt>
              <dd>{formatNumber(post.upvotes, locale)}</dd>
            </div>
          </dl>

          <div className="bd-rail-actions">
            {canManage ? (
              <form action={updateFeedbackStatusAction} className="bd-status-form">
                <input type="hidden" name="slug" value={company.slug} />
                <input type="hidden" name="postId" value={post.id} />
                <input type="hidden" name="back" value={here} />
                <label className="bd-rail-label" htmlFor="status-select">
                  {t("جابه‌جایی این فیدبک", "Move this feedback")}
                </label>
                <select id="status-select" name="status" defaultValue={post.status}>
                  {Object.entries(STATUS_LABELS)
                    .filter(([value]) => ["new", "planned", "in_progress", "shipped"].includes(value))
                    .map(([value, label]) => (
                      <option key={value} value={value}>
                        {t(STATUS_LABELS_FA[value] ?? label, label)}
                      </option>
                    ))}
                </select>
                <button type="submit">{t("ذخیره وضعیت", "Save status")}</button>
              </form>
            ) : (
              <p className="bd-rail-hint">
                {t(
                  `رأی دادن کمک می‌کنه ${company.name} بفهمه بعدی چی رو بسازه.`,
                  `Voting helps ${company.name} decide what to build next.`,
                )}
              </p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
