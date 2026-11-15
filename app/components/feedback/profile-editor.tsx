"use client";

import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { saveProfileAction } from "@/app/feedback-actions";
import { AVATAR_MAX_BYTES, AVATAR_TYPES } from "@/lib/feedback/constants";
import { mediaUrl } from "@/lib/feedback/media";
import { toPersianDigits } from "@/lib/phone";
import { MAX_BIO_LENGTH, SEX_OPTIONS } from "@/lib/profile";
import Avatar from "./avatar";

type ProfileValues = {
  name: string;
  bio: string;
  company: string;
  age: string;
  sex: string;
  avatarPath: string | null;
};

type UploadResponse = {
  files?: { path: string }[];
  message?: string;
};

const UPLOAD_ACCEPT = AVATAR_TYPES.join(",");

export default function ProfileEditor({
  profile,
  joinedLabel,
  contact,
  roleLabel,
  children,
}: {
  profile: ProfileValues;
  joinedLabel: string;
  contact: string | null;
  roleLabel: string | null;
  children?: ReactNode;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<ProfileValues>(profile);
  const [draft, setDraft] = useState<ProfileValues>(profile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const avatarSrc = values.avatarPath ? mediaUrl(values.avatarPath) || null : null;
  const draftAvatarSrc = draft.avatarPath ? mediaUrl(draft.avatarPath) || null : null;

  function startEditing() {
    setDraft(values);
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setDraft(values);
    setError(null);
    setEditing(false);
  }

  function patch(patchValue: Partial<ProfileValues>) {
    setDraft((current) => ({ ...current, ...patchValue }));
  }

  function pickAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!AVATAR_TYPES.includes(file.type)) {
      setError("برای عکس پروفایل فقط PNG، JPG، WebP یا GIF مجاز است.");
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setError("حجم عکس پروفایل باید کمتر از ۴ مگابایت باشد.");
      return;
    }

    setError(null);
    setProgress(0);
    const form = new FormData();
    form.append("files", file);
    form.append("kind", "avatar");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/uploads");
    xhr.upload.onprogress = (progressEvent) => {
      if (!progressEvent.lengthComputable) return;
      setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
    };
    xhr.onload = () => {
      let data: UploadResponse = {};
      try {
        data = JSON.parse(xhr.responseText) as UploadResponse;
      } catch {
        data = {};
      }
      const uploaded = data.files?.[0];
      if (xhr.status === 200 && uploaded) {
        patch({ avatarPath: uploaded.path });
        setProgress(null);
        return;
      }
      setProgress(null);
      setError(data.message ?? "بارگذاری عکس انجام نشد.");
    };
    xhr.onerror = () => {
      setProgress(null);
      setError("بارگذاری عکس انجام نشد. اتصال را بررسی کن.");
    };
    xhr.send(form);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || progress !== null) return;
    setSaving(true);
    setError(null);

    const result = await saveProfileAction({
      name: draft.name,
      bio: draft.bio,
      company: draft.company,
      age: draft.age,
      sex: draft.sex,
      avatarPath: draft.avatarPath,
    });
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setValues(draft);
    setEditing(false);
    router.refresh();
  }

  return (
    <form className={`fb-profile-hero${editing ? " is-editing" : ""}`} onSubmit={save} noValidate>
      <div className="fb-profile-avatar-col">
        <div className="fb-profile-avatar-wrap">
          <Avatar
            name={editing ? draft.name : values.name}
            src={editing ? draftAvatarSrc : avatarSrc}
            size={96}
            className="fb-profile-avatar"
          />
          {editing ? (
            <button
              type="button"
              className="fb-profile-avatar-btn"
              onClick={() => fileRef.current?.click()}
              disabled={progress !== null || saving}
            >
              تغییر عکس
            </button>
          ) : null}
          <input
            ref={fileRef}
            type="file"
            accept={UPLOAD_ACCEPT}
            className="sr-only"
            onChange={pickAvatar}
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
        {editing ? (
          <div className="fb-profile-avatar-meta">
            {progress !== null ? (
              <span className="field-hint">بارگذاری {toPersianDigits(String(progress))}٪</span>
            ) : (
              <span className="field-hint">PNG، JPG یا WebP تا ۴ مگابایت</span>
            )}
            {draft.avatarPath ? (
              <button
                type="button"
                className="fb-profile-avatar-remove"
                onClick={() => patch({ avatarPath: null })}
                disabled={saving}
              >
                حذف عکس
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="fb-profile-identity">
        {editing ? (
          <>
            <label className="label" htmlFor="profile-name">
              نام نمایشی
            </label>
            <input
              id="profile-name"
              className="input fb-profile-name-input"
              value={draft.name}
              maxLength={60}
              onChange={(event) => patch({ name: event.target.value })}
              disabled={saving}
              required
            />

            <label className="label" htmlFor="profile-bio">
              معرفی کوتاه
            </label>
            <textarea
              id="profile-bio"
              className="input fb-profile-bio-input"
              value={draft.bio}
              maxLength={MAX_BIO_LENGTH}
              placeholder="مثلا روی چه محصولی کار می‌کنی یا چه چیزی برات مهمه."
              onChange={(event) => patch({ bio: event.target.value })}
              disabled={saving}
            />
            <p className="field-hint">
              {toPersianDigits(String(draft.bio.length))} از {toPersianDigits(String(MAX_BIO_LENGTH))} نویسه
            </p>

            <div className="fb-profile-grid">
              <label className="fb-profile-field">
                <span className="label">شرکت</span>
                <input
                  className="input"
                  value={draft.company}
                  maxLength={80}
                  onChange={(event) => patch({ company: event.target.value })}
                  disabled={saving}
                />
              </label>
              <label className="fb-profile-field">
                <span className="label">سن</span>
                <input
                  className="input ltr"
                  type="number"
                  inputMode="numeric"
                  min={5}
                  max={120}
                  value={draft.age}
                  onChange={(event) => patch({ age: event.target.value })}
                  disabled={saving}
                />
              </label>
              <label className="fb-profile-field">
                <span className="label">جنسیت</span>
                <select
                  className="input"
                  value={draft.sex}
                  onChange={(event) => patch({ sex: event.target.value })}
                  disabled={saving}
                >
                  <option value="">انتخاب نکن</option>
                  {SEX_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {error ? <p className="field-error">{error}</p> : null}

            <div className="fb-profile-actions">
              <button
                type="submit"
                className="fb-btn fb-btn-primary"
                disabled={saving || progress !== null || draft.name.trim().length < 2}
              >
                {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </button>
              <button type="button" className="fb-btn" onClick={cancel} disabled={saving}>
                انصراف
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="fb-eyebrow">پروفایل</p>
            <h1 className="fb-profile-title">{values.name}</h1>
            <p className="fb-profile-meta">
              {roleLabel ? <span className="fb-profile-role">{roleLabel}</span> : null}
              <span>عضو از {joinedLabel}</span>
              {contact ? <span dir="auto">{contact}</span> : null}
            </p>
            {values.bio ? (
              <p className="fb-profile-bio">{values.bio}</p>
            ) : (
              <p className="fb-profile-bio is-empty">
                یک معرفی کوتاه از خودت بنویس تا بقیه بدانند با کی حرف می‌زنند.
              </p>
            )}
            <div className="fb-profile-actions">
              <button type="button" className="fb-btn fb-btn-primary" onClick={startEditing}>
                ویرایش پروفایل
              </button>
              {children}
            </div>
          </>
        )}
      </div>
    </form>
  );
}
