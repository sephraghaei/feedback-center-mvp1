import Link from "next/link";
import { excerpt, type PostSummary } from "@/lib/feedback/posts";
import { feedbackKind, typeLabel } from "@/lib/feedback/labels";
import { productBrand } from "@/lib/feedback/product";
import { translator } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";
import ProductMark from "./product-mark";
import VoteButton from "./vote-button";
import PostOwnerActions from "./post-owner-actions";
import FeedbackKindBadge from "./kind-badge";

export default async function PostCard({
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
  const locale = await getLocale();
  const t = translator(locale);
  const brand = productBrand(post.product, post.productUrl);
  const href = `/p/${post.id}`;
  const snippet = excerpt(post.body);
  const kind = feedbackKind(post.type, post.category);

  return (
    <article className={`fb-card${kind ? ` kind-${kind}` : ""}`} data-glow>
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
        <div className="fb-card-head">
          <span className="fb-card-company">
            {brand ? (
              <ProductMark brand={brand} size={30} />
            ) : (
              <span className="fb-mark fb-mark-plain" aria-hidden="true">
                ?
              </span>
            )}
            <span className="fb-card-product" dir="auto">
              {brand?.display ?? t("بدون محصول", "No product")}
            </span>
          </span>

          {kind ? <FeedbackKindBadge kind={kind} locale={locale} /> : null}
          {!kind && showType ? (
            <span className="fb-card-type-label">{typeLabel(post.type, locale)}</span>
          ) : null}

          {ownerActions ? (
            <PostOwnerActions
              postId={post.id}
              redirectTo={nextPath}
              label={post.type === "support" ? t("حذف درخواست", "Delete request") : t("حذف فیدبک", "Delete feedback")}
              confirmText={
                post.type === "support"
                  ? t(
                      "این درخواست پشتیبانی برای همیشه حذف شه؟",
                      "Delete this support request for good?",
                    )
                  : t(
                      "این فیدبک و همه کامنت‌هاش برای همیشه حذف شن؟",
                      "Delete this feedback and all its comments for good?",
                    )
              }
            />
          ) : null}
        </div>

        <h3 className="fb-card-title">
          <Link href={href}>{post.title}</Link>
        </h3>

        {snippet ? (
          <p className="fb-card-excerpt" dir="auto">
            {snippet}
          </p>
        ) : null}
      </div>
    </article>
  );
}
