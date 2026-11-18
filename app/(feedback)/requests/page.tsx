import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/app/components/brand-mark";
import PostCard from "@/app/components/feedback/post-card";
import { formatNumber } from "@/lib/feedback/labels";
import { listMyPosts } from "@/lib/feedback/posts";
import { requireViewer } from "@/lib/feedback/viewer";

export const metadata: Metadata = {
  title: "Your posts | Vasa",
  description: "Public feedback and private support requests, with live status.",
};

export default async function RequestsPage() {
  const viewer = await requireViewer("/requests");
  const posts = await listMyPosts(viewer.userId);

  const publicPosts = posts.filter((post) => post.type === "feedback" && !post.hidden);
  const supportPosts = posts.filter((post) => post.type === "support");
  const hiddenPosts = posts.filter((post) => post.type === "feedback" && post.hidden);

  return (
    <>
      <section className="fb-hero fb-page-head">
        <p className="fb-eyebrow">
          <BrandMark className="eyebrow-mark" simple />
          Your posts
        </p>
        <h1 className="fb-title">Everything you sent, in one place</h1>
        <p className="fb-lede">
          Follow your public feedback and private support requests, and see where each one
          stands right now.
        </p>
        <div className="fb-hero-actions">
          <Link href="/" className="fb-btn fb-btn-primary">
            Browse boards
          </Link>
          <Link href="/profile" className="fb-btn">
            My profile
          </Link>
        </div>
        <ul className="fb-hero-stats">
          <li>
            <strong>{formatNumber(publicPosts.length)}</strong> public feedback
          </li>
          <li>
            <strong>{formatNumber(supportPosts.length)}</strong> support requests
          </li>
        </ul>
      </section>

      {posts.length === 0 ? (
        <div className="fb-empty">
          <strong>Nothing sent yet.</strong>
          Open a board and post your first piece of feedback. It will show up here.
        </div>
      ) : null}

      {publicPosts.length > 0 ? (
        <section className="fb-section" aria-labelledby="mine-feedback">
          <div className="fb-section-head">
            <div>
              <h2 id="mine-feedback" className="fb-section-title">
                Public feedback
              </h2>
              <p className="fb-section-sub">Everything you posted for others to see.</p>
            </div>
            <p className="fb-count">{formatNumber(publicPosts.length)} items</p>
          </div>
          <div className="fb-grid">
            {publicPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                signedIn
                nextPath="/requests"
                showType
                vote={false}
                ownerActions
              />
            ))}
          </div>
        </section>
      ) : null}

      {supportPosts.length > 0 ? (
        <section className="fb-section" aria-labelledby="mine-support">
          <div className="fb-section-head">
            <div>
              <h2 id="mine-support" className="fb-section-title">
                Support requests
              </h2>
              <p className="fb-section-sub">
                Private: only you and the support team can see them.
              </p>
            </div>
            <p className="fb-count">{formatNumber(supportPosts.length)} items</p>
          </div>
          <div className="fb-grid">
            {supportPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                signedIn
                nextPath="/requests"
                showType
                vote={false}
                ownerActions
              />
            ))}
          </div>
        </section>
      ) : null}

      {hiddenPosts.length > 0 ? (
        <section className="fb-section" aria-labelledby="mine-hidden">
          <div className="fb-section-head">
            <div>
              <h2 id="mine-hidden" className="fb-section-title">
                Hidden
              </h2>
              <p className="fb-section-sub">
                An admin removed these from the public board. Only you and the admin can see
                them.
              </p>
            </div>
            <p className="fb-count">{formatNumber(hiddenPosts.length)} items</p>
          </div>
          <div className="fb-grid">
            {hiddenPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                signedIn
                nextPath="/requests"
                showType
                vote={false}
                ownerActions
              />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
