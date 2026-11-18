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
  KIND_LABELS,
  STATUS_LABELS,
} from "@/lib/feedback/labels";
import { mediaUrl } from "@/lib/feedback/media";
import { getPostDetail, isUuid, listFeed } from "@/lib/feedback/posts";
import { getViewer, isAdminRequest } from "@/lib/feedback/viewer";

type Params = { slug: string; id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, id } = await params;
  const [company, post] = await Promise.all([
    getCompanyBySlug(slug),
    getPostDetail(id, { isAdmin: false }),
  ]);
  if (!company || !post) return { title: "Feedback | Vasa" };
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
        Back to feedback
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
                {kind ? <FeedbackKindBadge kind={kind} /> : null}
                <StatusChip status={post.status} />
              </div>
              <h1>{post.title}</h1>
              <div className="bd-detail-author">
                <Avatar
                  name={post.authorName ?? "Member"}
                  src={post.authorAvatarPath ? mediaUrl(post.authorAvatarPath) : null}
                  size={20}
                />
                {post.authorName ?? "Member"}
                <span className="bd-meta-dot" aria-hidden="true" />
                <time dateTime={post.createdAt.toISOString()}>{formatDate(post.createdAt)}</time>
              </div>
            </div>
          </header>

          <div className="bd-detail-body">
            <Markdown source={post.body} />
          </div>

          {post.attachments.length > 0 ? (
            <div className="fb-attachments">
              <h2 className="label">Attachments</h2>
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
              {formatNumber(post.commentCount)}
            </a>
            <a
              className="fb-action-btn"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ShareIcon size={14} />
              Share
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
                  <h2 id="related-title">More from this board</h2>
                  <p>Other feedback people shared with {company.name}.</p>
                </div>
                <Link href={base} className="fb-link">
                  All
                </Link>
              </div>
              <div className="fb-related-list">
                {related.map((item) => (
                  <Link key={item.id} href={`${base}/p/${item.id}`} className="fb-related-row">
                    <strong>{item.title}</strong>
                    <span className="fb-related-votes">
                      <VoteUpIcon size={11} />
                      {formatNumber(item.upvotes)}
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
              <dt>Board</dt>
              <dd>{kind ? KIND_LABELS[kind] : "Feedback"}</dd>
            </div>
            <div className="bd-rail-row">
              <dt>Status</dt>
              <dd>
                <StatusChip status={post.status} />
              </dd>
            </div>
            <div className="bd-rail-row">
              <dt>Created by</dt>
              <dd>
                <span className="bd-rail-person">
                  <Avatar
                    name={post.authorName ?? "Member"}
                    src={post.authorAvatarPath ? mediaUrl(post.authorAvatarPath) : null}
                    size={18}
                  />
                  {post.authorName ?? "Member"}
                </span>
              </dd>
            </div>
            <div className="bd-rail-row">
              <dt>Date</dt>
              <dd>{formatDate(post.createdAt)}</dd>
            </div>
            <div className="bd-rail-row">
              <dt>Votes</dt>
              <dd>{formatNumber(post.upvotes)}</dd>
            </div>
          </dl>

          <div className="bd-rail-actions">
            {canManage ? (
              <form action={updateFeedbackStatusAction} className="bd-status-form">
                <input type="hidden" name="slug" value={company.slug} />
                <input type="hidden" name="postId" value={post.id} />
                <input type="hidden" name="back" value={here} />
                <label className="bd-rail-label" htmlFor="status-select">
                  Move this feedback
                </label>
                <select id="status-select" name="status" defaultValue={post.status}>
                  {Object.entries(STATUS_LABELS)
                    .filter(([value]) => ["new", "planned", "in_progress", "shipped"].includes(value))
                    .map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                </select>
                <button type="submit">Save status</button>
              </form>
            ) : (
              <p className="bd-rail-hint">
                Voting helps {company.name} decide what to build next.
              </p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
