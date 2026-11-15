import type { CSSProperties } from "react";
import Link from "next/link";
import { excerpt, type PostSummary } from "@/lib/feedback/posts";
import { CATEGORY_LABELS, TYPE_LABELS, faDate } from "@/lib/feedback/labels";
import { mediaUrl } from "@/lib/feedback/media";
import { productBrand } from "@/lib/feedback/product";
import Avatar from "./avatar";
import ProductMark from "./product-mark";
import StatusChip from "./status-chip";
import VoteButton from "./vote-button";
import PostOwnerActions from "./post-owner-actions";

export default function PostCard({
  post,
  signedIn,
  nextPath,
  showType = false,
  vote = true,
  ownerActions = false,
}: {
  post: PostSummary;
  signedIn: boolean;
  nextPath: string;
  showType?: boolean;
  vote?: boolean;
  ownerActions?: boolean;
}) {
  const cover = post.coverPath ? mediaUrl(post.coverPath) : "";
  const brand = productBrand(post.product);
  const category = post.category ? (CATEGORY_LABELS[post.category] ?? post.category) : null;
  const author = post.authorName ?? "کاربر";
  const href = `/p/${post.id}`;

  return (
    <article
      className="fb-card"
      data-spotlight
      style={brand ? ({ "--card-hue": brand.hue } as CSSProperties) : undefined}
    >
      {cover ? (
        <Link href={href} aria-label={post.title} className="fb-card-cover-link">
          <img className="fb-cover" src={cover} alt="" loading="lazy" />
        </Link>
      ) : null}

      <div className="fb-card-body">
        <div className="fb-card-head">
          <span className="fb-card-mark">
            {brand ? (
              <ProductMark brand={brand} size={38} />
            ) : (
              <span className="fb-mark fb-mark-plain" aria-hidden="true">
                ؟
              </span>
            )}
          </span>

          <div className="fb-card-id">
            <span className="fb-card-product" dir="auto">
              {brand?.display ?? "بدون محصول"}
            </span>
            <span className="fb-card-context">
              {showType ? (
                <>
                  <span>{TYPE_LABELS[post.type] ?? post.type}</span>
                  <span className="fb-dot" aria-hidden="true" />
                </>
              ) : null}
              {category ? (
                <>
                  <span>{category}</span>
                  <span className="fb-dot" aria-hidden="true" />
                </>
              ) : null}
              <time dateTime={new Date(post.createdAt).toISOString()}>{faDate(post.createdAt)}</time>
            </span>
          </div>

          <div className="fb-card-status">
            <StatusChip status={post.status} />
            {post.hidden ? <span className="fb-chip urgent">پنهان</span> : null}
          </div>
        </div>

        <h3 className="fb-card-title">
          <Link href={href}>{post.title}</Link>
        </h3>

        <p className="fb-excerpt">{excerpt(post.body)}</p>

        <div className="fb-card-foot">
          <span className="fb-card-author">
            <Avatar name={author} src={post.authorAvatarPath ? mediaUrl(post.authorAvatarPath) : null} size={22} />
            <span className="fb-author">{author}</span>
          </span>
          {ownerActions ? (
            <PostOwnerActions
              postId={post.id}
              redirectTo={nextPath}
              label={post.type === "support" ? "حذف درخواست" : "حذف فید‌بک"}
              confirmText={
                post.type === "support"
                  ? "این درخواست پشتیبانی برای همیشه حذف شود؟"
                  : "این فید‌بک با همه کامنت‌هایش برای همیشه حذف شود؟"
              }
            />
          ) : null}
          {vote ? (
            <VoteButton
              postId={post.id}
              count={post.upvotes}
              upvoted={post.viewerUpvoted}
              signedIn={signedIn}
              nextPath={nextPath}
            />
          ) : (
            <Link href={href} className="fb-card-open">
              مشاهده
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
