"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./bits";

export default function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) throw new Error(data.message ?? "ورود انجام نشد.");
      router.push("/admin");
      router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "ورود انجام نشد.");
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <form className="login-card" onSubmit={submit}>
        <span className="login-logo">
          <Icon name="lock" size={24} />
        </span>
        <h1 className="login-title">ورود مدیر</h1>
        <p className="login-sub">
          برای ورود به پنل مدیریت فقط رمز عبور را وارد کن. بدون ایمیل، بدون شماره و بدون نام کاربری.
        </p>

        <div className="login-field">
          <label htmlFor="admin-password">رمز عبور</label>
          <div className="password-wrap">
            <input
              id="admin-password"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              required
              disabled={!configured || loading}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "پنهان کردن رمز" : "نمایش رمز"}
            >
              <Icon name={show ? "eye-off" : "eye"} size={18} />
            </button>
          </div>
        </div>

        {error ? <p className="login-error">{error}</p> : null}
        {!configured ? (
          <p className="login-error">
            ورود مدیر فعال نیست. متغیر ADMIN_PASSWORD را در محیط (یا فایل .env) تنظیم کن.
          </p>
        ) : null}

        <button type="submit" className="btn btn-primary" disabled={!configured || loading || password.length === 0}>
          {loading ? "در حال ورود..." : "ورود به پنل"}
        </button>

        <p className="login-note">رمز عبور فقط از محیط خوانده می‌شود و در کد یا مخزن ذخیره نشده است.</p>
      </form>
    </div>
  );
}