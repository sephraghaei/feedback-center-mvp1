import Link from "next/link";
import CompanySettingsForm from "@/app/components/workspace/company-settings-form";
import { canManageCompany } from "@/lib/companies";
import { getT } from "@/lib/i18n/server";
import { getWorkspaceContext } from "@/lib/workspace";

export default async function WorkspaceSettingsPage() {
  const context = await getWorkspaceContext("/workspace/settings");
  if (!context) return null;
  const { company, viewer, admin } = context;
  const t = await getT();
  const canEdit = await canManageCompany(company.id, viewer.userId, admin);

  return (
    <>
      <header className="wk-head">
        <div>
          <h1>{t("تنظیمات", "Settings")}</h1>
          <p>
            {t(
              "اسم، شعار و رنگ اصلی‌ای که مشتری‌ها توی برد عمومیت می‌بینن.",
              "The name, tagline and accent customers see across your public board.",
            )}
          </p>
        </div>
        <div className="wk-head-actions">
          <Link href={`/c/${company.slug}`} className="bd-btn">
            {t("باز کردن برد", "Open board")}
          </Link>
        </div>
      </header>

      <div className="wk-grid-2">
        <section aria-labelledby="wk-company-form">
          <div className="wk-panel-head" style={{ paddingInline: 0 }}>
            <h2 id="wk-company-form">{t("پروفایل شرکت", "Company profile")}</h2>
          </div>
          <CompanySettingsForm
            company={{
              name: company.name,
              tagline: company.tagline,
              website: company.website,
              accent: company.accent,
            }}
            canEdit={canEdit}
          />
        </section>

        <section className="wk-panel" aria-labelledby="wk-board-preview">
          <div className="wk-panel-head">
            <h2 id="wk-board-preview">{t("نشانی برد", "Board address")}</h2>
          </div>
          <div className="wk-panel-body" style={{ paddingBlock: 16 }}>
            <p className="wk-hint" style={{ marginBottom: 6 }}>
              {t("این لینک رو با مشتری‌ها به اشتراک بذار.", "Share this link with customers.")}
            </p>
            <code
              dir="ltr"
              style={{
                display: "block",
                padding: "10px 12px",
                border: "1px solid var(--hairline)",
                borderRadius: 8,
                fontSize: "0.82rem",
                overflowX: "auto",
              }}
            >
              /c/{company.slug}
            </code>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
              <span
                className="wk-preview-swatch"
                style={{ background: company.accent }}
                aria-hidden="true"
              />
              <span className="wk-hint">
                {t(`رنگ فعلی ${company.accent}`, `Current accent ${company.accent}`)}
              </span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
