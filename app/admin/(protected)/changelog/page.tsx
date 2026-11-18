import type { Metadata } from "next";
import { Icon } from "../../components/bits";
import ChangelogForm from "../../components/changelog-form";
import { resolveableFeedback, listChangelog } from "@/lib/feedback/changelog";
import { formatDate, formatNumber } from "@/lib/feedback/labels";
import { translator } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = translator(await getLocale());
  return { title: t("تغییرات | وسا", "Updates | Vasa") };
}

export default async function AdminChangelogPage() {
  const [entries, candidates] = await Promise.all([listChangelog(50), resolveableFeedback()]);
  const locale = await getLocale();
  const t = translator(locale);

  return (
    <>
      <div className="page-head">
        <div className="page-title-row">
          <h1 className="page-title">{t("تغییرات منتشر شده", "Published updates")}</h1>
          <span className="count-badge">{formatNumber(entries.length, locale)}</span>
        </div>
        <p className="page-sub">
          {t(
            "هر ورودی را با فیدبک‌هایی که حل کرده وصل کن. بعد از انتشار، آن فیدبک‌ها خودکار به وضعیت «منتشر شده» می‌روند و لینک ورودی رویشان می‌آید.",
            "Link each entry to the feedback it resolves. On publish, those feedback items move to Shipped and get a link to the entry.",
          )}
        </p>
      </div>

      <div style={{ display: "grid", gap: 20 }}>
        <section aria-labelledby="new-entry">
          <h2 id="new-entry" className="page-title" style={{ fontSize: "0.95rem", marginBottom: 10 }}>
            {t("ورودی تازه", "New entry")}
          </h2>
          <ChangelogForm candidates={candidates} />
        </section>

        <section aria-labelledby="entry-list">
          <h2 id="entry-list" className="page-title" style={{ fontSize: "0.95rem", marginBottom: 10 }}>
            {t("ورودی‌های قبلی", "Previous entries")}
          </h2>
          {entries.length === 0 ? (
            <div className="empty-state">
              <Icon name="calendar" size={26} />
              <h3>{t("هنوز ورودی‌ای منتشر نشده.", "No updates published yet.")}</h3>
              <p>{t("اولین تغییر منتشر شده را از فرم بالا بنویس.", "Write the first update in the form above.")}</p>
            </div>
          ) : (
            <div className="list-view">
              {entries.map((entry) => (
                <div key={entry.id} className="list-row">
                  <div>
                    <span className="name">{entry.title}</span>
                    <span className="meta">{formatDate(entry.publishedAt, locale)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
