"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login, useAdminSession } from "@/lib/admin-auth";
import { warmUpBackend } from "@/lib/api/public";
import { adminThemeClass, useAdminTheme } from "@/lib/admin-theme";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/admin/ThemeToggle";

export default function AdminLoginPage() {
  const router = useRouter();
  const session = useAdminSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [theme, toggleTheme] = useAdminTheme();

  useEffect(() => {
    if (session) router.replace("/admin");
  }, [session, router]);

  // Wake the backend while the admin types their password.
  useEffect(() => warmUpBackend(), []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.success) {
      router.push("/admin");
    } else {
      setError(result.error ?? "Invalid email or password.");
    }
  }

  return (
    <div className={cn("admin-shell relative flex min-h-screen items-center justify-center bg-bg px-4", adminThemeClass(theme))}>
      <ThemeToggle theme={theme} onToggle={toggleTheme} className="absolute right-4 top-4" />
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Logo size={48} />
          <span className="text-[13px] font-medium text-text-muted">Admin</span>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-surface p-6">
          <h1 className="text-2xl text-text">Sign in</h1>
          <p className="mt-1 text-sm text-text-muted">Manage agencies, packages and leads.</p>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="admin-email" className="text-sm font-medium text-text">
                Email
              </label>
              <input
                id="admin-email"
                required
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-4 focus:ring-ring/15"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="text-sm font-medium text-text">
                Password
              </label>
              <input
                id="admin-password"
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-4 focus:ring-ring/15"
              />
            </div>
          </div>

          {error && <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 min-h-11 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
