"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminSession, logout } from "@/lib/admin-auth";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

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
            "block rounded-sm border-l-2 px-3 py-2 text-sm font-medium transition",
            isActive(item.href)
              ? "border-paper bg-harbor-dark text-paper"
              : "border-transparent text-paper/75 hover:bg-harbor-dark hover:text-paper",
          )}
        >
          {item.label}
        </Link>
      ))}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block rounded-sm border-t border-paper/15 px-3 pb-2 pt-4 text-sm font-medium text-paper/75 transition hover:text-paper"
      >
        View site ↗
      </a>
      <button
        type="button"
        onClick={handleLogout}
        className="block w-full rounded-sm px-3 py-2 text-left text-sm font-medium text-paper/75 transition hover:bg-harbor-dark hover:text-paper"
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
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-text lg:hidden"
            aria-label="Toggle navigation"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="square" />
            </svg>
          </button>
          <Logo size={26} />
          <span className="hidden border-l border-border pl-3 text-sm font-medium text-text-muted sm:inline">Admin</span>
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <span className="min-w-0 truncate text-sm text-text-muted">{session?.username}</span>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 flex-shrink-0 self-start overflow-y-auto bg-harbor p-4 lg:block">
          {navLinks}
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-ink/40"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute inset-y-0 left-0 w-56 bg-harbor p-4">
              {navLinks}
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
