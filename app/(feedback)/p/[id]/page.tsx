import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AdminPostActions from "@/app/components/feedback/admin-post-actions";
import Avatar from "@/app/components/feedback/avatar";
import CommentSection from "@/app/components/feedback/comment-section";
import FeedbackKindBadge from "@/app/components/feedback/kind-badge";
import Markdown from "@/app/components/feedback/markdown";
import MoveMenu from "@/app/components/feedback/move-menu";
import PostOwnerActions from "@/app/components/feedback/post-owner-actions";
import ProductTag from "@/app/components/feedback/product-tag";
import ShareButton from "@/app/components/feedback/share-button";
import StatusChip from "@/app/components/feedback/status-chip";
import VoteButton from "@/app/components/feedback/vote-button";
import { CommentIcon, VoteUpIcon } from "@/app/components/feedback/icons";
import { getCompanyById } from "@/lib/companies";
import { listComments } from "@/lib/feedback/comments";
import { formatDate, formatNumber, feedbackKind, typeLabel } from "@/lib/feedback/labels";
import { mediaUrl } from "@/lib/feedback/media";
import { productContext } from "@/lib/feedback/product";
import { getPostDetail, isUuid, listFeed } from "@/lib/feedback/posts";
import { getViewer, isAdminRequest } from "@/lib/feedback/viewer";
import { translator } from "@/lib/i18n/locale";
import type { Locale } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const [post, locale] = await Promise.all([getPostDetail(id, { isAdmin: false }), getLocale()]);
  const t = translator(locale);
  if (!post) return { title: t("فیدبک پیدا نشد | وسا", "Feedback not found | Vasa") };
  return { title: `${post.title} | ${t("وسا", "Vasa")}` };
}

