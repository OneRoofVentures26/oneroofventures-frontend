"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminSession, logout } from "@/lib/admin-auth";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/agencies", label: "Agencies" },
  { href: "/admin/import", label: "Import CSV" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/cities", label: "Cities & localities" },
  { href: "/admin/services", label: "Services" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useAdminSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            "block rounded-md px-3 py-2 text-sm font-medium transition",
            isActive(item.href)
              ? "bg-accent-light text-accent-dark"
              : "text-ink-soft hover:bg-muted hover:text-ink",
          )}
        >
          {item.label}
        </Link>
      ))}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-md px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-muted hover:text-ink"
      >
        View site ↗
      </a>
      <button
        type="button"
        onClick={handleLogout}
        className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-ink-soft transition hover:bg-muted hover:text-ink"
      >
        Logout
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="rounded-md border border-border p-1.5 text-ink-soft lg:hidden"
            aria-label="Toggle navigation"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
            </svg>
          </button>
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-accent text-xs font-bold text-white">
            OR
          </span>
          <span className="hidden text-sm font-bold text-ink sm:inline">OneRoof Admin</span>
        </div>
        <span className="min-w-0 truncate text-sm text-ink-soft">{session?.username}</span>
      </header>

      <div className="flex">
        <aside className="hidden w-56 flex-shrink-0 border-r border-border bg-surface p-4 lg:block">
          {navLinks}
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute inset-y-0 left-0 w-56 border-r border-border bg-surface p-4 shadow-xl">
              {navLinks}
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
