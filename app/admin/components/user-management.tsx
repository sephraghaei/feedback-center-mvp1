"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AdminUserRow, UserMethod, UserSnapshot } from "@/lib/admin-store";
import { SEX_OPTIONS } from "@/lib/profile";
import { toPersianDigits } from "@/lib/phone";
import { Avatar, Icon, MethodBadge, ProfilePill, formatDate } from "./bits";

type View = "table" | "board" | "list";
type Drawer = { mode: "create" } | { mode: "edit"; row: AdminUserRow } | null;
type Toast = { message: string; snapshots?: UserSnapshot[] } | null;
type Form = { name: string; email: string; phone: string; age: string; sex: string; company: string };

const EMPTY_FORM: Form = { name: "", email: "", phone: "", age: "", sex: "", company: "" };
const PAGE_SIZE = 10;
const fa = (n: number) => toPersianDigits(String(n));

function identifierOf(row: AdminUserRow): string {
  return row.email ?? row.phone ?? row.clerkId ?? "بدون شناسه";
}

async function readJson(response: Response) {
  const data = (await response.json().catch(() => ({}))) as { message?: string; [k: string]: unknown };
  if (!response.ok) throw new Error(data.message ?? "مشکلی پیش آمد.");
  return data;
}

export default function UserManagement() {
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("");
  const [profileFilter, setProfileFilter] = useState("");
  const [sort, setSort] = useState("joined");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [view, setView] = useState<View>("table");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  const headerCheck = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      search,
      method,
      profile: profileFilter,
      sort,
      dir,
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    setLoading(true);
    fetch(`/api/admin/users?${params}`, { signal: controller.signal })
      .then(readJson)
      .then((data) => {
        setRows((data.rows as AdminUserRow[]) ?? []);
        setTotal((data.total as number) ?? 0);
        setPageCount((data.pageCount as number) ?? 1);
        setSelected(new Set());
      })
      .catch((issue) => {
        if (issue instanceof Error && issue.name !== "AbortError") setToast({ message: issue.message });
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [search, method, profileFilter, sort, dir, page, refreshKey]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someSelected = rows.some((r) => selected.has(r.id));
  useEffect(() => {
    if (headerCheck.current) headerCheck.current.indeterminate = someSelected && !allSelected;
  }, [someSelected, allSelected]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  function toggleSort(key: string) {
    if (sort === key) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(key);
      setDir(key === "joined" ? "desc" : "asc");
    }
    setPage(1);
  }

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) rows.forEach((r) => next.delete(r.id));
      else rows.forEach((r) => next.add(r.id));
      return next;
    });
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setDrawer({ mode: "create" });
  }

  function openEdit(row: AdminUserRow) {
    setForm({
      name: row.name ?? "",
      email: row.email ?? "",
      phone: row.phone ?? "",
      age: row.age === null ? "" : String(row.age),
      sex: row.sex ?? "",
      company: row.company ?? "",
    });
    setFormError(null);
    setDrawer({ mode: "edit", row });
  }

  async function submitForm(event: React.FormEvent) {
    event.preventDefault();
    if (!drawer) return;
    setSaving(true);
    setFormError(null);
    try {
      const url = drawer.mode === "create" ? "/api/admin/users" : `/api/admin/users/${drawer.row.id}`;
      await readJson(
        await fetch(url, {
          method: drawer.mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }),
      );
      setDrawer(null);
      setToast({ message: drawer.mode === "create" ? "کاربر ساخته شد." : "تغییرات ذخیره شد." });
      refresh();
    } catch (issue) {
      setFormError(issue instanceof Error ? issue.message : "ذخیره انجام نشد.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteOne(row: AdminUserRow) {
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    setTotal((t) => Math.max(0, t - 1));
    try {
      const data = await readJson(await fetch(`/api/admin/users/${row.id}`, { method: "DELETE" }));
      setToast({ message: "کاربر حذف شد.", snapshots: [data.snapshot as UserSnapshot] });
    } catch {
      refresh();
    }
  }

  async function deleteBulk() {
    const ids = [...selected];
    if (ids.length === 0) return;
    setRows((prev) => prev.filter((r) => !selected.has(r.id)));
    setTotal((t) => Math.max(0, t - ids.length));
    setSelected(new Set());
    const snapshots: UserSnapshot[] = [];
    let failed = false;
    for (const id of ids) {
      try {
        const data = await readJson(await fetch(`/api/admin/users/${id}`, { method: "DELETE" }));
        snapshots.push(data.snapshot as UserSnapshot);
      } catch {
        failed = true;
      }
    }
    if (failed) refresh();
    if (snapshots.length) setToast({ message: `${fa(snapshots.length)} کاربر حذف شد.`, snapshots });
  }

  async function undo() {
    if (!toast?.snapshots?.length) return;
    const snapshots = toast.snapshots;
    setToast(null);
    try {
      await readJson(
        await fetch("/api/admin/users/restore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ snapshots }),
        }),
      );
      refresh();
    } catch (issue) {
      setToast({ message: issue instanceof Error ? issue.message : "بازگردانی انجام نشد." });
    }
  }

  const filtersActive = Boolean(method || profileFilter || search);
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(total, page * PAGE_SIZE);

  const sortIcon = (key: string) =>
    sort === key ? (dir === "asc" ? "arrow-up" : "arrow-down") : "sort";

  const boardMethods: UserMethod[] = ["phone", "email", "clerk"];
  if (rows.some((r) => r.method === "unknown")) boardMethods.push("unknown");
  const BOARD_LABEL: Record<UserMethod, string> = {
    phone: "موبایل",
    email: "ایمیل",
    clerk: "Clerk",
    unknown: "سایر",
  };

  return (
    <>
      <div className="page-head">
        <div className="page-title-row">
          <h1 className="page-title">مدیریت کاربران</h1>
          <span className="count-badge">{fa(total)}</span>
        </div>
        <p className="page-sub">اعضا را جست‌وجو، فیلتر و ویرایش کن؛ حذف‌ها قابل بازگردانی هستند.</p>
      </div>

      <div className="panel">
        <div className="toolbar">
          <div className="view-tabs" role="tablist" aria-label="نمای نمایش">
            {([["table", "table", "جدول"], ["board", "board", "برد"], ["list", "list", "فهرست"]] as const).map(
              ([key, icon, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={view === key}
                  className={`view-tab ${view === key ? "active" : ""}`}
                  onClick={() => setView(key)}
                >
                  <Icon name={icon} size={15} />
                  {label}
                </button>
              ),
            )}
          </div>

          <div className="search-box">
            <Icon name="search" size={16} />
            <input
              type="search"
              placeholder="جست‌وجوی نام، ایمیل یا موبایل..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="جست‌وجوی کاربران"
            />
          </div>

          <button type="button" className="btn btn-primary" onClick={openCreate}>
            <Icon name="plus" size={16} />
            کاربر جدید
          </button>
        </div>

        <div className="filters">
          <span className={`filter-select ${method ? "on" : ""}`}>
            <Icon name="user" size={14} />
            <select
              value={method}
              onChange={(e) => {
                setMethod(e.target.value);
                setPage(1);
              }}
              aria-label="فیلتر روش ورود"
            >
              <option value="">همه روش‌ها</option>
              <option value="phone">موبایل</option>
              <option value="email">ایمیل</option>
              <option value="clerk">Clerk</option>
            </select>
          </span>
          <span className={`filter-select ${profileFilter ? "on" : ""}`}>
            <Icon name="check" size={14} />
            <select
              value={profileFilter}
              onChange={(e) => {
                setProfileFilter(e.target.value);
                setPage(1);
              }}
              aria-label="فیلتر وضعیت پروفایل"
            >
              <option value="">همه پروفایل‌ها</option>
              <option value="complete">کامل</option>
              <option value="incomplete">ناقص</option>
            </select>
          </span>
          {filtersActive ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setMethod("");
                setProfileFilter("");
                setSearchInput("");
                setPage(1);
              }}
            >
              <Icon name="close" size={14} />
              پاک کردن فیلترها
            </button>
          ) : null}
          <span className="spacer" />
          <span className="chart-sub">{loading ? "در حال بارگذاری..." : `${fa(total)} نتیجه`}</span>
        </div>

        {selected.size > 0 ? (
          <div className="bulk-bar">
            <Icon name="check" size={15} />
            {fa(selected.size)} کاربر انتخاب شده
            <span className="spacer" style={{ marginInlineStart: "auto" }} />
            <button type="button" className="btn btn-danger" onClick={deleteBulk}>
              <Icon name="trash" size={15} />
              حذف انتخاب‌شده‌ها
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setSelected(new Set())}>
              لغو انتخاب
            </button>
          </div>
        ) : null}

        <div style={{ opacity: loading ? 0.55 : 1, transition: "opacity 0.15s ease" }}>
          {rows.length === 0 && !loading ? (
            <div className="empty-state">
              <Icon name="users" size={40} />
              <h3>کاربری پیدا نشد</h3>
              <p>
                {filtersActive
                  ? "با این فیلترها چیزی نیست. فیلترها را پاک کن یا کاربر جدید بساز."
                  : "هنوز کاربری ثبت نشده. اولین کاربر را بساز تا اینجا نمایش داده شود."}
              </p>
              <button type="button" className="btn btn-primary" onClick={openCreate}>
                <Icon name="plus" size={16} />
                کاربر جدید
              </button>
            </div>
          ) : view === "table" ? (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>
                      <input
                        ref={headerCheck}
                        type="checkbox"
                        className="check"
                        checked={allSelected}
                        onChange={toggleAll}
                        aria-label="انتخاب همه"
                      />
                    </th>
                    <th>
                      <button type="button" className={`th-sort ${sort === "name" ? "on" : ""}`} onClick={() => toggleSort("name")}>
                        <Icon name="user" size={14} />
                        نام
                        <Icon name={sortIcon("name")} size={13} />
                      </button>
                    </th>
                    <th>
                      <button type="button" className={`th-sort ${sort === "email" ? "on" : ""}`} onClick={() => toggleSort("email")}>
                        <Icon name="mail" size={14} />
                        شناسه
                        <Icon name={sortIcon("email")} size={13} />
                      </button>
                    </th>
                    <th>روش ورود</th>
                    <th>وضعیت</th>
                    <th>
                      <button type="button" className={`th-sort ${sort === "joined" ? "on" : ""}`} onClick={() => toggleSort("joined")}>
                        <Icon name="calendar" size={14} />
                        تاریخ عضویت
                        <Icon name={sortIcon("joined")} size={13} />
                      </button>
                    </th>
                    <th style={{ width: 80 }} />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className={selected.has(row.id) ? "selected" : ""}>
                      <td>
                        <input
                          type="checkbox"
                          className="check"
                          checked={selected.has(row.id)}
                          onChange={() => toggleOne(row.id)}
                          aria-label={`انتخاب ${row.name ?? identifierOf(row)}`}
                        />
                      </td>
                      <td>
                        <div className="cell-user">
                          <Avatar seed={row.id} label={row.name ?? identifierOf(row)} />
                          <span>
                            <span className="name">{row.name ?? "بدون نام"}</span>
                            <br />
                            <span className="sub">{row.company ?? row.sex ?? "کاربر سامانه"}</span>
                          </span>
                        </div>
                      </td>
                      <td className="cell-id">{identifierOf(row)}</td>
                      <td><MethodBadge method={row.method} /></td>
                      <td><ProfilePill complete={row.hasProfile} /></td>
                      <td className="cell-date">{formatDate(row.createdAt)}</td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="btn btn-icon" onClick={() => openEdit(row)} aria-label="ویرایش">
                            <Icon name="edit" size={16} />
                          </button>
                          <button type="button" className="btn btn-icon danger" onClick={() => deleteOne(row)} aria-label="حذف">
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : view === "board" ? (
            <div className="board">
              {boardMethods.map((m) => {
                const items = rows.filter((r) => r.method === m);
                return (
                  <div className="board-col" key={m}>
                    <div className="board-col-head">
                      <span className={`board-dot ${m}`} aria-hidden="true" />
                      <MethodBadge method={m} />
                      <span className="badge">{fa(items.length)}</span>
                    </div>
                    <div className="board-col-body">
                      {items.length === 0 ? (
                        <p className="board-empty">خالی</p>
                      ) : (
                        items.map((row) => (
                          <div className="board-card" key={row.id}>
                            <Avatar seed={row.id} label={row.name ?? identifierOf(row)} size={30} />
                            <span className="meta">
                              <span className="name">{row.name ?? "بدون نام"}</span>
                              <br />
                              <span className="id">{identifierOf(row)}</span>
                            </span>
                            <button type="button" className="btn btn-icon" onClick={() => openEdit(row)} aria-label="ویرایش">
                              <Icon name="edit" size={15} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="list-view">
              {rows.map((row) => (
                <div className="list-row" key={row.id}>
                  <input
                    type="checkbox"
                    className="check"
                    checked={selected.has(row.id)}
                    onChange={() => toggleOne(row.id)}
                    aria-label={`انتخاب ${row.name ?? identifierOf(row)}`}
                  />
                  <Avatar seed={row.id} label={row.name ?? identifierOf(row)} />
                  <span className="meta">
                    <span className="name">{row.name ?? "بدون نام"}</span>
                    <br />
                    <span className="id">{identifierOf(row)}</span>
                  </span>
                  <MethodBadge method={row.method} />
                  <ProfilePill complete={row.hasProfile} />
                  <button type="button" className="btn btn-icon" onClick={() => openEdit(row)} aria-label="ویرایش">
                    <Icon name="edit" size={16} />
                  </button>
                  <button type="button" className="btn btn-icon danger" onClick={() => deleteOne(row)} aria-label="حذف">
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pager">
          <span className="pager-info">
            نمایش {fa(from)} تا {fa(to)} از {fa(total)}
          </span>
          <div className="pager-btns">
            <button type="button" className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <Icon name="chevron-right" size={15} />
              قبلی
            </button>
            <span className="pager-info">
              صفحه {fa(page)} از {fa(pageCount)}
            </span>
            <button type="button" className="btn btn-ghost" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>
              بعدی
              <Icon name="chevron-left" size={15} />
            </button>
          </div>
        </div>
      </div>

      {drawer ? (
        <>
          <div className="drawer-overlay" onClick={() => !saving && setDrawer(null)} />
          <div className="drawer" role="dialog" aria-modal="true" aria-label={drawer.mode === "create" ? "کاربر جدید" : "ویرایش کاربر"}>
            <div className="drawer-head">
              <Icon name={drawer.mode === "create" ? "plus" : "edit"} size={18} />
              <h2 className="drawer-title">{drawer.mode === "create" ? "کاربر جدید" : "ویرایش کاربر"}</h2>
              <button type="button" className="btn btn-icon" onClick={() => setDrawer(null)} disabled={saving} aria-label="بستن">
                <Icon name="close" size={18} />
              </button>
            </div>
            <form onSubmit={submitForm} style={{ display: "contents" }}>
              <div className="drawer-body">
                <div className="field">
                  <label htmlFor="f-name">نام</label>
                  <input
                    id="f-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    maxLength={60}
                    required
                    autoFocus
                  />
                </div>
                <div className="field">
                  <label htmlFor="f-email">ایمیل <span className="opt">(اختیاری)</span></label>
                  <input
                    id="f-email"
                    type="email"
                    className="ltr"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="name@example.com"
                  />
                </div>
                <div className="field">
                  <label htmlFor="f-phone">موبایل <span className="opt">(اختیاری)</span></label>
                  <input
                    id="f-phone"
                    type="tel"
                    className="ltr"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="09123456789"
                  />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="f-age">سن <span className="opt">(اختیاری)</span></label>
                    <input
                      id="f-age"
                      type="number"
                      min={5}
                      max={120}
                      className="ltr"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="f-sex">جنسیت <span className="opt">(اختیاری)</span></label>
                    <select id="f-sex" value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}>
                      <option value="">انتخاب نکن</option>
                      {SEX_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="f-company">شرکت <span className="opt">(اختیاری)</span></label>
                  <input
                    id="f-company"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    maxLength={80}
                  />
                </div>
                {formError ? <p className="form-error">{formError}</p> : null}
              </div>
              <div className="drawer-foot">
                <button type="submit" className="btn btn-primary" disabled={saving || form.name.trim().length < 2}>
                  {saving ? "در حال ذخیره..." : drawer.mode === "create" ? "ساخت کاربر" : "ذخیره تغییرات"}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setDrawer(null)} disabled={saving}>
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </>
      ) : null}

      {toast ? (
        <div className="toast" role="status">
          <Icon name={toast.snapshots ? "trash" : "check"} size={16} />
          {toast.message}
          {toast.snapshots?.length ? (
            <button type="button" className="toast-action" onClick={undo}>
              <Icon name="undo" size={14} />
              بازگردانی
            </button>
          ) : null}
          <button type="button" className="toast-action" onClick={() => setToast(null)} aria-label="بستن پیام">
            <Icon name="close" size={14} />
          </button>
        </div>
      ) : null}
    </>
  );
}