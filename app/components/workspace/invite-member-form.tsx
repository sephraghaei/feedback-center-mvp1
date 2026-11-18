"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addMemberAction } from "@/app/(workspace)/actions";
import { useT } from "@/lib/i18n/client";

export default function InviteMemberForm({ canInvite }: { canInvite: boolean }) {
  const t = useT();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setAdded(null);

    const result = await addMemberAction(email);
    setBusy(false);

    if (result.ok) {
      setAdded(email.trim().toLowerCase());
      setEmail("");
      router.refresh();
      return;
    }
    setError(result.error);
  }

  if (!canInvite) {
    return (
      <p className="wk-hint">
        {t("فقط مالک‌ها و مدیرهای شرکت می‌تونن هم‌تیمی اضافه کنن.", "Only company owners and admins can add teammates.")}
      </p>
    );
  }

  return (
    <form className="wk-form" onSubmit={submit}>
      <div className="wk-field-row">
        <label htmlFor="member-email">{t("ایمیل", "Email")}</label>
        <input
          id="member-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="teammate@example.com"
          autoComplete="off"
          required
          disabled={busy}
        />
        <p className="wk-hint">
          {t("اول باید با این ایمیل یه حساب وسا داشته باشن.", "They need a Vasa account with this email first.")}
        </p>
      </div>

      {error ? <p className="bd-alert">{error}</p> : null}
      {added ? (
        <p className="wk-success">
          {t(`اضافه شد: ${added}. از همین حالا می‌تونن پنل رو باز کنن.`, `Added ${added}. They can open the workspace now.`)}
        </p>
      ) : null}

      <div>
        <button type="submit" className="bd-btn bd-btn-primary" disabled={busy}>
          {busy ? t("در حال اضافه کردن...", "Adding...") : t("اضافه کردن هم‌تیمی", "Add teammate")}
        </button>
      </div>
    </form>
  );
}
