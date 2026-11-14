import Link from "next/link";
import { markAllRead, markRead } from "@/app/actions";
import EmptyState from "@/components/empty-state";
import ImportanceBadge from "@/components/importance-badge";
import Notice from "@/components/notice";
import { Icon } from "@/components/icons";
import { requireUser } from "@/lib/auth";
import { firstParam, formatDate } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { NotificationRow } from "@/lib/types";

export const metadata = { title: "اعلان‌های من | ساو" };

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);
  const viewer = await requireUser("/notifications");
  const supabase = await createSupabaseServer();

  const { data } = await supabase
    .from("notifications")
    .select(`
      id,
      status,
      read_at,
      created_at,
      announcements (id, title, importance, published_at, businesses (slug, name))
    `)
    .eq("user_id", viewer.user!.id)
    .eq("channel", "in_app")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (data ?? []) as unknown as NotificationRow[];
  const unread = rows.filter((row) => !row.read_at).length;

  return (
    <div className="page">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{t.notificationsUnread}</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
            {t.notificationsTitle}
          </h1>
          <p className="muted mt-2 max-w-xl">{t.notificationsSub}</p>
        </div>
        {unread > 0 ? (
          <form action={markAllRead}>
            <button type="submit" className="btn btn-soft btn-sm">
              <Icon name="check" size={14} />
              {t.actionMarkAllRead}
            </button>
          </form>
        ) : null}
      </header>

      <div className="mt-5">
        <Notice ok={firstParam(params.ok)} error={firstParam(params.error)} t={t} />
      </div>

      {rows.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-3">
          {rows.map((row) => {
            const announcement = row.announcements;
            const isUnread = !row.read_at;

            return (
              <li
                key={row.id}
                className={`card flex flex-wrap items-start gap-4 p-4 sm:p-5 ${
                  isUnread ? "bg-brand-soft/50" : ""
                }`}
                style={
                  isUnread
                    ? { borderInlineStartColor: "var(--color-brand)", borderInlineStartWidth: "3px" }
                    : undefined
                }
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {isUnread ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[0.62rem] font-semibold text-white">
                        {t.notificationsUnread}
                      </span>
                    ) : null}
                    {announcement ? (
                      <ImportanceBadge importance={announcement.importance} t={t} />
                    ) : null}
                    <span className="flex items-center gap-1 text-[0.68rem] text-ink-3">
                      <Icon name="clock" size={12} />
                      {formatDate(row.created_at, locale)}
                    </span>
                  </div>

                  {announcement ? (
                    <>
                      <Link
                        href={`/a/${announcement.id}`}
                        className="mt-2 block text-base font-semibold text-ink hover:text-brand"
                      >
                        {announcement.title}
                      </Link>
                      {announcement.businesses ? (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-3">
                          <Icon name="building" size={13} />
                          {announcement.businesses.name}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-ink-3">{t.notificationsUnavailable}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isUnread ? (
                    <form action={markRead}>
                      <input type="hidden" name="id" value={row.id} />
                      <input type="hidden" name="next" value="/notifications" />
                      <button type="submit" className="btn btn-ghost btn-sm">
                        <Icon name="check" size={14} />
                        {t.actionMarkRead}
                      </button>
                    </form>
                  ) : null}
                  {announcement ? (
                    <Link href={`/a/${announcement.id}`} className="btn btn-soft btn-sm">
                      {t.actionReadMore}
                      <Icon name="arrow" size={14} className="flip" />
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-5">
          <EmptyState
            icon="bell"
            title={t.notificationsEmpty}
            actionHref="/feed"
            actionLabel={t.feedLatest}
          />
        </div>
      )}
    </div>
  );
}
