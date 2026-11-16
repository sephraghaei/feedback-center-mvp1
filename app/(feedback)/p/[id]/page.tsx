import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminPostActions from "@/app/components/feedback/admin-post-actions";
import Avatar from "@/app/components/feedback/avatar";
import CommentSection from "@/app/components/feedback/comment-section";
import Markdown from "@/app/components/feedback/markdown";
import MoveMenu from "@/app/components/feedback/move-menu";
import PostOwnerActions from "@/app/components/feedback/post-owner-actions";
import ProductTag from "@/app/components/feedback/product-tag";
import ShareButton from "@/app/components/feedback/share-button";
import StatusChip from "@/app/components/feedback/status-chip";
import VoteButton from "@/app/components/feedback/vote-button";
import { CommentIcon, VoteUpIcon } from "@/app/components/feedback/icons";
import { listComments } from "@/lib/feedback/comments";
import { CATEGORY_LABELS, TYPE_LABELS, faDate, faNumber } from "@/lib/feedback/labels";
import { mediaUrl } from "@/lib/feedback/media";
import { productContext } from "@/lib/feedback/product";
import { getPostDetail, isUuid, listFeed } from "@/lib/feedback/posts";
import { getViewer, isAdminRequest } from "@/lib/feedback/viewer";

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostDetail(id, { isAdmin: false });
  if (!post) return { title: "فید‌بک پیدا نشد | وسا" };
  return { title: `${post.title} | وسا` };
}

function fileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${faNumber(Math.round((bytes / (1024 * 1024)) * 10) / 10)} مگابایت`;
  return `${faNumber(Math.max(1, Math.round(bytes / 1024)))} کیلوبایت`;
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const [viewer, admin] = await Promise.all([getViewer(), isAdminRequest()]);
  const post = await getPostDetail(id, { userId: viewer?.userId, isAdmin: admin });
  if (!post) notFound();

  const isAuthor = viewer?.userId === post.authorId;
  const cover = post.coverPath ? mediaUrl(post.coverPath) : "";
  const isSupport = post.type === "support";
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
  const backLabel = isSupport ? "درخواست‌های من" : "بازگشت به فید";

  return (
    <div className="fb-detail">
      <div className="fb-detail-main">
        <div className="fb-detail-topline">
          <Link href={backHref} className="fb-back">
            <span aria-hidden="true">→</span>
            {backLabel}
          </Link>
          {post.hidden ? <span className="fb-chip urgent">پنهان از دید عمومی</span> : null}
        </div>

        <header className="fb-detail-head">
          {source ? <ProductTag product={post.product} /> : null}

          <div className="fb-card-top">
            {isSupport || isAuthor ? (
              <span className="fb-chip">{TYPE_LABELS[post.type] ?? post.type}</span>
            ) : null}
            {post.category ? (
              <span className="fb-chip">{CATEGORY_LABELS[post.category] ?? post.category}</span>
            ) : null}
            <StatusChip status={post.status} />
          </div>

          <h1 className="fb-detail-title">{post.title}</h1>

          <div className="fb-meta-row">
            <Avatar
              name={post.authorName ?? "کاربر"}
              src={post.authorAvatarPath ? mediaUrl(post.authorAvatarPath) : null}
              size={26}
            />
            <span className="fb-author">{post.authorName ?? "کاربر"}</span>
            <span className="fb-dot" aria-hidden="true" />
            <time dateTime={post.createdAt.toISOString()}>{faDate(post.createdAt)}</time>
          </div>
        </header>

        {cover ? <img className="fb-cover-wide" src={cover} alt="" /> : null}

        <section className="fb-detail-panel" aria-label="متن فید‌بک">
          <div className="fb-detail-panel-head">
            <h2>{isSupport ? "متن درخواست" : "درباره این فید‌بک"}</h2>
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
              aria-label={`${faNumber(post.commentCount)} کامنت`}
              title="رفتن به گفتگو"
            >
              <CommentIcon size={15} />
              <span>{faNumber(post.commentCount)}</span>
            </a>
            {post.hidden ? null : <ShareButton path={`/p/${post.id}`} title={post.title} label />}
          </div>
        )}

      {post.attachments.length > 0 ? (
        <div className="fb-attachments">
          <h2 className="label">پیوست‌ها</h2>
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
                <span>{fileSize(file.size)}</span>
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
                <span>{fileSize(file.size)} · PDF</span>
              </a>
            ),
          )}
        </div>
      ) : null}

      {post.changelog ? (
        <p className="fb-note">
          این فید‌بک در تغییرات منتشر شده آمده است:{" "}
          <Link href={`/changelog/${post.changelog.id}`}>{post.changelog.title}</Link>
        </p>
      ) : null}

      {isSupport && isAuthor ? (
        <p className="fb-note">
          این درخواست خصوصی است. فقط تو و تیم پشتیبانی می‌توانید آن را ببینید. پاسخ تیم همین‌جا
          نمایش داده می‌شود.
        </p>
      ) : null}

      {post.adminReply ? (
        <div className="fb-reply">
          <h3>پاسخ تیم پشتیبانی</h3>
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
                <h2 id="related-title">فید‌بک‌های همین محصول</h2>
                <p>بقیه چیزهایی که برای {source?.label ?? "این محصول"} نوشته شده.</p>
              </div>
              <Link href="/feed" className="fb-link">
                همه
              </Link>
            </div>
            <div className="fb-related-list">
              {related.map((item) => (
                <Link key={item.id} href={`/p/${item.id}`} className="fb-related-row">
                  <strong>{item.title}</strong>
                  <span className="fb-related-votes">
                    <VoteUpIcon size={11} />
                    {faNumber(item.upvotes)}
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
                  پاسخ در صندوق پشتیبانی
                </Link>
              ) : (
                <MoveMenu postId={post.id} status={post.status} />
              )}
              <AdminPostActions postId={post.id} hidden={post.hidden} />
            </>
          ) : (
            <>
              <Link href={isSupport ? "/requests" : "/feed"} className="fb-btn fb-btn-ghost">
                {isSupport ? "همه درخواست‌های من" : "ادامه در فید"}
              </Link>
              {isAuthor && !isSupport ? <PostOwnerActions postId={post.id} /> : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
