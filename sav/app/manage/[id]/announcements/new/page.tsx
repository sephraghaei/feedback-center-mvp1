import Link from "next/link";
import { notFound } from "next/navigation";
import AnnouncementForm from "@/components/announcement-form";
import { Icon } from "@/components/icons";
import { requireMembership } from "@/lib/auth";
import { getDictionary, getLocale } from "@/lib/i18n";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { Business, Topic } from "@/lib/types";

export const metadata = { title: "اعلان تازه | ساو" };

export default async function NewAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const t = getDictionary(locale);
  await requireMembership(id);
  const supabase = await createSupabaseServer();

  const [businessResult, topicResult] = await Promise.all([
    supabase.from("businesses").select("id, name, urgent_allowed").eq("id", id).maybeSingle(),
    supabase.from("topics").select("id, slug, name_fa, name_en").order("slug"),
  ]);

  if (!businessResult.data) notFound();
  const business = businessResult.data as Pick<Business, "id" | "name" | "urgent_allowed">;
  const topics = (topicResult.data ?? []) as Topic[];

  return (
    <div className="page max-w-3xl">
      <Link
        href={`/manage/${business.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink"
      >
        <Icon name="arrow" size={14} />
        {business.name}
      </Link>

      <header className="mt-3">
        <p className="eyebrow">{t.manageNewAnnouncement}</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
          {t.manageNewAnnouncement}
        </h1>
        <p className="muted mt-2">{t.manageCreateSub}</p>
      </header>

      <div className="mt-6">
        <AnnouncementForm
          businessId={business.id}
          urgentAllowed={business.urgent_allowed}
          topics={topics}
          locale={locale}
          t={t}
        />
      </div>
    </div>
  );
}
