import { toggleSaved } from "@/app/actions";
import type { Dictionary } from "@/lib/i18n";
import { Icon } from "./icons";

export default function SaveButton({
  announcementId,
  saved,
  authed,
  next,
  t,
}: {
  announcementId: string;
  saved: boolean;
  authed: boolean;
  next: string;
  t: Dictionary;
}) {
  if (!authed) {
    return (
      <a
        href={`/sign-in?next=${encodeURIComponent(next)}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-3 hover:text-ink"
      >
        <Icon name="bookmark" size={15} />
        {t.actionSave}
      </a>
    );
  }

  return (
    <form action={toggleSaved}>
      <input type="hidden" name="announcementId" value={announcementId} />
      <input type="hidden" name="next" value={next} />
      <button
        type="submit"
        className={`inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium ${
          saved ? "text-brand" : "text-ink-3 hover:text-ink"
        }`}
        aria-pressed={saved}
      >
        <Icon name="bookmark" size={15} />
        {saved ? t.actionSaved : t.actionSave}
      </button>
    </form>
  );
}
