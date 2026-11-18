"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addMemberAction } from "@/app/(workspace)/actions";

export default function InviteMemberForm({ canInvite }: { canInvite: boolean }) {
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
    return <p className="wk-hint">Only company owners and admins can add teammates.</p>;
  }

  return (
    <form className="wk-form" onSubmit={submit}>
      <div className="wk-field-row">
        <label htmlFor="member-email">Email</label>
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
        <p className="wk-hint">They need a Vasa account with this email first.</p>
      </div>

      {error ? <p className="bd-alert">{error}</p> : null}
      {added ? (
        <p className="wk-success">Added {added}. They can open the workspace now.</p>
      ) : null}

      <div>
        <button type="submit" className="bd-btn bd-btn-primary" disabled={busy}>
          {busy ? "Adding..." : "Add teammate"}
        </button>
      </div>
    </form>
  );
}
