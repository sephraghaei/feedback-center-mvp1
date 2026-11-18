import { statusLabel, statusTone } from "@/lib/feedback/labels";
import type { Locale } from "@/lib/i18n/locale";

export default function StatusChip({
  status,
  label,
  locale = "en",
}: {
  status: string;
  label?: string;
  locale?: Locale;
}) {
  return (
    <span className={`fb-chip tone-${statusTone(status)}`}>{label ?? statusLabel(status, locale)}</span>
  );
}
