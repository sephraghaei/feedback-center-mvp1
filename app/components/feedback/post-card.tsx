import Link from "next/link";
import { excerpt, type PostSummary } from "@/lib/feedback/posts";
import { CATEGORY_LABELS, TYPE_LABELS, faDate } from "@/lib/feedback/labels";
import { mediaUrl } from "@/lib/feedback/media";
import ProductTag from "./product-tag";
import StatusChip from "./status-chip";
import VoteButton from "./vote-button";

export default function PostCard({
  post,
  signedIn,
  nextPath,
  showType = false,
  vote = true,
}: {
  post: PostSummary;
  signedIn: boolean;
  nextPath: string;
  showType?: boolean;
  vote?: boolean;
}) {
  const cover = post.coverPath ? mediaUrl(post.coverPath) : "";
  const href = `/p/${post.id}`;

  return (
    <article className="fb-card" data-spotlight>
      {cover ? (
        <Link href={href} aria-label={post.title}>
          <img className="fb-cover" src={cover} alt="" loading="lazy" />
        </Link>
      ) : null}

      <div className="fb-card-body">
        {post.product ? (
          <div className="fb-card-product">
            <ProductTag product={post.product} />
          </div>
        ) : null}

        <div className="fb-card-top">
          {showType ? <span className="fb-chip">{TYPE_LABELS[post.type] ?? post.type}</span> : null}
          {post.category ? <span className="fb-chip">{CATEGORY_LABELS[post.category] ?? post.category}</span> : null}
          <StatusChip status={post.status} />
          {post.hidden ? <span className="fb-chip urgent">پنهان</span> : null}
        </div>

        <h3 className="fb-card-title">
          <Link href={href}>{post.title}</Link>
        </h3>

        <p className="fb-excerpt">{excerpt(post.body)}</p>

        <div className="fb-card-foot">
          <span className="fb-author">{post.authorName ?? "کاربر"}</span>
          <span aria-hidden="true">·</span>
          <span>{faDate(post.createdAt)}</span>
          {vote ? (
            <VoteButton
              postId={post.id}
              count={post.upvotes}
              upvoted={post.viewerUpvoted}
              signedIn={signedIn}
              nextPath={nextPath}
            />
          ) : (
            <Link href={href} className="fb-link" style={{ marginInlineStart: "auto" }}>
              مشاهده
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
