"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import BrandMark from "../../components/brand-mark";
import ThemeToggle from "../../components/theme-toggle";
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
      if (!response.ok) throw new Error(data.message ?? "Sign-in failed.");
      router.push("/admin");
      router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Sign-in failed.");
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <ThemeToggle />
      <form className="login-card" onSubmit={submit}>
        <BrandMark className="login-logo" />
        <h1 className="login-title">Admin sign-in</h1>
        <p className="login-sub">
          Enter the admin password to open the panel. No email, phone or username.
        </p>

        <div className="login-field">
          <label htmlFor="admin-password">Password</label>
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
              aria-label={show ? "Hide password" : "Show password"}
            >
              <Icon name={show ? "eye-off" : "eye"} size={18} />
            </button>
          </div>
        </div>

        {error ? <p className="login-error">{error}</p> : null}
        {!configured ? (
          <p className="login-error">
            Admin sign-in is not enabled. Set ADMIN_PASSWORD in the environment (or in .env).
          </p>
        ) : null}

        <button type="submit" className="btn btn-primary" disabled={!configured || loading || password.length === 0}>
          {loading ? "Signing in..." : "Open the panel"}
        </button>

        <p className="login-note">The password is read from the environment only and is never stored in code or the repository.</p>
      </form>
    </div>
  );
}