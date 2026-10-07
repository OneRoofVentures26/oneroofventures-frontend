"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import CitySwitcher from "@/components/CitySwitcher";
import CompareNavBadge from "@/components/CompareNavBadge";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import type { CityItem } from "@/lib/api/types";
import { DURATION, EASE, SPRING } from "@/lib/motion";
import { ctaButton } from "@/lib/styles";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/services", label: "Our package" },
  { href: "/about", label: "About" },
];

export default function Navbar({ cities }: { cities: CityItem[] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close the menu on navigation.
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const button = menuButtonRef.current;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a, button, select")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      button?.focus();
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "glass sticky top-0 z-40 border-b transition-colors duration-200",
        scrolled ? "border-border" : "border-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link
          href="/"
          className="flex min-h-11 min-w-0 items-center rounded-lg max-[399px]:[&_.logo-sub]:hidden"
          aria-label="OneRoof Ventures home"
        >
          <Logo size={30} />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-text-muted transition-colors duration-200 hover:text-text"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-shrink-0 items-center gap-2">
          <CompareNavBadge />
          <div className="hidden md:block">
            <CitySwitcher cities={cities} />
          </div>
          <ThemeToggle />
          <Link href="/quote" className={cn(ctaButton, "max-md:hidden")}>
            Get quotes
          </Link>
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-text active:scale-[0.98] lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h10" />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-bg/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.ui, ease: EASE }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              ref={panelRef}
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="absolute inset-y-0 right-0 flex w-[min(20rem,86vw)] flex-col border-l border-border bg-surface p-4 shadow-raised"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={SPRING}
            >
              <div className="flex items-center justify-between">
                <Logo size={26} variant="mark" />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-text-muted hover:text-text"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <nav aria-label="Mobile" className="mt-4 flex flex-col">
                {LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-12 items-center rounded-xl px-3 text-base font-medium text-text transition-colors hover:bg-surface-raised"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {cities.length > 0 && (
                <div className="mt-6 border-t border-border pt-6">
                  <p className="mb-2 px-1 text-sm font-medium text-text-muted">Your city</p>
                  <CitySwitcher cities={cities} className="w-full" />
                </div>
              )}

              <Link href="/quote" onClick={() => setMenuOpen(false)} className={cn(ctaButton, "mt-auto w-full")}>
                Get quotes
              </Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