function fileSize(bytes: number, locale: Locale): string {
  if (bytes >= 1024 * 1024) {
    return `${formatNumber(Math.round((bytes / (1024 * 1024)) * 10) / 10, locale)} MB`;
  }
  return `${formatNumber(Math.max(1, Math.round(bytes / 1024)), locale)} KB`;
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const [viewer, admin] = await Promise.all([getViewer(), isAdminRequest()]);
  const post = await getPostDetail(id, { userId: viewer?.userId, isAdmin: admin });
  if (!post) notFound();

  if (post.type === "feedback" && post.companyId) {
    const company = await getCompanyById(post.companyId);
    if (company) redirect(`/c/${company.slug}/p/${post.id}`);
  }

  const locale = await getLocale();
  const t = translator(locale);
  const isAuthor = viewer?.userId === post.authorId;
  const cover = post.coverPath ? mediaUrl(post.coverPath) : "";
  const isSupport = post.type === "support";
  const kind = feedbackKind(post.type, post.category);
  const showVote = !isSupport && !post.hidden;
  const source = productContext(post.product);

  const [related, comments] = await Promise.all([
    !isSupport && post.product
      ? listFeed({
          product: post.product,
          excludeId: post.id,
          viewerId: viewer?.userId,
          limit: 3,
        })
      : Promise.resolve([]),
    isSupport ? Promise.resolve([]) : listComments(post.id, viewer?.userId),
  ]);

  const backHref = isSupport ? "/requests" : "/feed";
  const backLabel = isSupport ? t("درخواست‌های من", "Your posts") : t("بازگشت به بردها", "Back to boards");

  return (
    <div className="fb-detail">
      <div className="fb-detail-main">
        <div className="fb-detail-topline">
          <Link href={backHref} className="fb-back">
            <span aria-hidden="true">→</span>
            {backLabel}
          </Link>
          {post.hidden ? (
            <span className="fb-chip urgent">{t("پنهان از دید عمومی", "Hidden from the public")}</span>
          ) : null}
        </div>

        <header className="fb-detail-head">
          {source ? <ProductTag product={post.product} productUrl={post.productUrl} /> : null}

          <div className="fb-card-top">
            {kind ? <FeedbackKindBadge kind={kind} locale={locale} /> : null}
            {isSupport || isAuthor ? (
              <span className="fb-chip">{typeLabel(post.type, locale)}</span>
            ) : null}
            <StatusChip status={post.status} locale={locale} />
          </div>

          <h1 className="fb-detail-title">{post.title}</h1>

          <div className="fb-meta-row">
            <Avatar
              name={post.authorName ?? t("کاربر", "Member")}
              src={post.authorAvatarPath ? mediaUrl(post.authorAvatarPath) : null}
              size={26}
            />
            <span className="fb-author">{post.authorName ?? t("کاربر", "Member")}</span>
            <span className="fb-dot" aria-hidden="true" />
            <time dateTime={post.createdAt.toISOString()}>{formatDate(post.createdAt, locale)}</time>
          </div>
        </header>

        {cover ? <img className="fb-cover-wide" src={cover} alt="" /> : null}

        <section className="fb-detail-panel" aria-label={t("متن فیدبک", "Feedback text")}>
          <div className="fb-detail-panel-head">
            <h2>{isSupport ? t("متن درخواست", "Request text") : t("درباره این فیدبک", "About this feedback")}</h2>
          </div>
          <Markdown source={post.body} />
        </section>

        {isSupport ? null : (
          <div className="fb-detail-actions">
            {showVote ? (
              <VoteButton
                postId={post.id}
                count={post.upvotes}
                upvoted={post.viewerUpvoted}
                signedIn={Boolean(viewer)}
                nextPath={`/p/${post.id}`}
              />
            ) : null}
            <a
              href="#comments"
              className="fb-action-btn"
              aria-label={t(
                `${formatNumber(post.commentCount, locale)} کامنت`,
                `${formatNumber(post.commentCount, locale)} comments`,
              )}
              title={t("رفتن به گفتگو", "Jump to the conversation")}
            >
              <CommentIcon size={15} />
              <span>{formatNumber(post.commentCount, locale)}</span>
            </a>
            {post.hidden ? null : <ShareButton path={`/p/${post.id}`} title={post.title} label />}
          </div>
        )}

        {post.attachments.length > 0 ? (
          <div className="fb-attachments">
            <h2 className="label">{t("پیوست‌ها", "Attachments")}</h2>
            {post.attachments.map((file) =>
              file.fileType.startsWith("image/") ? (
                <a
                  key={file.id}
                  className="fb-attachment"
                  href={mediaUrl(file.path)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span dir="ltr">{file.fileName}</span>
                  <span>{fileSize(file.size, locale)}</span>
                </a>
              ) : (
                <a
                  key={file.id}
                  className="fb-attachment"
                  href={mediaUrl(file.path)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span dir="ltr">{file.fileName}</span>
                  <span>{fileSize(file.size, locale)} · PDF</span>
                </a>
              ),
            )}
          </div>
        ) : null}

        {isSupport && isAuthor ? (
          <p className="fb-note">
            {t(
              "این درخواست خصوصیه. فقط خودت و تیم پشتیبانی می‌بینیدش. پاسخ تیم هم همین‌جا میاد.",
              "This request is private. Only you and the support team can see it, and the reply lands right here.",
            )}
          </p>
        ) : null}

        {post.adminReply ? (
          <div className="fb-reply">
            <h3>{t("پاسخ تیم پشتیبانی", "Reply from support")}</h3>
            <Markdown source={post.adminReply} className="fb-prose" />
          </div>
        ) : null}

        {isSupport ? null : (
          <CommentSection
            postId={post.id}
            postAuthorId={post.authorId}
            comments={comments}
            signedIn={Boolean(viewer)}
            viewerId={viewer?.userId ?? null}
            nextPath={`/p/${post.id}`}
            locked={post.hidden}
          />
        )}

        {related.length > 0 ? (
          <section className="fb-detail-related" aria-labelledby="related-title">
            <div className="fb-detail-related-head">
              <div>
                <h2 id="related-title">{t("فیدبک‌های همین محصول", "More from this product")}</h2>
                <p>{t(`بقیه چیزهایی که برای ${source?.label ?? "این محصول"} نوشتن.`, `Other feedback written for ${source?.label ?? "this product"}.`)}</p>
              </div>
              <Link href="/feed" className="fb-link">
                {t("همه", "All")}
              </Link>
            </div>
            <div className="fb-related-list">
              {related.map((item) => (
                <Link key={item.id} href={`/p/${item.id}`} className="fb-related-row">
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

        <div className="fb-detail-foot">
          {admin ? (
            <>
              {isSupport ? (
                <Link href="/admin/inbox" className="fb-btn fb-btn-ghost fb-btn-sm">
                  {t("پاسخ در صندوق پشتیبانی", "Reply in the support inbox")}
                </Link>
              ) : (
                <MoveMenu postId={post.id} status={post.status} />
              )}
              <AdminPostActions postId={post.id} hidden={post.hidden} />
            </>
          ) : (
            <>
              <Link href={isSupport ? "/requests" : "/feed"} className="fb-btn fb-btn-ghost">
                {isSupport ? t("همه درخواست‌های من", "All your posts") : t("ادامه در فید", "Continue to boards")}
              </Link>
              {isAuthor && !isSupport ? <PostOwnerActions postId={post.id} /> : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
