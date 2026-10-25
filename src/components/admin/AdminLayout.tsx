"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminSession, logout } from "@/lib/admin-auth";
import { listContactRequests } from "@/lib/api/admin";
import { adminThemeClass, useAdminTheme } from "@/lib/admin-theme";
import ThemeToggle from "@/components/admin/ThemeToggle";
import { useAsync } from "@/lib/use-async";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/agencies", label: "Agencies" },
  { href: "/admin/import", label: "Import CSV" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/contact-requests", label: "Contact requests" },
  { href: "/admin/cities", label: "Cities & localities" },
  { href: "/admin/services", label: "Services" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useAdminSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, toggleTheme] = useAdminTheme();
  // Contact messages aren't emailed, so the sidebar shows how many are new. Re-checked on every page change.
  const newContacts = useAsync(() => listContactRequests({ status: "NEW", size: 1 }), pathname);
  const badges: Record<string, number | undefined> = { "/admin/contact-requests": newContacts.data?.total };

  function handleLogout() {
    logout();
    router.replace("/admin/login");
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const navLinks = (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setSidebarOpen(false)}
          className={cn(
            "flex items-center justify-between gap-2 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition",
            isActive(item.href)
              ? "border-accent bg-surface text-text"
              : "border-transparent text-text-muted hover:bg-surface hover:text-text",
          )}
        >
          {item.label}
          {!!badges[item.href] && (
            <span
              className="num rounded-full bg-accent px-1.5 py-0.5 text-[11px] font-semibold leading-none text-accent-fg"
              aria-label={`${badges[item.href]} new`}
            >
              {badges[item.href]}
            </span>
          )}
        </Link>
      ))}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block border-t border-border px-3 pb-2 pt-4 text-sm font-medium text-text-muted transition hover:text-text"
      >
        View site ↗
      </a>
      <button
        type="button"
        onClick={handleLogout}
        className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-text-muted transition hover:bg-surface hover:text-text"
      >
        Logout
      </button>
    </nav>
  );

  return (
    <div className={cn("admin-shell min-h-screen bg-bg", adminThemeClass(theme))}>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-text lg:hidden"
            aria-label="Toggle navigation"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="square" />
            </svg>
          </button>
          <Logo size={34} />
          <span className="hidden border-l border-border pl-3 text-sm font-medium text-text-muted sm:inline">Admin</span>
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <span className="min-w-0 truncate text-sm text-text-muted">{session?.username}</span>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 flex-shrink-0 self-start overflow-y-auto p-4 lg:block theme-navy">
          {navLinks}
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-ink/50"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="theme-navy absolute inset-y-0 left-0 w-56 p-4">
              {navLinks}
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
