"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { publishChangelogAction } from "@/app/feedback-actions";
import { CATEGORY_LABELS } from "@/lib/feedback/labels";
import type { ChangelogLinkedPost } from "@/lib/feedback/changelog";

export default function ChangelogForm({ candidates }: { candidates: ChangelogLinkedPost[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState<string | null>(null);

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
    setPublished(null);

    const result = await publishChangelogAction({ title, body, postIds: selected });
    setBusy(false);

    if (result.ok) {
      setTitle("");
      setBody("");
      setSelected([]);
      setFilter("");
      setPublished(result.id);
      router.refresh();
      return;
    }
    setError(result.error);
  }

  const needle = filter.trim();
  const visible = needle
    ? candidates.filter((post) => post.title.toLowerCase().includes(needle.toLowerCase()))
    : candidates;

  return (
    <form className="panel" onSubmit={submit} style={{ padding: 18, display: "grid", gap: 14 }}>
      <div className="field">
        <label htmlFor="entry-title">عنوان ورودی</label>
        <input
          id="entry-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="مثلا: ارسال پیوست حالا ساده‌تر شد"
          maxLength={140}
          minLength={3}
          required
          disabled={busy}
        />
      </div>

      <div className="field">
        <label htmlFor="entry-body">
          متن تغییرات <span className="opt">(Markdown)</span>
        </label>
        <textarea
          id="entry-body"
          rows={6}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={"## چه چیزی تغییر کرد\n\n- ..."}
          maxLength={20000}
          required
          disabled={busy}
        />
      </div>

      <div className="field">
        <label>
          بازخوردهای حل شده{" "}
          <span className="opt">
            ({selected.length} انتخاب شده)
          </span>
        </label>
        <input
          type="search"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="جستجو در بازخوردها"
          disabled={busy || candidates.length === 0}
        />
        <div
          style={{
            border: "1px solid var(--input-line)",
            borderRadius: "var(--radius)",
            maxHeight: 220,
            overflowY: "auto",
            padding: "6px 12px",
          }}
        >
          {visible.length === 0 ? (
            <p style={{ margin: "10px 0", fontSize: "0.78rem", color: "var(--ink-3)" }}>
              بازخوردی برای انتخاب نیست.
            </p>
          ) : (
            visible.map((post) => (
              <label
                key={post.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "7px 0",
                  fontSize: "0.8rem",
                  color: "var(--ink-2)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  className="check"
                  checked={selected.includes(post.id)}
                  onChange={() => toggle(post.id)}
                  disabled={busy}
                />
                <span>
                  {post.category ? (
                    <span style={{ color: "var(--ink-4)" }}>
                      {CATEGORY_LABELS[post.category] ?? post.category} ·{" "}
                    </span>
                  ) : null}
                  {post.title}
                </span>
              </label>
            ))
          )}
        </div>
        <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--ink-4)" }}>
          با انتشار، این بازخوردها خودکار به وضعیت «منتشر شده» می‌روند.
        </p>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {published ? (
        <p className="pill ok" style={{ justifySelf: "start" }}>
          منتشر شد.{" "}
          <Link href={`/changelog/${published}`} className="ltr" style={{ textDecoration: "underline" }}>
            مشاهده ورودی
          </Link>
        </p>
      ) : null}

      <div>
        <button type="submit" className="btn btn-primary" disabled={busy || body.trim().length < 10}>
          {busy ? "در حال انتشار..." : "انتشار تغییرات"}
        </button>
      </div>
    </form>
  );
}
