"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { clientLogger } from "@/lib/client-logger";
import { SEX_OPTIONS } from "@/lib/profile";
import { toPersianDigits } from "@/lib/phone";

type Status = "guest" | "needs-profile" | "ready";

const LAST_PHONE_KEY = "fc:last-phone";

function maskPhone(phone: string): string {
  const value = toPersianDigits(phone);
  if (value.length < 8) return value;
  return `${value.slice(0, 4)} *** ${value.slice(-4)}`;
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
    throw new Error(data.message ?? "یک مشکل پیش آمد. لطفا دوباره تلاش کن.");
  }
  return data;
}

export default function AuthFlow({
  status,
  phone,
  codeLength,
}: {
  status: Status;
  phone?: string;
  codeLength: number;
}) {
  const router = useRouter();
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
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loading]);

  useEffect(() => {
    if (!open) return;
    if (step === 1) phoneRef.current?.focus();
    if (step === 2) codeRef.current?.focus();
    if (step === 3) nameRef.current?.focus();
  }, [open, step]);

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
    window.localStorage.setItem(LAST_PHONE_KEY, phoneNumber);
    setOpen(false);
    reset();
    router.refresh();
  }

  async function requestOtp(value: string) {
    const resend = step === 2;
    setLoading(true);
    setError(null);
    clientLogger.info("ui.auth.otp_requested", { context: { resend } });
    try {
      const data = await postJson("/api/auth/request-otp", { phone: value });
      setActivePhone(String(data.phone ?? value));
      setDevCode(typeof data.devCode === "string" ? data.devCode : null);
      setCode("");
      setStep(2);
      setResendIn(30);
    } catch (issue) {
      clientLogger.warn("ui.auth.otp_request_failed", { error: issue, context: { resend } });
      setError(issue instanceof Error ? issue.message : "ارسال کد انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  async function submitPhone(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await requestOtp(phoneInput);
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
      setError(issue instanceof Error ? issue.message : "تایید کد انجام نشد.");
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
      setError(issue instanceof Error ? issue.message : "ذخیره پروفایل انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "ready") return null;

  const label = status === "needs-profile" ? "تکمیل پروفایل" : "ورود با شماره موبایل";

  return (
    <>
      <button type="button" className="primary login-button" onClick={openModal}>
        {label}
      </button>

      {open ? (
        <div
          className="backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
            <button
              type="button"
              className="modal-close"
              onClick={close}
              aria-label="بستن"
              disabled={loading}
            >
              بستن
            </button>

            <p className="steps" aria-live="polite">
              مرحله {toPersianDigits(String(step))} از {toPersianDigits("3")}
            </p>

            {step === 1 ? (
              <form className="modal-body" onSubmit={submitPhone}>
                <h2 id="auth-title" className="modal-title">
                  خوش آمدی
                </h2>
                <p className="modal-hint">شماره موبایلت را وارد کن تا کد ورود برایت پیامک شود.</p>

                <label className="label" htmlFor="phone">
                  شماره موبایل
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
                <p className="field-hint">با ۰۹ شروع می‌شود و ۱۱ رقم دارد.</p>

                {error ? <p className="error">{error}</p> : null}

                <button type="submit" className="primary" disabled={loading}>
                  {loading ? "در حال ارسال کد..." : "دریافت کد ورود"}
                </button>
              </form>
            ) : null}

            {step === 2 ? (
              <form className="modal-body" onSubmit={submitCode}>
                <h2 id="auth-title" className="modal-title">
                  کد ورود
                </h2>
                <p className="modal-hint">
                  کد {toPersianDigits(String(codeLength))} رقمی را برای{" "}
                  <span className="mono">{maskPhone(activePhone)}</span> فرستادیم.
                </p>

                {devCode ? (
                  <p className="dev-code">
                    حالت توسعه: پیامک تنظیم نشده، کد تو{" "}
                    <span className="mono">{toPersianDigits(devCode)}</span> است.
                  </p>
                ) : null}

                <label className="label" htmlFor="code">
                  کد ورود
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

                <button type="submit" className="primary" disabled={loading || code.length < codeLength}>
                  {loading ? "در حال بررسی..." : "تایید و ادامه"}
                </button>

                <div className="row">
                  <button type="button" className="ghost" onClick={() => setStep(1)} disabled={loading}>
                    ویرایش شماره
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => requestOtp(activePhone)}
                    disabled={loading || resendIn > 0}
                  >
                    {resendIn > 0 ? `ارسال دوباره تا ${toPersianDigits(String(resendIn))} ثانیه` : "ارسال دوباره کد"}
                  </button>
                </div>
              </form>
            ) : null}

            {step === 3 ? (
              <form className="modal-body" onSubmit={submitProfile}>
                <h2 id="auth-title" className="modal-title">
                  کمی از خودت بگو
                </h2>
                <p className="modal-hint">
                  فقط اسم لازم است، بقیه موارد اختیاری‌اند و بعدا هم می‌شود کاملشان کرد.
                </p>

                <label className="label" htmlFor="name">
                  نام
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
                      سن <span className="optional">(اختیاری)</span>
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
                      جنسیت <span className="optional">(اختیاری)</span>
                    </label>
                    <select
                      id="sex"
                      className="input"
                      value={sex}
                      onChange={(event) => setSex(event.target.value)}
                      disabled={loading}
                    >
                      <option value="">انتخاب نکن</option>
                      {SEX_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="label" htmlFor="company">
                  نام شرکت <span className="optional">(اختیاری)</span>
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

                <button type="submit" className="primary" disabled={loading || name.trim().length < 2}>
                  {loading ? "در حال ذخیره..." : "ذخیره و ورود"}
                </button>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error(`Logout failed with status ${response.status}`);
      }
      clientLogger.info("ui.auth.logout");
      router.refresh();
    } catch (issue) {
      clientLogger.error("ui.auth.logout_failed", { error: issue });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" className="ghost" onClick={logout} disabled={loading}>
      {loading ? "در حال خروج..." : "خروج از حساب"}
    </button>
  );
}
