"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { clientLogger } from "@/lib/client-logger";
import { useLocale, useT } from "@/lib/i18n/client";
import { SEX_OPTIONS, sexLabel } from "@/lib/profile";

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
  const locale = useLocale();
  const t = useT();
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
      setError(
        issue instanceof Error
          ? issue.message
          : t("ذخیره پروفایل انجام نشد.", "We could not save your profile."),
      );
    } finally {
      setLoading(false);
    }
  }

  if (status === "ready") return null;

  const label =
    status === "needs-profile"
      ? t("تکمیل پروفایل", "Finish your profile")
      : t("ورود یا ثبت‌نام", "Log in or sign up");

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
                    <span>{t("وسا", "Vasa")}</span>
                  </div>
                  <button
                    type="button"
                    className="modal-close"
                    onClick={close}
                    aria-label={t("بستن", "Close")}
                    disabled={loading}
                  >
                    {t("بستن", "Close")}
                  </button>
                </div>

                {view === "signin" ? (
                  <div className="modal-body">
                    <h2 id="auth-title" className="modal-title">
                      {t("خوش آمدی", "Welcome to Vasa")}
                    </h2>
                    <p className="modal-hint">
                      {t(
                        "با ایمیل یا حساب گوگل وارد شو. رمزی برای به خاطر سپردن نیست.",
                        "Use your email or Google account. There is no password to remember.",
                      )}
                    </p>

                    <SignInButton mode="modal">
                      <button type="button" className="ghost full">
                        {t("ادامه با ایمیل", "Continue with email")}
                      </button>
                    </SignInButton>
                    <SignInButton mode="modal">
                      <button type="button" className="ghost full">
                        {t("ادامه با گوگل", "Continue with Google")}
                      </button>
                    </SignInButton>
                  </div>
                ) : (
                  <form className="modal-body" onSubmit={submitProfile}>
                    <h2 id="auth-title" className="modal-title">
                      {t("کمی از خودت بگو", "Tell us about you")}
                    </h2>
                    <p className="modal-hint">
                      {t(
                        "فقط اسم لازمه. بقیه اختیاری‌اند و بعداً هم می‌شه عوضشون کرد.",
                        "Only your name is required. Everything else is optional and can change later.",
                      )}
                    </p>

                    <label className="label" htmlFor="name">
                      {t("نام", "Name")}
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
                          {t("سن", "Age")} <span className="optional">{t("(اختیاری)", "(optional)")}</span>
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
                          {t("جنسیت", "Gender")} <span className="optional">{t("(اختیاری)", "(optional)")}</span>
                        </label>
                        <select
                          id="sex"
                          className="input"
                          value={sex}
                          onChange={(event) => setSex(event.target.value)}
                          disabled={loading}
                        >
                          <option value="">{t("ترجیح می‌دهم نگویم", "Prefer not to say")}</option>
                          {SEX_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {sexLabel(option, locale)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <label className="label" htmlFor="company">
                      {t("شرکت", "Company")} <span className="optional">{t("(اختیاری)", "(optional)")}</span>
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
                      {loading ? t("در حال ذخیره...", "Saving...") : t("ذخیره و ادامه", "Save and continue")}
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
