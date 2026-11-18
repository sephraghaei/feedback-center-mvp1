"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveCompanySettingsAction } from "@/app/(workspace)/actions";
import { useT } from "@/lib/i18n/client";

export default function CompanySettingsForm({
  company,
  canEdit,
}: {
  company: { name: string; tagline: string | null; website: string | null; accent: string };
  canEdit: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const [name, setName] = useState(company.name);
  const [tagline, setTagline] = useState(company.tagline ?? "");
  const [website, setWebsite] = useState(company.website ?? "");
  const [accent, setAccent] = useState(company.accent);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setSaved(false);

    const result = await saveCompanySettingsAction({ name, tagline, website, accent });
    setBusy(false);

    if (result.ok) {
      setSaved(true);
      router.refresh();
      return;
    }
    setError(result.error);
  }

  return (
    <form className="wk-form" onSubmit={submit}>
      <div className="wk-form-cols">
        <div className="wk-field-row">
          <label htmlFor="company-name">{t("نام شرکت", "Company name")}</label>
          <input
            id="company-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            minLength={2}
            required
            disabled={busy || !canEdit}
          />
        </div>

        <div className="wk-field-row">
          <label htmlFor="company-site">
            {t("وب‌سایت", "Website")} <span className="wk-hint">{t("(اختیاری)", "(optional)")}</span>
          </label>
          <input
            id="company-site"
            type="url"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            placeholder="https://example.com"
            disabled={busy || !canEdit}
          />
        </div>
      </div>

      <div className="wk-field-row">
        <label htmlFor="company-tagline">{t("شعار", "Tagline")}</label>
        <input
          id="company-tagline"
          value={tagline}
          onChange={(event) => setTagline(event.target.value)}
          placeholder={t("یک جمله درباره چیزی که می‌سازی", "One line about what you make")}
          maxLength={160}
          disabled={busy || !canEdit}
        />
        <p className="wk-hint">
          {t(
            "کنار اسم شرکت توی برد عمومی نشون داده می‌شه.",
            "Shown next to the company name on the public board.",
          )}
        </p>
      </div>

      <div className="wk-field-row">
        <label htmlFor="company-accent">{t("رنگ اصلی", "Accent color")}</label>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            id="company-accent"
            type="color"
            value={accent}
            onChange={(event) => setAccent(event.target.value)}
            disabled={busy || !canEdit}
            style={{ width: 48, height: 38, padding: 2 }}
          />
          <input
            aria-label={t("کد رنگ", "Accent hex value")}
            value={accent}
            onChange={(event) => setAccent(event.target.value)}
            pattern="#[0-9a-fA-F]{6}"
            maxLength={7}
            disabled={busy || !canEdit}
            style={{ maxWidth: 120 }}
          />
        </div>
        <p className="wk-hint">
          {t("برای دکمه‌ها و هایلایت‌های بردت استفاده می‌شه.", "Used for buttons and highlights on your board.")}
        </p>
      </div>

      {error ? <p className="bd-alert">{error}</p> : null}
      {saved ? (
        <p className="wk-success">{t("ذخیره شد. بردت به‌روزه.", "Saved. Your board is up to date.")}</p>
      ) : null}

      {canEdit ? (
        <div>
          <button type="submit" className="bd-btn bd-btn-primary" disabled={busy}>
            {busy ? t("در حال ذخیره...", "Saving...") : t("ذخیره تغییرات", "Save changes")}
          </button>
        </div>
      ) : (
        <p className="wk-hint">
          {t(
            "فقط مالک‌ها و مدیرهای شرکت می‌تونن این تنظیمات رو عوض کنن.",
            "Only company owners and admins can change these settings.",
          )}
        </p>
      )}
    </form>
  );
}
