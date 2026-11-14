import Link from "next/link";
import { approveBusiness, removeAnnouncement, setUrgentAllowed } from "@/app/actions";
import EmptyState from "@/components/empty-state";
import ImportanceBadge from "@/components/importance-badge";
import Notice from "@/components/notice";
import { Icon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { firstParam, formatDate, formatNumber } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
  statusLabel,
  type Business,
  type Importance,
} from "@/lib/types";

type AdminAnnouncement = {
  id: string;
  title: string;
  importance: Importance;
  status: string;
  published_at: string | null;
  created_at: string;
  businesses: { name: string; slug: string } | null;
};

export const metadata = { title: "مدیریت ساو | ساو" };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);
  await requireAdmin();
  const supabase = await createSupabaseServer();

  const [pendingResult, businessResult, announcementResult] = await Promise.all([
    supabase
      .from("businesses")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase
      .from("businesses")
      .select("id, name, slug, status, urgent_allowed, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("announcements")
      .select(`
        id, title, importance, status, published_at, created_at,
        businesses (name, slug)
      `)
      .in("status", ["published", "draft"])
      .order("created_at", { ascending: false })
      .limit(60),
  ]);

  const pending = (pendingResult.data ?? []) as Business[];
  const businesses = (businessResult.data ?? []) as Pick<
    Business,
    "id" | "name" | "slug" | "status" | "urgent_allowed" | "created_at"
  >[];
  const announcements = (announcementResult.data ?? []) as unknown as AdminAnnouncement[];

  const stats = [
    { label: t.adminPending, value: pending.length },
    { label: t.adminBusinesses, value: businesses.length },
    { label: t.adminAnnouncements, value: announcements.length },
  ];

  return (
    <div className="page">
      <header>
        <p className="eyebrow">{t.navAdmin}</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">{t.adminTitle}</h1>
        <p className="muted mt-2 max-w-2xl">{t.adminSub}</p>
      </header>

      <div className="mt-5">
        <Notice ok={firstParam(query.ok)} error={firstParam(query.error)} t={t} />
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="card-pad">
            <p className="text-xs font-medium text-ink-3">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-ink">
              {formatNumber(stat.value, locale)}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-9">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
          <Icon name="shield" size={18} />
          {t.adminPending}
        </h2>

        {pending.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {pending.map((business) => (
              <article key={business.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{business.name}</p>
                  <p className="mt-0.5 text-xs text-ink-3" dir="ltr">
                    /b/{business.slug}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[0.7rem] text-ink-3">
                    <Icon name="clock" size={12} />
                    {formatDate(business.created_at, locale)}
                  </p>
                </div>
                <form action={approveBusiness}>
                  <input type="hidden" name="id" value={business.id} />
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Icon name="check" size={14} />
                    {t.adminApprove}
                  </button>
                </form>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState icon="building" title={t.adminNoPending} />
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink">{t.adminBusinesses}</h2>
        <div className="table-wrap mt-4">
          <table className="table">
            <thead>
              <tr>
                <th>{t.manageName}</th>
                <th>{t.manageSlug}</th>
                <th>{t.adminBusinesses}</th>
                <th>{t.adminUrgentAllowed}</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((business) => (
                <tr key={business.id}>
                  <td className="font-medium text-ink">{business.name}</td>
                  <td dir="ltr">/b/{business.slug}</td>
                  <td>
                    <span
                      className={`chip ${
                        business.status === "active" ? "chip-normal" : "chip-important"
                      }`}
                    >
                      {statusLabel(t, business.status)}
                    </span>
                  </td>
                  <td>
                    <form action={setUrgentAllowed} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={business.id} />
                      <input
                        type="hidden"
                        name="value"
                        value={business.urgent_allowed ? "off" : "on"}
                      />
                      <button
                        type="submit"
                        className={`chip cursor-pointer ${
                          business.urgent_allowed ? "chip-normal" : "chip-topic"
                        }`}
                        aria-pressed={business.urgent_allowed}
                      >
                        <Icon
                          name={business.urgent_allowed ? "check" : "close"}
                          size={12}
                        />
                        {business.urgent_allowed
                          ? t.adminUrgentAllowed
                          : t.adminUrgentBlocked}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink">{t.adminAnnouncements}</h2>

        {announcements.length > 0 ? (
          <div className="table-wrap mt-4">
            <table className="table">
              <thead>
                <tr>
                  <th>{t.manageAnnouncementTitle}</th>
                  <th>{t.searchBusiness}</th>
                  <th>{t.searchImportance}</th>
                  <th>{t.statusPublished}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {announcements.map((announcement) => (
                  <tr key={announcement.id}>
                    <td className="max-w-72">
                      <Link
                        href={`/a/${announcement.id}`}
                        className="block truncate font-medium text-ink hover:text-brand"
                      >
                        {announcement.title}
                      </Link>
                    </td>
                    <td>
                      {announcement.businesses ? (
                        <Link
                          href={`/b/${announcement.businesses.slug}`}
                          className="hover:text-brand"
                        >
                          {announcement.businesses.name}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <ImportanceBadge importance={announcement.importance} t={t} />
                    </td>
                    <td className="whitespace-nowrap">
                      {statusLabel(t, announcement.status)}
                      <span className="mx-1 text-ink-3">·</span>
                      <span className="text-xs text-ink-3">
                        {formatDate(announcement.published_at ?? announcement.created_at, locale)}
                      </span>
                    </td>
                    <td>
                      <form action={removeAnnouncement} className="flex justify-end">
                        <input type="hidden" name="id" value={announcement.id} />
                        <button type="submit" className="btn btn-danger btn-sm">
                          <Icon name="close" size={13} />
                          {t.adminRemove}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState icon="feed" title={t.adminNoAnnouncements} />
          </div>
        )}
      </section>
    </div>
  );
}
