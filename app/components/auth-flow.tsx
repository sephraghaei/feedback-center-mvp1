"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { clientLogger } from "@/lib/client-logger";
import { SEX_OPTIONS } from "@/lib/profile";

type Status = "guest" | "needs-profile" | "ready";

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
    [key: string]: unknown;
  };
  if (!response.ok) {
    throw new Error(data.message ?? "Something went wrong. Please try again.");
  }
  return data;
}

export default function AuthFlow({
  status,
  nextPath,
}: {
  status: Status;
  nextPath?: string;
}) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"signin" | "profile">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [company, setCompany] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    setOpen(false);
    reset();
    if (nextPath) {
      router.push(nextPath);
      return;
    }
    router.refresh();
  }, [isSignedIn, router, nextPath]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) close();
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const shell = document.querySelector<HTMLElement>(".fb-shell");
    shell?.setAttribute("inert", "");
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
      shell?.removeAttribute("inert");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loading]);

  useEffect(() => {
    if (open && view === "profile") nameRef.current?.focus();
  }, [open, view]);

  useEffect(() => {
    if (status !== "guest" || !nextPath) return;
    openModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, nextPath]);

  function reset() {
    setError(null);
    setLoading(false);
  }

  function openModal() {
    reset();
    setView(status === "needs-profile" ? "profile" : "signin");
    setOpen(true);
    clientLogger.info("ui.auth.modal_opened", { context: { status } });
  }

  function close() {
    if (loading) return;
    clientLogger.info("ui.auth.modal_closed", { context: { view } });
    setOpen(false);
    reset();
  }

  function finish() {
    setOpen(false);
    reset();
    if (nextPath) {
      router.push(nextPath);
      return;
    }
    router.refresh();
  }

  async function submitProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    clientLogger.info("ui.auth.profile_submitted");
    try {
      await postJson("/api/auth/profile", { name, age, sex, company });
      clientLogger.info("ui.auth.profile_saved");
      finish();
    } catch (issue) {
      clientLogger.warn("ui.auth.profile_save_failed", { error: issue });
      setError(issue instanceof Error ? issue.message : "We could not save your profile.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "ready") return null;

  const label = status === "needs-profile" ? "Finish your profile" : "Log in or sign up";

  return (
    <>
      <button type="button" className="primary login-button" onClick={openModal}>
        {label}
      </button>

      {open
        ? createPortal(
            <div
              className="backdrop auth-screen"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) close();
              }}
            >
              <div
                className="modal auth-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="auth-title"
              >
                <div className="auth-top">
                  <div className="auth-brand" aria-hidden="true">
                    <span>Vasa</span>
                  </div>
                  <button
                    type="button"
                    className="modal-close"
                    onClick={close}
                    aria-label="Close"
                    disabled={loading}
                  >
                    Close
                  </button>
                </div>

                {view === "signin" ? (
                  <div className="modal-body">
                    <h2 id="auth-title" className="modal-title">
                      Welcome to Vasa
                    </h2>
                    <p className="modal-hint">
                      Use your email or Google account. There is no password to remember.
                    </p>

                    <SignInButton mode="modal">
                      <button type="button" className="ghost full">
                        Continue with email
                      </button>
                    </SignInButton>
                    <SignInButton mode="modal">
                      <button type="button" className="ghost full">
                        Continue with Google
                      </button>
                    </SignInButton>
                  </div>
                ) : (
                  <form className="modal-body" onSubmit={submitProfile}>
                    <h2 id="auth-title" className="modal-title">
                      Tell us about you
                    </h2>
                    <p className="modal-hint">
                      Only your name is required. Everything else is optional and can change
                      later.
                    </p>

                    <label className="label" htmlFor="name">
                      Name
                    </label>
                    <input
                      id="name"
                      ref={nameRef}
                      className="input"
                      type="text"
                      autoComplete="name"
                      maxLength={60}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      disabled={loading}
                      required
                    />

                    <div className="grid">
                      <div>
                        <label className="label" htmlFor="age">
                          Age <span className="optional">(optional)</span>
                        </label>
                        <input
                          id="age"
                          className="input ltr"
                          type="number"
                          inputMode="numeric"
                          min={5}
                          max={120}
                          value={age}
                          onChange={(event) => setAge(event.target.value)}
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="label" htmlFor="sex">
                          Gender <span className="optional">(optional)</span>
                        </label>
                        <select
                          id="sex"
                          className="input"
                          value={sex}
                          onChange={(event) => setSex(event.target.value)}
                          disabled={loading}
                        >
                          <option value="">Prefer not to say</option>
                          {SEX_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <label className="label" htmlFor="company">
                      Company <span className="optional">(optional)</span>
                    </label>
                    <input
                      id="company"
                      className="input"
                      type="text"
                      autoComplete="organization"
                      maxLength={80}
                      value={company}
                      onChange={(event) => setCompany(event.target.value)}
                      disabled={loading}
                    />

                    {error ? <p className="error">{error}</p> : null}

                    <button
                      type="submit"
                      className="primary"
                      disabled={loading || name.trim().length < 2}
                    >
                      {loading ? "Saving..." : "Save and continue"}
                    </button>
                  </form>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
