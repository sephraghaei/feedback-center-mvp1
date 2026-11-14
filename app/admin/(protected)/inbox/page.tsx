import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../../components/bits";
import SupportReply from "../../components/support-reply";
import { STATUS_LABELS, faDate } from "@/lib/feedback/labels";
import { SUPPORT_STATUSES, excerpt, listSupportRequests } from "@/lib/feedback/posts";
import { toPersianDigits } from "@/lib/phone";

export const metadata: Metadata = { title: "صندوق پشتیبانی | Feedback-center" };

type Search = { status?: string };

function statusPill(status: string) {
  if (status === "open") {
    return (
      <span className="pill warn">
        <span className="dot" />
        {STATUS_LABELS.open}
      </span>
    );
  }
  if (status === "answered") {
    return (
      <span className="pill ok">
        <span className="dot" />
        {STATUS_LABELS.answered}
      </span>
    );
  }
  return <span className="badge">{STATUS_LABELS.closed}</span>;
}

export default async function AdminInboxPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const status = params.status;
  const rows = await listSupportRequests(status);

  const tabs = [
    { key: undefined, label: "همه" },
    ...SUPPORT_STATUSES.map((value) => ({ key: value, label: STATUS_LABELS[value] })),
  ];

  return (
    <>
      <div className="page-head">
        <div className="page-title-row">
          <h1 className="page-title">صندوق پشتیبانی</h1>
          <span className="count-badge">{toPersianDigits(String(rows.length))}</span>
        </div>
        <p className="page-sub">
          درخواست‌های شخصی کاربران. این موارد در هیچ صفحه عمومی نمایش داده نمی‌شوند و فقط
          نویسنده و مدیر به آن‌ها دسترسی دارند.
        </p>
      </div>

      <div className="toolbar">
        <div className="view-tabs" role="tablist" aria-label="فیلتر وضعیت">
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
          <h3>درخواستی با این فیلتر نیست.</h3>
          <p>وقتی کاربران درخواست شخصی ثبت کنند، همین‌جا برای پاسخ دادن ظاهر می‌شود.</p>
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
                  {statusPill(row.status)}
                  <h2 className="name" style={{ margin: 0, fontSize: "0.95rem", fontWeight: 500 }}>
                    <Link href={`/p/${row.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {row.title}
                    </Link>
                  </h2>
                </div>
                <span className="cell-date">{faDate(row.createdAt)}</span>
              </div>

              <p className="page-sub" style={{ margin: "8px 0 0" }}>
                {row.authorName ?? "کاربر"}
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
