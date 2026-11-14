import type { Dictionary } from "@/lib/i18n";
import { importanceKey, type Importance } from "@/lib/types";

export default function ImportanceBadge({
  importance,
  t,
}: {
  importance: Importance;
  t: Dictionary;
}) {
  const className =
    importance === "urgent"
      ? "chip chip-urgent"
      : importance === "important"
        ? "chip chip-important"
        : "chip chip-normal";

  return <span className={className}>{t[importanceKey(importance)]}</span>;
}
