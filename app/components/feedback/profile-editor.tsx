"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { saveProfileAction } from "@/app/feedback-actions";
import { mediaUrl } from "@/lib/feedback/media";
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
              Display name
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
              Short bio
            </label>
            <textarea
              id="profile-bio"
              className="input fb-profile-bio-input"
              value={draft.bio}
              maxLength={MAX_BIO_LENGTH}
              placeholder="What you work on, or what matters to you."
              onChange={(event) => patch({ bio: event.target.value })}
              disabled={saving}
            />
            <p className="field-hint">
              {draft.bio.length} of {MAX_BIO_LENGTH} characters
            </p>

            <div className="fb-profile-grid">
              <label className="fb-profile-field">
                <span className="label">Company</span>
                <input
                  className="input"
                  value={draft.company}
                  maxLength={80}
                  onChange={(event) => patch({ company: event.target.value })}
                  disabled={saving}
                />
              </label>
              <label className="fb-profile-field">
                <span className="label">Age</span>
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
                <span className="label">Gender</span>
                <select
                  className="input"
                  value={draft.sex}
                  onChange={(event) => patch({ sex: event.target.value })}
                  disabled={saving}
                >
                  <option value="">Prefer not to say</option>
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
                disabled={saving || draft.name.trim().length < 2}
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button type="button" className="fb-btn" onClick={cancel} disabled={saving}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="fb-eyebrow">Profile</p>
            <h1 className="fb-profile-title">{values.name}</h1>
            <p className="fb-profile-meta">
              {roleLabel ? <span className="fb-profile-role">{roleLabel}</span> : null}
              <span>Member since {joinedLabel}</span>
              {contact ? <span dir="auto">{contact}</span> : null}
            </p>
            {values.bio ? (
              <p className="fb-profile-bio">{values.bio}</p>
            ) : (
              <p className="fb-profile-bio is-empty">
                Add a short bio so people know who they are talking to.
              </p>
            )}
            <div className="fb-profile-actions">
              <button type="button" className="fb-btn fb-btn-primary" onClick={startEditing}>
                Edit profile
              </button>
              {children}
            </div>
          </>
        )}
      </div>
    </form>
  );
}
