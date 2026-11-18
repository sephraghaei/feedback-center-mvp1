import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../../components/bits";
import SupportReply from "../../components/support-reply";
import { formatDate, formatNumber, statusLabel } from "@/lib/feedback/labels";
import { translator } from "@/lib/i18n/locale";
import type { Locale } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";
import { SUPPORT_STATUSES, excerpt, listSupportRequests } from "@/lib/feedback/posts";

export async function generateMetadata(): Promise<Metadata> {
  const t = translator(await getLocale());
  return { title: t("صندوق پشتیبانی | وسا", "Support inbox | Vasa") };
}

type Search = { status?: string };

function statusPill(status: string, locale: Locale) {
  if (status === "open") {
    return (
      <span className="pill warn">
        <span className="dot" />
        {statusLabel("open", locale)}
      </span>
    );
  }
  if (status === "answered") {
    return (
      <span className="pill ok">
        <span className="dot" />
        {statusLabel("answered", locale)}
      </span>
    );
  }
  return <span className="badge">{statusLabel("closed", locale)}</span>;
}

export default async function AdminInboxPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const status = params.status;
  const rows = await listSupportRequests(status);
  const locale = await getLocale();
  const t = translator(locale);

  const tabs = [
    { key: undefined, label: t("همه", "All") },
    ...SUPPORT_STATUSES.map((value) => ({ key: value, label: statusLabel(value, locale) })),
  ];

  return (
    <>
      <div className="page-head">
        <div className="page-title-row">
          <h1 className="page-title">{t("صندوق پشتیبانی", "Support inbox")}</h1>
          <span className="count-badge">{formatNumber(rows.length, locale)}</span>
        </div>
        <p className="page-sub">
          {t(
            "درخواست‌های شخصی کاربران. این موارد در هیچ صفحه عمومی نمایش داده نمی‌شوند و فقط نویسنده و مدیر به آن‌ها دسترسی دارند.",
            "Personal requests from users. They never appear on a public page and only the author and admins can see them.",
          )}
        </p>
      </div>

      <div className="toolbar">
        <div className="view-tabs" role="tablist" aria-label={t("فیلتر وضعیت", "Filter by status")}>
          {tabs.map((tab) => {
            const active = status === tab.key || (!status && !tab.key);
            const href = tab.key ? `/admin/inbox?status=${tab.key}` : "/admin/inbox";
            return (
              <Link
                key={tab.key ?? "all"}
                href={href}
                className={`view-tab ${active ? "active" : ""}`}
                role="tab"
                aria-selected={active}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="empty-state">
          <Icon name="mail" size={26} />
          <h3>{t("درخواستی با این فیلتر نیست.", "No requests match this filter.")}</h3>
          <p>
            {t(
              "وقتی کاربران درخواست شخصی ثبت کنند، همین‌جا برای پاسخ دادن ظاهر می‌شود.",
              "When users send a personal request, it shows up here so you can reply.",
            )}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {rows.map((row) => (
            <article key={row.id} className="panel" style={{ padding: 18 }}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 10,
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                  {statusPill(row.status, locale)}
                  <h2 className="name" style={{ margin: 0, fontSize: "0.95rem", fontWeight: 500 }}>
                    <Link href={`/p/${row.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {row.title}
                    </Link>
                  </h2>
                </div>
                <span className="cell-date">{formatDate(row.createdAt, locale)}</span>
              </div>

              <p className="page-sub" style={{ margin: "8px 0 0" }}>
                {row.authorName ?? t("کاربر", "Member")}
                {row.authorEmail ? (
                  <>
                    {" · "}
                    <span dir="ltr" className="ltr">
                      {row.authorEmail}
                    </span>
                  </>
                ) : null}
                {row.product ? (
                  <>
                    {" · "}
                    <span dir="auto">{row.product}</span>
                  </>
                ) : null}
              </p>

              <p style={{ margin: "10px 0 0", fontSize: "0.84rem", color: "var(--ink-2)", lineHeight: 1.9 }}>
                {excerpt(row.body)}
              </p>

              <SupportReply postId={row.id} status={row.status} reply={row.adminReply} />
            </article>
          ))}
        </div>
      )}
    </>
  );
}
