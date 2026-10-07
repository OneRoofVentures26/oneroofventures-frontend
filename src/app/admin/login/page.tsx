"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login, useAdminSession } from "@/lib/admin-auth";
import { warmUpBackend } from "@/lib/api/public";

export default function AdminLoginPage() {
  const router = useRouter();
  const session = useAdminSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-sm font-bold text-white">
            OR
          </span>
          <span className="text-base font-bold text-ink">OneRoof Admin</span>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h1 className="text-lg font-bold text-ink">Sign in</h1>
          <p className="mt-1 text-sm text-ink-soft">Manage agencies, packages and leads.</p>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="admin-email" className="text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="admin-email"
                required
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="text-sm font-medium text-ink">
                Password
              </label>
              <input
                id="admin-password"
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
          </div>

          {error && <p className="mt-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
          {submitting && (
            <p className="mt-2 text-center text-xs text-ink-soft">
              The server may take up to a minute to wake up.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
