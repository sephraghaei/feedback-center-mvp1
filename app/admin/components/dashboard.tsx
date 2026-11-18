"use client";

import { useState } from "react";
import type { AdminStats } from "@/lib/admin-store";
import { formatNumber } from "@/lib/feedback/labels";
import { useLocale, useT } from "@/lib/i18n/client";
import { Icon, type IconName } from "./bits";

const METHOD_COLOR: Record<string, string> = {
  phone: "var(--chart-1)",
  email: "var(--chart-2)",
  clerk: "var(--chart-3)",
};
const METHOD_LABEL: Record<string, [string, string]> = {
  phone: ["موبایل", "Phone"],
  email: ["ایمیل", "Email"],
  clerk: ["Clerk", "Clerk"],
};
const SEX_COLOR = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

function percent(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: IconName;
  label: string;
  value: string;
  hint: React.ReactNode;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-icon">
          <Icon name={icon} size={19} />
        </span>
        <span className="stat-label">{label}</span>
      </div>
      <span className="stat-value">{value}</span>
      <span className="stat-hint">{hint}</span>
    </div>
  );
}

function SignupBars({ daily, range }: { daily: AdminStats["daily"]; range: number }) {
  const locale = useLocale();
  const t = useT();
  const data = daily.slice(-range);
  const max = Math.max(1, ...data.map((d) => d.count));
  const W = 600;
  const H = 190;
  const padT = 12;
  const padB = 26;
  const innerH = H - padT - padB;
  const n = data.length;
  const gap = n > 20 ? 3 : 6;
  const bw = (W - gap * (n - 1)) / n;
  const labelEvery = Math.max(1, Math.ceil(n / 6));
  const dateFmt = new Intl.DateTimeFormat(locale === "fa" ? "fa-IR-u-ca-persian" : "en-US", {
    day: "numeric",
    month: "numeric",
  });

  return (
    <svg
      className="bars-svg"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={t("نمودار ثبت‌نام روزانه", "Daily sign-ups")}
    >
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="bar-stop-top" />
          <stop offset="100%" className="bar-stop-bottom" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((tick) => (
        <line
          key={tick}
          className="chart-grid"
          x1="0"
          x2={W}
          y1={padT + innerH - innerH * tick}
          y2={padT + innerH - innerH * tick}
          strokeWidth="1"
          strokeDasharray="3 4"
        />
      ))}
      {data.map((d, i) => {
        const h = Math.max(d.count > 0 ? 3 : 0, (d.count / max) * innerH);
        const x = i * (bw + gap);
        const y = padT + innerH - h;
        return (
          <g key={d.date}>
            <rect x={x} y={y} width={bw} height={h} rx={Math.min(4, bw / 2)} fill="url(#barGrad)">
              <title>{`${d.date}: ${t(`${formatNumber(d.count, locale)} ثبت‌نام`, `${formatNumber(d.count, locale)} sign-ups`)}`}</title>
            </rect>
            {i % labelEvery === 0 ? (
              <text
                className="chart-axis"
                x={x + bw / 2}
                y={H - 8}
                fontSize="10"
                textAnchor="middle"
              >
                {dateFmt.format(new Date(d.date))}
              </text>
            ) : null}
          </g>
        );
      })}
      <line className="chart-baseline" x1="0" x2={W} y1={padT + innerH} y2={padT + innerH} strokeWidth="1" />
    </svg>
  );
}

