import { kindLabel, type FeedbackKind } from "@/lib/feedback/labels";
import type { Locale } from "@/lib/i18n/locale";
import { AlertIcon, BulbIcon, HeartIcon } from "./icons";

const KIND_ICONS = {
  bug: AlertIcon,
  praise: HeartIcon,
  improvement: BulbIcon,
};

export default function FeedbackKindBadge({
  kind,
  locale = "en",
}: {
  kind: FeedbackKind;
  locale?: Locale;
}) {
  const Icon = KIND_ICONS[kind];
  return (
    <span className={`fb-kind kind-${kind}`}>
      <Icon size={12} />
      {kindLabel(kind, locale)}
    </span>
  );
}
