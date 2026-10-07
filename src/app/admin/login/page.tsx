"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login, useAdminSession } from "@/lib/admin-auth";
import { warmUpBackend } from "@/lib/api/public";
import Logo from "@/components/Logo";

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
        <div className="mb-6 flex flex-col items-center gap-2">
          <Logo size={36} />
          <span className="text-xs font-medium text-ink-soft">Admin</span>
        </div>

        <form onSubmit={handleSubmit} className="rounded-sm border border-mist bg-surface p-6">
          <h1 className="text-2xl text-ink">Sign in</h1>
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
                className="mt-1 min-h-11 w-full rounded-sm border border-mist bg-surface px-3 py-2 text-sm outline-none focus:border-harbor"
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
                className="mt-1 min-h-11 w-full rounded-sm border border-mist bg-surface px-3 py-2 text-sm outline-none focus:border-harbor"
              />
            </div>
          </div>

          {error && <p className="mt-4 rounded-sm bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 min-h-11 w-full rounded-sm bg-harbor px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-harbor-dark disabled:cursor-not-allowed disabled:opacity-50"
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
