"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getSession, useAdminSession } from "@/lib/admin-auth";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const session = useAdminSession();
  const router = useRouter();

  useEffect(() => {
    // Read storage directly: during hydration `session` is still the server snapshot (null).
    if (!session && !getSession()) router.replace("/admin/login");
  }, [session, router]);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink-soft">
        Checking session…
      </div>
    );
  }

  return <>{children}</>;
}
