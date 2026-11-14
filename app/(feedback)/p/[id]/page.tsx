import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminPostActions from "@/app/components/feedback/admin-post-actions";
import Markdown from "@/app/components/feedback/markdown";
import StatusChip from "@/app/components/feedback/status-chip";
import VoteButton from "@/app/components/feedback/vote-button";
import MoveMenu from "@/app/components/feedback/move-menu";
import { CATEGORY_LABELS, TYPE_LABELS, faDate, faNumber } from "@/lib/feedback/labels";
import { mediaUrl } from "@/lib/feedback/media";
import { productContext } from "@/lib/feedback/product";
import { getPostDetail, isUuid } from "@/lib/feedback/posts";
import { getViewer, isAdminRequest } from "@/lib/feedback/viewer";

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostDetail(id, { isAdmin: false });
  if (!post) return { title: "بازخورد پیدا نشد | Feedback-center" };
  return { title: `${post.title} | Feedback-center` };
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

  return (
    <div className="fb-detail">
      <Link href={isSupport ? "/requests" : "/feed"} className="fb-back">
        <span aria-hidden="true">←</span>
        {isSupport ? "درخواست‌های من" : "بازگشت به فید"}
      </Link>

      <div className="fb-detail-head">
        <div className="fb-card-top">
          {isSupport || isAuthor ? <span className="fb-chip">{TYPE_LABELS[post.type] ?? post.type}</span> : null}
          {post.category ? (
            <span className="fb-chip">{CATEGORY_LABELS[post.category] ?? post.category}</span>
          ) : null}
          <StatusChip status={post.status} />
          {post.hidden ? <span className="fb-chip urgent">پنهان از دید عمومی</span> : null}
        </div>

        <h1 className="fb-detail-title">{post.title}</h1>

        <div className="fb-meta-row">
          <span className="fb-author">{post.authorName ?? "کاربر"}</span>
          <span aria-hidden="true">·</span>
          <span>{faDate(post.createdAt)}</span>
          {showVote ? (
            <>
              <span aria-hidden="true">·</span>
              <VoteButton
                postId={post.id}
                count={post.upvotes}
                upvoted={post.viewerUpvoted}
                signedIn={Boolean(viewer)}
                nextPath={`/p/${post.id}`}
              />
            </>
          ) : null}
        </div>

        {source ? (
          <p className="fb-source">
            <span className="fb-source-label">محصول یا سایت</span>
            {source.href ? (
              <a href={source.href} target="_blank" rel="noopener noreferrer" dir="ltr">
                {source.label}
              </a>
            ) : (
              <span dir="auto">{source.label}</span>
            )}
          </p>
        ) : null}
      </div>

      {cover ? <img className="fb-cover-wide" src={cover} alt="" /> : null}

      <div style={{ marginTop: 24 }}>
        <Markdown source={post.body} />
      </div>

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
          این بازخورد در تغییرات منتشر شده آمده است:{" "}
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
          <Link href={isSupport ? "/requests" : "/feed"} className="fb-btn fb-btn-ghost">
            {isSupport ? "همه درخواست‌های من" : "ادامه در فید"}
          </Link>
        )}
      </div>
    </div>
  );
}
