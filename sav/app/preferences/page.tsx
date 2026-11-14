import { savePreferences } from "@/app/actions";
import Notice from "@/components/notice";
import { Icon } from "@/components/icons";
import { requireUser } from "@/lib/auth";
import { firstParam } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { NotificationChannel, Preferences } from "@/lib/types";

export const metadata = { title: "تنظیمات اعلان | ساو" };

const DEFAULTS: Preferences = {
  normal_channels: ["in_app"],
  important_channels: ["in_app", "email"],
  urgent_channels: ["in_app", "email"],
};

export default async function PreferencesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);
  const viewer = await requireUser("/preferences");
  const supabase = await createSupabaseServer();

  const { data } = await supabase
    .from("notification_preferences")
    .select("normal_channels, important_channels, urgent_channels")
    .eq("user_id", viewer.user!.id)
    .maybeSingle();

  const prefs: Preferences = (data as Preferences | null) ?? DEFAULTS;

  const levels = [
    { name: "normal", title: t.prefsNormal, channels: prefs.normal_channels },
    { name: "important", title: t.prefsImportant, channels: prefs.important_channels },
    { name: "urgent", title: t.prefsUrgent, channels: prefs.urgent_channels },
  ];

  const options: { value: NotificationChannel; label: string }[] = [
    { value: "in_app", label: t.prefsInApp },
    { value: "email", label: t.prefsEmail },
  ];

  return (
    <div className="page">
      <header>
        <p className="eyebrow">{t.navPreferences}</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">{t.prefsTitle}</h1>
        <p className="muted mt-2 max-w-xl">{t.prefsSub}</p>
      </header>

      <div className="mt-5">
        <Notice ok={firstParam(params.ok)} error={firstParam(params.error)} t={t} />
      </div>

      <form action={savePreferences} className="card mt-5 divide-y divide-line">
        {levels.map((level) => (
          <fieldset key={level.name} className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
            <legend className="sr-only">{level.title}</legend>
            <p className="text-sm font-medium text-ink">{level.title}</p>
            <div className="flex flex-wrap items-center gap-5">
              {options.map((option) => (
                <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm text-ink-2">
                  <input
                    type="checkbox"
                    name={level.name}
                    value={option.value}
                    defaultChecked={level.channels.includes(option.value)}
                    className="h-4 w-4 rounded border-line-strong accent-brand"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <div className="flex items-center justify-end gap-2 p-5 sm:p-6">
          <button type="submit" className="btn btn-primary">
            <Icon name="check" size={16} />
            {t.prefsSave}
          </button>
        </div>
      </form>
    </div>
  );
}
