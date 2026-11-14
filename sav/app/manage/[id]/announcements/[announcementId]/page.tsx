import Link from "next/link";
import { notFound } from "next/navigation";
import AnnouncementForm from "@/components/announcement-form";
import Notice from "@/components/notice";
import { Icon } from "@/components/icons";
import { requireMembership } from "@/lib/auth";
import { firstParam } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
  statusLabel,
  type AnnouncementStatus,
  type Business,
  type Importance,
  type Topic,
} from "@/lib/types";

export default async function EditAnnouncementPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; announcementId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id, announcementId }, query] = await Promise.all([params, searchParams]);
  const locale = await getLocale();
  const t = getDictionary(locale);
  await requireMembership(id);
  const supabase = await createSupabaseServer();

  const [businessResult, announcementResult, topicResult] = await Promise.all([
    supabase.from("businesses").select("id, name, urgent_allowed").eq("id", id).maybeSingle(),
    supabase
      .from("announcements")
      .select("id, business_id, title, body, importance, status, attachment_url")
      .eq("id", announcementId)
      .maybeSingle(),
    supabase.from("topics").select("id, slug, name_fa, name_en").order("slug"),
  ]);

  if (!businessResult.data) notFound();
  if (!announcementResult.data || announcementResult.data.business_id !== id) notFound();

  const business = businessResult.data as Pick<Business, "id" | "name" | "urgent_allowed">;
  const announcement = announcementResult.data as {
    id: string;
    title: string;
    body: string;
    importance: Importance;
    status: AnnouncementStatus;
    attachment_url: string | null;
  };
  const topics = (topicResult.data ?? []) as Topic[];

  const { data: tagged } = await supabase
    .from("announcement_topics")
    .select("topic_id")
    .eq("announcement_id", announcement.id);

  const topicIds = (tagged ?? []).map((row: { topic_id: string }) => row.topic_id);

  return (
    <div className="page max-w-3xl">
      <Link
        href={`/manage/${business.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink"
      >
        <Icon name="arrow" size={14} />
        {business.name}
      </Link>

      <header className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{t.actionEdit}</p>
          <h1 className="mt-2 text-xl font-semibold text-ink sm:text-2xl">
            {announcement.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`chip ${
                announcement.status === "published" ? "chip-normal" : "chip-topic"
              }`}
            >
              {statusLabel(t, announcement.status)}
            </span>
          </div>
        </div>

        {announcement.status === "published" ? (
          <Link href={`/a/${announcement.id}`} className="btn btn-sm">
            <Icon name="external" size={14} />
            {t.manageViewPublic}
          </Link>
        ) : null}
      </header>

      <div className="mt-5">
        <Notice ok={firstParam(query.ok)} error={firstParam(query.error)} t={t} />
      </div>

      <div className="mt-5">
        <AnnouncementForm
          businessId={business.id}
          urgentAllowed={business.urgent_allowed}
          topics={topics}
          locale={locale}
          t={t}
          announcement={{
            id: announcement.id,
            title: announcement.title,
            body: announcement.body,
            importance: announcement.importance,
            status: announcement.status,
            attachment_url: announcement.attachment_url,
            topicIds,
          }}
        />
      </div>
    </div>
  );
}
