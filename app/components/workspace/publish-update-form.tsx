"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { publishUpdateAction } from "@/app/(workspace)/actions";
import type { ChangelogLinkedPost } from "@/lib/feedback/changelog";

export default function PublishUpdateForm({
  candidates,
}: {
  candidates: ChangelogLinkedPost[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setPublished(false);

    const result = await publishUpdateAction({ title, body, postIds: selected });
    setBusy(false);

    if (result.ok) {
      setTitle("");
      setBody("");
      setSelected([]);
      setFilter("");
      setPublished(true);
      router.refresh();
      return;
    }
    setError(result.error);
  }

  const needle = filter.trim().toLowerCase();
  const visible = needle
    ? candidates.filter((post) => post.title.toLowerCase().includes(needle))
    : candidates;

  return (
    <form className="wk-form" onSubmit={submit}>
      <div className="wk-field-row">
        <label htmlFor="update-title">Title</label>
        <input
          id="update-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Search is now twice as fast"
          maxLength={140}
          minLength={3}
          required
          disabled={busy}
        />
      </div>

      <div className="wk-field-row">
        <label htmlFor="update-body">
          What changed <span className="wk-hint">(Markdown)</span>
        </label>
        <textarea
          id="update-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={"## What shipped\n\n- ..."}
          maxLength={20000}
          required
          disabled={busy}
        />
      </div>

      <div className="wk-field-row">
        <label>
          Feedback this resolves{" "}
          <span className="wk-hint">({selected.length} selected)</span>
        </label>
        <input
          type="search"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Search feedback"
          disabled={busy || candidates.length === 0}
        />
        <div className="wk-select-list">
          {visible.length === 0 ? (
            <p className="wk-hint" style={{ padding: "8px" }}>
              No feedback to link.
            </p>
          ) : (
            visible.map((post) => (
              <label key={post.id} className="wk-check">
                <input
                  type="checkbox"
                  checked={selected.includes(post.id)}
                  onChange={() => toggle(post.id)}
                  disabled={busy}
                />
                <span>{post.title}</span>
              </label>
            ))
          )}
        </div>
        <p className="wk-hint">
          Linked feedback switches to Shipped when you publish.
        </p>
      </div>

      {error ? <p className="bd-alert">{error}</p> : null}
      {published ? <p className="wk-success">Published. It is live on your board.</p> : null}

      <div>
        <button
          type="submit"
          className="bd-btn bd-btn-primary"
          disabled={busy || body.trim().length < 10}
        >
          {busy ? "Publishing..." : "Publish update"}
        </button>
      </div>
    </form>
  );
}
