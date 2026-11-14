import { saveAnnouncement } from "@/app/actions";
import type { Dictionary, Locale } from "@/lib/i18n";
import { importanceKey, topicName, type Importance, type Topic } from "@/lib/types";
import { Icon } from "./icons";

const IMPORTANCE: Importance[] = ["normal", "important", "urgent"];

export default function AnnouncementForm({
  businessId,
  urgentAllowed,
  topics,
  locale,
  t,
  announcement,
}: {
  businessId: string;
  urgentAllowed: boolean;
  topics: Topic[];
  locale: Locale;
  t: Dictionary;
  announcement?: {
    id: string;
    title: string;
    body: string;
    importance: Importance;
    status: string;
    attachment_url: string | null;
    topicIds: string[];
  };
}) {
  const published = announcement?.status === "published";

  return (
    <form action={saveAnnouncement} className="card divide-y divide-line">
      <input type="hidden" name="businessId" value={businessId} />
      {announcement ? <input type="hidden" name="announcementId" value={announcement.id} /> : null}

      <div className="grid gap-4 p-5 sm:p-6">
        <label className="field">
          <span className="label">{t.manageAnnouncementTitle}</span>
          <input
            name="title"
            required
            defaultValue={announcement?.title ?? ""}
            className="input"
            maxLength={160}
          />
        </label>

        <label className="field">
          <span className="label">{t.manageAnnouncementBody}</span>
          <textarea
            name="body"
            required
            defaultValue={announcement?.body ?? ""}
            className="textarea min-h-44"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field">
            <span className="label">{t.searchImportance}</span>
            <select
              name="importance"
              defaultValue={announcement?.importance ?? "normal"}
              className="select"
            >
              {IMPORTANCE.map((value) => (
                <option key={value} value={value} disabled={value === "urgent" && !urgentAllowed}>
                  {t[importanceKey(value)]}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="label">{t.manageAttachment}</span>
            <input
              name="attachmentUrl"
              defaultValue={announcement?.attachment_url ?? ""}
              className="input"
              dir="ltr"
              placeholder="https://"
            />
          </label>
        </div>

        {!urgentAllowed ? (
          <p className="notice notice-error">{t.manageUrgentLocked}</p>
        ) : null}
      </div>

      <fieldset className="p-5 sm:p-6">
        <legend className="label mb-3">{t.manageTopics}</legend>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <label
              key={topic.id}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink-2 hover:border-line-strong"
            >
              <input
                type="checkbox"
                name="topicIds"
                value={topic.id}
                defaultChecked={announcement?.topicIds.includes(topic.id)}
                className="h-4 w-4 rounded border-line-strong accent-brand"
              />
              {topicName(topic, locale)}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-end gap-2 p-5 sm:p-6">
        {!published ? (
          <button type="submit" name="intent" value="draft" className="btn">
            {t.actionSaveDraft}
          </button>
        ) : null}
        <button type="submit" name="intent" value="publish" className="btn btn-primary">
          <Icon name="check" size={16} />
          {published ? t.actionSave : announcement ? t.actionPublish : t.managePublishNow}
        </button>
      </div>
    </form>
  );
}