function MethodDonut({ stats }: { stats: AdminStats }) {
  const locale = useLocale();
  const t = useT();
  const total = stats.methods.reduce((sum, m) => sum + m.count, 0);
  const r = 52;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const methodLabel = (method: string) => {
    const pair = METHOD_LABEL[method];
    return pair ? t(pair[0], pair[1]) : method;
  };

  return (
    <div className="donut-wrap">
      <svg
        width="150"
        height="150"
        viewBox="0 0 150 150"
        role="img"
        aria-label={t("سهم روش‌های ورود", "Share of sign-in methods")}
      >
        <circle className="donut-track" cx="75" cy="75" r={r} fill="none" strokeWidth="20" />
        {total > 0
          ? stats.methods.map((m) => {
              const frac = m.count / total;
              const dash = frac * c;
              const el = (
                <circle
                  key={m.method}
                  cx="75"
                  cy="75"
                  r={r}
                  fill="none"
                  style={{ stroke: METHOD_COLOR[m.method] }}
                  strokeWidth="20"
                  strokeDasharray={`${dash} ${c - dash}`}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 75 75)"
                >
                  <title>{`${methodLabel(m.method)}: ${formatNumber(m.count, locale)}`}</title>
                </circle>
              );
              offset += dash;
              return el;
            })
          : null}
        <text className="donut-total" x="75" y="72" textAnchor="middle" fontSize="24" fontWeight="500">
          {formatNumber(total, locale)}
        </text>
        <text className="donut-sub" x="75" y="92" textAnchor="middle" fontSize="10">
          {t("کاربر", "users")}
        </text>
      </svg>
      <div className="legend">
        {stats.methods.map((m) => (
          <div className="legend-item" key={m.method}>
            <span className="legend-dot" style={{ background: METHOD_COLOR[m.method] }} />
            {methodLabel(m.method)}
            <span className="val">
              {formatNumber(m.count, locale)} · {formatNumber(percent(m.count, total), locale)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ stats }: { stats: AdminStats }) {
  const locale = useLocale();
  const t = useT();
  const [range, setRange] = useState<7 | 14 | 30>(14);
  const rangeTotal = stats.daily.slice(-range).reduce((s, d) => s + d.count, 0);
  const maxSex = Math.max(1, ...stats.sexes.map((s) => s.count));
  const fa = (n: number) => formatNumber(n, locale);

  return (
    <>
      <div className="page-head">
        <div className="page-title-row">
          <h1 className="page-title">{t("داشبورد", "Dashboard")}</h1>
          <span className="count-badge">
            {t(`${fa(stats.totalUsers)} کاربر`, `${fa(stats.totalUsers)} users`)}
          </span>
        </div>
        <p className="page-sub">
          {t("نمای کلی و زنده از کاربران و ثبت‌نام‌های سامانه.", "A live overview of users and sign-ups.")}
        </p>
      </div>

      <div className="stat-grid">
        <StatCard
          icon="users"
          label={t("کل کاربران", "Total users")}
          value={fa(stats.totalUsers)}
          hint={
            <>
              <strong>{fa(stats.newLast7)}</strong>{" "}
              {t("کاربر جدید در ۷ روز گذشته", "new users in the last 7 days")}
            </>
          }
        />
        <StatCard
          icon="check"
          label={t("پروفایل کامل", "Complete profiles")}
          value={fa(stats.withProfile)}
          hint={
            <>
              {fa(percent(stats.withProfile, stats.totalUsers))}%{" "}
              {t("از کل کاربران", "of all users")}
            </>
          }
        />
        <StatCard
          icon="chart"
          label={t("ثبت‌نام ۳۰ روز", "Sign-ups, 30 days")}
          value={fa(stats.newLast30)}
          hint={t("کاربران تازه در یک ماه گذشته", "New users in the past month")}
        />
        <StatCard
          icon="user"
          label={t("میانگین سن", "Average age")}
          value={stats.averageAge === null ? t("نامشخص", "Unknown") : fa(stats.averageAge)}
          hint={t("از پروفایل‌هایی که سن دارند", "Across profiles with an age set")}
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-head">
            <div>
              <h2 className="chart-title">{t("روند ثبت‌نام", "Sign-up trend")}</h2>
              <span className="chart-sub">
                {t(
                  `${fa(rangeTotal)} ثبت‌نام در بازه انتخابی`,
                  `${fa(rangeTotal)} sign-ups in the selected range`,
                )}
              </span>
            </div>
            <div className="range-tabs" role="tablist" aria-label={t("بازه نمودار", "Chart range")}>
              {([7, 14, 30] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={range === r}
                  className={`range-tab ${range === r ? "active" : ""}`}
                  onClick={() => setRange(r)}
                >
                  {t(`${fa(r)} روز`, `${fa(r)} days`)}
                </button>
              ))}
            </div>
          </div>
          <SignupBars daily={stats.daily} range={range} />
        </div>

        <div className="chart-card">
          <div className="chart-head">
            <div>
              <h2 className="chart-title">{t("روش ورود", "Sign-in method")}</h2>
              <span className="chart-sub">
                {t("تفکیک کاربران بر پایه روش ساخت حساب", "Users by how the account was created")}
              </span>
            </div>
          </div>
          <MethodDonut stats={stats} />
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-head">
            <div>
              <h2 className="chart-title">{t("تکمیل پروفایل", "Profile completeness")}</h2>
              <span className="chart-sub">
                {t("وضعیت اطلاعات کاربران", "How much users have filled in")}
              </span>
            </div>
          </div>
          <div className="sex-row">
            <div className="top">
              <span>{t("پروفایل کامل", "Complete profile")}</span>
              <span className="val">{fa(stats.withProfile)}</span>
            </div>
            <div className="sex-bar">
              <div style={{ width: `${percent(stats.withProfile, stats.totalUsers)}%`, background: "var(--green)" }} />
            </div>
          </div>
          <div className="sex-row">
            <div className="top">
              <span>{t("پروفایل ناقص", "Incomplete profile")}</span>
              <span className="val">{fa(stats.withoutProfile)}</span>
            </div>
            <div className="sex-bar">
              <div style={{ width: `${percent(stats.withoutProfile, stats.totalUsers)}%`, background: "var(--chart-3)" }} />
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-head">
            <div>
              <h2 className="chart-title">{t("جنسیت", "Gender")}</h2>
              <span className="chart-sub">
                {t("از پروفایل‌هایی که جنسیت دارند", "Across profiles with a gender set")}
              </span>
            </div>
          </div>
          {stats.sexes.length === 0 ? (
            <p className="chart-sub">{t("هنوز جنسیتی ثبت نشده است.", "No gender recorded yet.")}</p>
          ) : (
            stats.sexes.map((s, i) => (
              <div className="sex-row" key={s.sex}>
                <div className="top">
                  <span>{s.sex}</span>
                  <span className="val">{fa(s.count)}</span>
                </div>
                <div className="sex-bar">
                  <div style={{ width: `${(s.count / maxSex) * 100}%`, background: SEX_COLOR[i % SEX_COLOR.length] }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
