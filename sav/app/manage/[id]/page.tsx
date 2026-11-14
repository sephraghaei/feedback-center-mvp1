import Link from "next/link";
import { notFound } from "next/navigation";
import { updateBusiness } from "@/app/actions";
import EmptyState from "@/components/empty-state";
import ImportanceBadge from "@/components/importance-badge";
import Notice from "@/components/notice";
import { Icon } from "@/components/icons";
import { requireMembership } from "@/lib/auth";
import { firstParam, formatDate, initials } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
  statusLabel,
  topicName,
  type Business,
  type Importance,
  type Topic,
} from "@/lib/types";

type ManageAnnouncement = {
  id: string;
  title: string;
  importance: Importance;
  status: string;
  published_at: string | null;
  created_at: string;
};

export default async function ManageBusinessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const locale = await getLocale();
  const t = getDictionary(locale);
  const { viewer } = await requireMembership(id);
  const supabase = await createSupabaseServer();

  const [businessResult, announcementResult, topicResult] = await Promise.all([
    supabase.from("businesses").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("announcements")
      .select("id, title, importance, status, published_at, created_at")
      .eq("business_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("topics").select("id, slug, name_fa, name_en").order("slug"),
  ]);

  if (!businessResult.data) notFound();

  const business = businessResult.data as Business;
  const announcements = (announcementResult.data ?? []) as ManageAnnouncement[];
  const topics = (topicResult.data ?? []) as Topic[];
  const membership = viewer.memberships.find((item) => item.business_id === business.id);

  return (
    <div className="page">
      <Link href="/manage" className="inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink">
        <Icon name="arrow" size={14} />
        {t.navManage}
      </Link>

      <header className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line bg-surface-2 text-lg font-semibold text-brand">
            {business.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={business.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(business.name)
            )}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold text-ink sm:text-2xl">
                {business.name}
              </h1>
              <span
                className={`chip ${
                  business.status === "active" ? "chip-normal" : "chip-important"
                }`}
              >
                {statusLabel(t, business.status)}
              </span>
              {membership ? (
                <span className="chip chip-topic">
                  {membership.role === "owner" ? t.roleOwner : t.roleEditor}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-ink-3" dir="ltr">
              /b/{business.slug}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {business.status === "active" ? (
            <Link href={`/b/${business.slug}`} className="btn btn-sm">
              <Icon name="external" size={14} />
              {t.manageViewPublic}
            </Link>
          ) : null}
          <Link
            href={`/manage/${business.id}/announcements/new`}
            className="btn btn-primary btn-sm"
          >
            <Icon name="plus" size={15} />
            {t.manageNewAnnouncement}
          </Link>
        </div>
      </header>

      <div className="mt-5">
        <Notice ok={firstParam(query.ok)} error={firstParam(query.error)} t={t} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <h2 className="text-lg font-semibold text-ink">{t.manageAnnouncements}</h2>

          {announcements.length > 0 ? (
            <ul className="card mt-4 divide-y divide-line">
              {announcements.map((announcement) => (
                <li key={announcement.id}>
                  <Link
                    href={`/manage/${business.id}/announcements/${announcement.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-surface-2/60 sm:p-5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <ImportanceBadge importance={announcement.importance} t={t} />
                        <span
                          className={`chip ${
                            announcement.status === "published" ? "chip-normal" : "chip-topic"
                          }`}
                        >
                          {statusLabel(t, announcement.status)}
                        </span>
                      </div>
                      <p className="mt-2 truncate text-sm font-medium text-ink">
                        {announcement.title}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-[0.7rem] text-ink-3">
                        <Icon name="clock" size={12} />
                        {formatDate(announcement.published_at ?? announcement.created_at, locale)}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-brand">
                      {t.actionEdit}
                      <Icon name="arrow" size={14} className="flip" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4">
              <EmptyState
                icon="feed"
                title={t.manageNoAnnouncements}
                actionHref={`/manage/${business.id}/announcements/new`}
                actionLabel={t.manageNewAnnouncement}
              />
            </div>
          )}
        </section>

        <aside>
          <h2 className="text-lg font-semibold text-ink">{t.manageEditTitle}</h2>

          <form action={updateBusiness} className="card mt-4 grid gap-4 p-5">
            <input type="hidden" name="id" value={business.id} />

            <label className="field">
              <span className="label">{t.manageName}</span>
              <input name="name" required defaultValue={business.name} className="input" />
            </label>

            <label className="field">
              <span className="label">{t.manageDescription}</span>
              <textarea
                name="description"
                defaultValue={business.description ?? ""}
                className="textarea min-h-24"
              />
            </label>

            <label className="field">
              <span className="label">{t.manageLogo}</span>
              <input
                name="logoUrl"
                defaultValue={business.logo_url ?? ""}
                className="input"
                dir="ltr"
                placeholder="https://"
              />
            </label>

            <label className="field">
              <span className="label">{t.manageContact}</span>
              <input
                name="contactEmail"
                type="email"
                defaultValue={business.contact_email ?? ""}
                className="input"
                dir="ltr"
              />
            </label>

            <label className="field">
              <span className="label">{t.manageWebsite}</span>
              <input
                name="websiteUrl"
                defaultValue={business.website_url ?? ""}
                className="input"
                dir="ltr"
                placeholder="https://"
              />
            </label>

            <label className="field">
              <span className="label">{t.managePrimaryTopic}</span>
              <select
                name="primaryTopicId"
                className="select"
                defaultValue={business.primary_topic_id ?? ""}
              >
                <option value="">{t.actionAll}</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topicName(topic, locale)}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className="btn btn-primary">
              <Icon name="check" size={16} />
              {t.actionSave}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
