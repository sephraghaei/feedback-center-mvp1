"use client";

import { useState, type CSSProperties } from "react";
import type { AdminStats } from "@/lib/admin-store";
import { toPersianDigits } from "@/lib/phone";
import { Icon, type IconName } from "./bits";

const METHOD_COLOR: Record<string, string> = {
  phone: "#2563eb",
  email: "#7c3aed",
  clerk: "#0d9488",
};
const METHOD_LABEL: Record<string, string> = {
  phone: "موبایل",
  email: "ایمیل",
  clerk: "Clerk",
};
const SEX_COLOR = ["#4f46e5", "#db2777", "#0d9488", "#d97706"];

function fa(n: number): string {
  return toPersianDigits(String(n));
}
function percent(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

function StatCard({
  icon,
  label,
  value,
  hint,
  tint,
  tone,
}: {
  icon: IconName;
  label: string;
  value: string;
  hint: React.ReactNode;
  tint: string;
  tone: string;
}) {
  const style = { "--tint": tint, "--tone": tone, "--glow": tint } as CSSProperties;
  return (
    <div className="stat-card" style={style}>
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
  const dateFmt = new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "numeric" });

  return (
    <svg className="bars-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="نمودار ثبت‌نام روزانه">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1="0"
          x2={W}
          y1={padT + innerH - innerH * t}
          y2={padT + innerH - innerH * t}
          stroke="#e6e6ea"
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
              <title>{`${d.date}: ${fa(d.count)} ثبت‌نام`}</title>
            </rect>
            {i % labelEvery === 0 ? (
              <text
                x={x + bw / 2}
                y={H - 8}
                fontSize="10"
                fill="#8b8b96"
                textAnchor="middle"
              >
                {dateFmt.format(new Date(d.date))}
              </text>
            ) : null}
          </g>
        );
      })}
      <line x1="0" x2={W} y1={padT + innerH} y2={padT + innerH} stroke="#d5d5dd" strokeWidth="1" />
    </svg>
  );
}

function MethodDonut({ stats }: { stats: AdminStats }) {
  const total = stats.methods.reduce((sum, m) => sum + m.count, 0);
  const r = 52;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="donut-wrap">
      <svg width="150" height="150" viewBox="0 0 150 150" role="img" aria-label="سهم روش‌های ورود">
        <circle cx="75" cy="75" r={r} fill="none" stroke="#efeff2" strokeWidth="20" />
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
                  stroke={METHOD_COLOR[m.method]}
                  strokeWidth="20"
                  strokeDasharray={`${dash} ${c - dash}`}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 75 75)"
                >
                  <title>{`${METHOD_LABEL[m.method]}: ${fa(m.count)}`}</title>
                </circle>
              );
              offset += dash;
              return el;
            })
          : null}
        <text x="75" y="72" textAnchor="middle" fontSize="24" fontWeight="800" fill="#16161a">
          {fa(total)}
        </text>
        <text x="75" y="92" textAnchor="middle" fontSize="10" fill="#8b8b96">
          کاربر
        </text>
      </svg>
      <div className="legend">
        {stats.methods.map((m) => (
          <div className="legend-item" key={m.method}>
            <span className="legend-dot" style={{ background: METHOD_COLOR[m.method] }} />
            {METHOD_LABEL[m.method]}
            <span className="val">
              {fa(m.count)} · {fa(percent(m.count, total))}٪
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ stats }: { stats: AdminStats }) {
  const [range, setRange] = useState<7 | 14 | 30>(14);
  const rangeTotal = stats.daily.slice(-range).reduce((s, d) => s + d.count, 0);
  const maxSex = Math.max(1, ...stats.sexes.map((s) => s.count));

  return (
    <>
      <div className="page-head">
        <div className="page-title-row">
          <h1 className="page-title">داشبورد</h1>
          <span className="count-badge">{fa(stats.totalUsers)} کاربر</span>
        </div>
        <p className="page-sub">نمای کلی و زنده از کاربران و ثبت‌نام‌های سامانه.</p>
      </div>

      <div className="stat-grid">
        <StatCard
          icon="users"
          label="کل کاربران"
          value={fa(stats.totalUsers)}
          tint="#eef2ff"
          tone="#4338ca"
          hint={<><strong>{fa(stats.newLast7)}</strong> کاربر جدید در ۷ روز گذشته</>}
        />
        <StatCard
          icon="check"
          label="پروفایل کامل"
          value={fa(stats.withProfile)}
          tint="#e8f7ee"
          tone="#16a34a"
          hint={<>{fa(percent(stats.withProfile, stats.totalUsers))}٪ از کل کاربران</>}
        />
        <StatCard
          icon="chart"
          label="ثبت‌نام ۳۰ روز"
          value={fa(stats.newLast30)}
          tint="#e8effd"
          tone="#2563eb"
          hint="کاربران تازه در یک ماه گذشته"
        />
        <StatCard
          icon="user"
          label="میانگین سن"
          value={stats.averageAge === null ? "نامشخص" : fa(stats.averageAge)}
          tint="#fdf3e3"
          tone="#d97706"
          hint="از پروفایل‌هایی که سن دارند"
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-head">
            <div>
              <h2 className="chart-title">روند ثبت‌نام</h2>
              <span className="chart-sub">{fa(rangeTotal)} ثبت‌نام در بازه انتخابی</span>
            </div>
            <div className="range-tabs" role="tablist" aria-label="بازه نمودار">
              {([7, 14, 30] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={range === r}
                  className={`range-tab ${range === r ? "active" : ""}`}
                  onClick={() => setRange(r)}
                >
                  {fa(r)} روز
                </button>
              ))}
            </div>
          </div>
          <SignupBars daily={stats.daily} range={range} />
        </div>

        <div className="chart-card">
          <div className="chart-head">
            <div>
              <h2 className="chart-title">روش ورود</h2>
              <span className="chart-sub">تفکیک کاربران بر پایه روش ساخت حساب</span>
            </div>
          </div>
          <MethodDonut stats={stats} />
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-head">
            <div>
              <h2 className="chart-title">تکمیل پروفایل</h2>
              <span className="chart-sub">وضعیت اطلاعات کاربران</span>
            </div>
          </div>
          <div className="sex-row">
            <div className="top">
              <span>پروفایل کامل</span>
              <span className="val">{fa(stats.withProfile)}</span>
            </div>
            <div className="sex-bar">
              <div style={{ width: `${percent(stats.withProfile, stats.totalUsers)}%`, background: "#16a34a" }} />
            </div>
          </div>
          <div className="sex-row">
            <div className="top">
              <span>پروفایل ناقص</span>
              <span className="val">{fa(stats.withoutProfile)}</span>
            </div>
            <div className="sex-bar">
              <div style={{ width: `${percent(stats.withoutProfile, stats.totalUsers)}%`, background: "#d97706" }} />
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-head">
            <div>
              <h2 className="chart-title">جنسیت</h2>
              <span className="chart-sub">از پروفایل‌هایی که جنسیت دارند</span>
            </div>
          </div>
          {stats.sexes.length === 0 ? (
            <p className="chart-sub">هنوز جنسیتی ثبت نشده است.</p>
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