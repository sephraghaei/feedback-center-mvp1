import { noticeText } from "@/lib/errors";
import type { Dictionary } from "@/lib/i18n";

export default function Notice({
  ok,
  error,
  t,
}: {
  ok?: string | null;
  error?: string | null;
  t: Dictionary;
}) {
  const code = error || ok;
  if (!code) return null;
  const text = noticeText(code, t);
  if (!text) return null;

  return (
    <p
      role={error ? "alert" : "status"}
      className={`notice ${error ? "notice-error" : "notice-ok"}`}
    >
      {text}
    </p>
  );
}
