import { KIND_LABELS, type FeedbackKind } from "@/lib/feedback/labels";
import { AlertIcon, BulbIcon, HeartIcon } from "./icons";

const KIND_ICONS = {
  bug: AlertIcon,
  praise: HeartIcon,
  improvement: BulbIcon,
};

export default function FeedbackKindBadge({ kind }: { kind: FeedbackKind }) {
  const Icon = KIND_ICONS[kind];
  return (
    <span className={`fb-kind kind-${kind}`}>
      <Icon size={12} />
      {KIND_LABELS[kind]}
    </span>
  );
}
