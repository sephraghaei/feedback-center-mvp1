"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { saveProfileAction } from "@/app/feedback-actions";
import { mediaUrl } from "@/lib/feedback/media";
import { MAX_BIO_LENGTH, SEX_OPTIONS, sexLabel } from "@/lib/profile";
import { formatNumber } from "@/lib/feedback/labels";
import { useLocale, useT } from "@/lib/i18n/client";
import Avatar from "./avatar";

type ProfileValues = {
  name: string;
  bio: string;
  company: string;
  age: string;
  sex: string;
  avatarPath: string | null;
};

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
  const locale = useLocale();
  const t = useT();
  const router = useRouter();
  const [values, setValues] = useState<ProfileValues>(profile);
  const [draft, setDraft] = useState<ProfileValues>(profile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatarSrc = values.avatarPath ? mediaUrl(values.avatarPath) || null : null;

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

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
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
            src={avatarSrc}
            size={96}
            className="fb-profile-avatar"
          />
        </div>
      </div>

      <div className="fb-profile-identity">
        {editing ? (
          <>
            <label className="label" htmlFor="profile-name">
              {t("نام نمایشی", "Display name")}
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
              {t("معرفی کوتاه", "Short bio")}
            </label>
            <textarea
              id="profile-bio"
              className="input fb-profile-bio-input"
              value={draft.bio}
              maxLength={MAX_BIO_LENGTH}
              placeholder={t(
                "مثلا روی چه محصولی کار می‌کنی یا چه چیزی برات مهمه.",
                "What you work on, or what matters to you.",
              )}
              onChange={(event) => patch({ bio: event.target.value })}
              disabled={saving}
            />
            <p className="field-hint">
              {t(
                `${formatNumber(draft.bio.length, locale)} از ${formatNumber(MAX_BIO_LENGTH, locale)} نویسه`,
                `${formatNumber(draft.bio.length, locale)} of ${formatNumber(MAX_BIO_LENGTH, locale)} characters`,
              )}
            </p>

            <div className="fb-profile-grid">
              <label className="fb-profile-field">
                <span className="label">{t("شرکت", "Company")}</span>
                <input
                  className="input"
                  value={draft.company}
                  maxLength={80}
                  onChange={(event) => patch({ company: event.target.value })}
                  disabled={saving}
                />
              </label>
              <label className="fb-profile-field">
                <span className="label">{t("سن", "Age")}</span>
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
                <span className="label">{t("جنسیت", "Gender")}</span>
                <select
                  className="input"
                  value={draft.sex}
                  onChange={(event) => patch({ sex: event.target.value })}
                  disabled={saving}
                >
                  <option value="">{t("انتخاب نکن", "Prefer not to say")}</option>
                  {SEX_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {sexLabel(option, locale)}
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
                disabled={saving || draft.name.trim().length < 2}
              >
                {saving ? t("در حال ذخیره...", "Saving...") : t("ذخیره تغییرات", "Save changes")}
              </button>
              <button type="button" className="fb-btn" onClick={cancel} disabled={saving}>
                {t("انصراف", "Cancel")}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="fb-eyebrow">{t("پروفایل", "Profile")}</p>
            <h1 className="fb-profile-title">{values.name}</h1>
            <p className="fb-profile-meta">
              {roleLabel ? <span className="fb-profile-role">{roleLabel}</span> : null}
              <span>{t(`عضو از ${joinedLabel}`, `Member since ${joinedLabel}`)}</span>
              {contact ? <span dir="auto">{contact}</span> : null}
            </p>
            {values.bio ? (
              <p className="fb-profile-bio">{values.bio}</p>
            ) : (
              <p className="fb-profile-bio is-empty">
                {t(
                  "یک معرفی کوتاه از خودت بنویس تا بقیه بدانند با کی حرف می‌زنند.",
                  "Add a short bio so people know who they are talking to.",
                )}
              </p>
            )}
            <div className="fb-profile-actions">
              <button type="button" className="fb-btn fb-btn-primary" onClick={startEditing}>
                {t("ویرایش پروفایل", "Edit profile")}
              </button>
              {children}
            </div>
          </>
        )}
      </div>
    </form>
  );
}
