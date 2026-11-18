"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { clientLogger } from "@/lib/client-logger";
import { SEX_OPTIONS } from "@/lib/profile";

type Status = "guest" | "needs-profile" | "ready";

const LAST_PHONE_KEY = "fc:last-phone";

function maskPhone(phone: string): string {
  if (phone.length < 8) return phone;
  return `${phone.slice(0, 4)} *** ${phone.slice(-4)}`;
}

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
  phone,
  codeLength,
  nextPath,
}: {
  status: Status;
  phone?: string;
  codeLength: number;
  nextPath?: string;
}) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);

  const [activePhone, setActivePhone] = useState(phone ?? "");
  const [phoneInput, setPhoneInput] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [company, setCompany] = useState("");

  const phoneRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
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
    if (step !== 2 || resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, resendIn]);

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
    if (!open) return;
    if (step === 1) phoneRef.current?.focus();
    if (step === 2) codeRef.current?.focus();
    if (step === 3) nameRef.current?.focus();
  }, [open, step]);

  useEffect(() => {
    if (status !== "guest" || !nextPath) return;
    openModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, nextPath]);

  function reset() {
    setError(null);
    setDevCode(null);
    setCode("");
    setResendIn(0);
    setLoading(false);
  }

  function openModal() {
    reset();
    setStep(status === "needs-profile" ? 3 : 1);
    setActivePhone(phone ?? "");
    setPhoneInput("");
    setOpen(true);
    clientLogger.info("ui.auth.modal_opened", { context: { status } });
    if (status === "guest") {
      const saved = window.localStorage.getItem(LAST_PHONE_KEY);
      if (saved) setPhoneInput(saved);
    }
  }

  function close() {
    if (loading) return;
    clientLogger.info("ui.auth.modal_closed", { context: { step } });
    setOpen(false);
    reset();
  }

  function finish(phoneNumber: string) {
    if (phoneNumber) window.localStorage.setItem(LAST_PHONE_KEY, phoneNumber);
    setOpen(false);
    reset();
    if (nextPath) {
      router.push(nextPath);
      return;
    }
    router.refresh();
  }

  async function requestOtp(target: { phone: string }) {
    const resend = step === 2;
    setLoading(true);
    setError(null);
    clientLogger.info("ui.auth.otp_requested", { context: { resend } });
    try {
      const data = await postJson("/api/auth/request-otp", target);
      setActivePhone(target.phone);
      setDevCode(typeof data.devCode === "string" ? data.devCode : null);
      setCode("");
      setStep(2);
      setResendIn(30);
    } catch (issue) {
      clientLogger.warn("ui.auth.otp_request_failed", { error: issue, context: { resend } });
      setError(issue instanceof Error ? issue.message : "We could not send the code.");
    } finally {
      setLoading(false);
    }
  }

  async function submitPhone(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await requestOtp({ phone: phoneInput });
  }

  async function submitCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    clientLogger.info("ui.auth.otp_submitted");
    try {
      const data = await postJson("/api/auth/verify-otp", { code });
      if (data.hasProfile) {
        clientLogger.info("ui.auth.otp_verified", { context: { hasProfile: true } });
        finish(activePhone);
      } else {
        clientLogger.info("ui.auth.otp_verified", { context: { hasProfile: false } });
        setStep(3);
      }
    } catch (issue) {
      clientLogger.warn("ui.auth.otp_verify_failed", { error: issue });
      setError(issue instanceof Error ? issue.message : "We could not verify that code.");
      setCode("");
      codeRef.current?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function submitProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    clientLogger.info("ui.auth.profile_submitted");
    try {
      await postJson("/api/auth/profile", { name, age, sex, company });
      clientLogger.info("ui.auth.profile_saved");
      finish(activePhone);
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

                <p className="steps" aria-live="polite">
                  Step {step} of 3
                </p>

                {step === 1 ? (
                  <form className="modal-body" onSubmit={submitPhone}>
                    <h2 id="auth-title" className="modal-title">
                      Welcome to Vasa
                    </h2>
                    <p className="modal-hint">
                      Enter your mobile number and we will text you a login code.
                    </p>

                    <label className="label" htmlFor="phone">
                      Mobile number
                    </label>
                    <input
                      id="phone"
                      ref={phoneRef}
                      className="input ltr"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="09123456789"
                      value={phoneInput}
                      onChange={(event) => setPhoneInput(event.target.value)}
                      disabled={loading}
                      required
                    />
                    <p className="field-hint">Starts with 09 and has 11 digits.</p>

                    {error ? <p className="error">{error}</p> : null}

                    <button type="submit" className="primary" disabled={loading}>
                      {loading ? "Sending code..." : "Send login code"}
                    </button>

                    <p className="divider">
                      <span>or</span>
                    </p>

                    <SignInButton mode="modal">
                      <button type="button" className="ghost full" disabled={loading}>
                        Continue with email
                      </button>
                    </SignInButton>
                    <SignInButton mode="modal">
                      <button type="button" className="ghost full" disabled={loading}>
                        Continue with Google
                      </button>
                    </SignInButton>
                  </form>
                ) : null}

                {step === 2 ? (
                  <form className="modal-body" onSubmit={submitCode}>
                    <h2 id="auth-title" className="modal-title">
                      Enter your code
                    </h2>
                    <p className="modal-hint">
                      We sent a {codeLength} digit code to{" "}
                      <span className="mono">{maskPhone(activePhone)}</span>.
                    </p>

                    {devCode ? (
                      <p className="dev-code">
                        Development mode: SMS is off, so your code is{" "}
                        <span className="mono">{devCode}</span>.
                      </p>
                    ) : null}

                    <label className="label" htmlFor="code">
                      Login code
                    </label>
                    <input
                      id="code"
                      ref={codeRef}
                      className="input otp-input ltr"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={codeLength}
                      placeholder={"-".repeat(codeLength)}
                      value={code}
                      onChange={(event) =>
                        setCode(
                          event.target.value
                            .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
                            .replace(/\D/g, "")
                            .slice(0, codeLength),
                        )
                      }
                      disabled={loading}
                      required
                    />

                    {error ? <p className="error">{error}</p> : null}

                    <button
                      type="submit"
                      className="primary"
                      disabled={loading || code.length < codeLength}
                    >
                      {loading ? "Checking..." : "Verify and continue"}
                    </button>

                    <div className="row">
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => setStep(1)}
                        disabled={loading}
                      >
                        Change number
                      </button>
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => requestOtp({ phone: activePhone })}
                        disabled={loading || resendIn > 0}
                      >
                        {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                      </button>
                    </div>
                  </form>
                ) : null}

                {step === 3 ? (
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
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
