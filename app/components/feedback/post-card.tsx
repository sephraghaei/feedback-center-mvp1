import Link from "next/link";
import type { PostSummary } from "@/lib/feedback/posts";
import { TYPE_LABELS, faDate, faNumber } from "@/lib/feedback/labels";
import { productBrand } from "@/lib/feedback/product";
import ProductMark from "./product-mark";
import StatusChip from "./status-chip";
import VoteButton from "./vote-button";
import PostOwnerActions from "./post-owner-actions";
import QuickComment from "./quick-comment";
import ShareButton from "./share-button";
import { CommentIcon } from "./icons";

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
  const brand = productBrand(post.product, post.productUrl);
  const href = `/p/${post.id}`;

  return (
    <article className="fb-card">
      {vote ? (
        <div className="fb-card-vote">
          <VoteButton
            postId={post.id}
            count={post.upvotes}
            upvoted={post.viewerUpvoted}
            signedIn={signedIn}
            nextPath={nextPath}
          />
        </div>
      ) : null}

      <div className="fb-card-main">
        <h3 className="fb-card-title">
          <Link href={href}>{post.title}</Link>
        </h3>

        <p className="fb-card-meta">
          <span className="fb-card-brand">
            {brand ? (
              <ProductMark brand={brand} size={16} />
            ) : (
              <span className="fb-mark fb-mark-plain" aria-hidden="true">
                ؟
              </span>
            )}
            <span className="fb-card-product" dir="auto">
              {brand?.display ?? "بدون محصول"}
            </span>
          </span>

          {showType ? (
            <span className="fb-card-type">
              <span className="fb-dot" aria-hidden="true" />
              <span>{TYPE_LABELS[post.type] ?? post.type}</span>
            </span>
          ) : null}

          <span className="fb-card-date">
            <span className="fb-dot" aria-hidden="true" />
            <time dateTime={new Date(post.createdAt).toISOString()}>{faDate(post.createdAt)}</time>
          </span>

          <span className="fb-card-status">
            <StatusChip status={post.status} />
            {post.hidden ? <span className="fb-chip urgent">پنهان</span> : null}
          </span>
        </p>
      </div>

      <div className="fb-card-rail">
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

        {post.type === "feedback" ? (
          post.hidden ? (
            <Link
              href={`${href}#comments`}
              className="fb-action-btn"
              aria-label={`${faNumber(post.commentCount)} کامنت`}
              title="دیدن کامنت‌ها"
            >
              <CommentIcon size={15} />
              <span>{faNumber(post.commentCount)}</span>
            </Link>
          ) : (
            <QuickComment
              postId={post.id}
              count={post.commentCount}
              signedIn={signedIn}
              nextPath={nextPath}
            />
          )
        ) : (
          <Link href={href} className="fb-card-open">
            مشاهده
          </Link>
        )}

        {post.type === "feedback" && !post.hidden ? (
          <ShareButton path={href} title={post.title} />
        ) : null}
      </div>
    </article>
  );
}
