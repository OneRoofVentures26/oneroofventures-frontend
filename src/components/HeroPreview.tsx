"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion";
import { accentBadge, successBadge } from "@/lib/styles";
import { cn, formatINR } from "@/lib/utils";

/*
 * Illustrative demo of what the product does: as a service is picked, three
 * example agencies re-rank into a Top 3. The data is made up and labelled as
 * an example; nothing here is fetched.
 */

type ServiceKey = "seo" | "social" | "ads" | "web";

const SERVICES: Array<{ key: ServiceKey; label: string }> = [
  { key: "seo", label: "SEO" },
  { key: "social", label: "Social media" },
  { key: "ads", label: "Google Ads" },
  { key: "web", label: "Website" },
];

interface DemoAgency {
  id: string;
  name: string;
  initials: string;
  area: string;
  verified: boolean;
  score: Record<ServiceKey, number>;
  price: Record<ServiceKey, number>;
}

const AGENCIES: DemoAgency[] = [
  {
    id: "a",
    name: "Pixelwave Studio",
    initials: "PS",
    area: "Indiranagar",
    verified: true,
    score: { seo: 9.4, social: 8.1, ads: 8.6, web: 9.1 },
    price: { seo: 18000, social: 22000, ads: 25000, web: 45000 },
  },
  {
    id: "b",
    name: "Northstar Digital",
    initials: "ND",
    area: "Koramangala",
    verified: true,
    score: { seo: 8.7, social: 9.5, ads: 8.2, web: 8.0 },
    price: { seo: 15000, social: 16000, ads: 20000, web: 38000 },
  },
  {
    id: "c",
    name: "Kite & Co. Media",
    initials: "KM",
    area: "HSR Layout",
    verified: false,
    score: { seo: 8.2, social: 8.8, ads: 9.3, web: 8.5 },
    price: { seo: 12000, social: 14000, ads: 18000, web: 30000 },
  },
];

const STEP_MS = 2800;

export default function HeroPreview({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") setIndex((i) => (i + 1) % SERVICES.length);
    }, STEP_MS);
    return () => window.clearInterval(timer);
  }, [inView, reduceMotion]);

  const active = SERVICES[index].key;
  const ranked = [...AGENCIES].sort((a, b) => b.score[active] - a.score[active]);

  return (
    <div
      ref={ref}
      role="img"
      aria-label="Example: as you pick a service, three agencies are ranked into your top 3 picks."
      className={cn(
        "rounded-2xl border border-border bg-surface/80 p-4 shadow-raised sm:p-5 md:glass",
        className,
      )}
    >
      <div aria-hidden="true">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-sm font-semibold text-text">Your top 3 in Bangalore</p>
          <span className="text-xs text-text-muted">Example</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {SERVICES.map((s) => {
            const selected = s.key === active;
            return (
              <span
                key={s.key}
                className={cn(
                  "relative inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors duration-200",
                  selected ? "border-primary text-primary-fg" : "border-border text-text-muted",
                )}
              >
                {selected && (
                  <motion.span
                    layoutId="hero-preview-chip"
                    className="absolute inset-0 -z-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
                <span className="relative">{s.label}</span>
              </span>
            );
          })}
        </div>

        <ol className="mt-4 space-y-2.5">
          {ranked.map((agency, i) => (
            <motion.li
              key={agency.id}
              layout
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className={cn(
                "flex items-center gap-3 rounded-xl border bg-surface p-3 shadow-card",
                i === 0 ? "border-primary/40" : "border-border",
              )}
            >
              <span
                className={cn(
                  "num flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-xs font-bold",
                  i === 0 ? "bg-primary text-primary-fg" : "bg-surface-raised text-text-muted ring-1 ring-inset ring-border",
                )}
              >
                {i + 1}
              </span>
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-primary/8 to-transparent font-display text-sm font-bold text-primary-text ring-1 ring-inset ring-primary/15">
                {agency.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-text">{agency.name}</span>
                  {agency.verified && <span className={cn(successBadge, "px-1.5 text-[11px] max-sm:hidden")}>Verified</span>}
                </span>
                <span className="mt-0.5 block truncate text-xs text-text-muted">
                  {agency.area} · from{" "}
                  <span className="num font-semibold text-text">{formatINR(agency.price[active])}</span>/mo
                </span>
              </span>
              <span className={cn(accentBadge, "num gap-1 px-2 py-1 text-sm")}>
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                  <path d="M10 1.8l2.5 5.2 5.7.7-4.2 3.9 1.1 5.6L10 14.5l-5.1 2.7 1.1-5.6L1.8 7.7l5.7-.7L10 1.8z" />
                </svg>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={agency.score[active]}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: EASE }}
                  >
                    {agency.score[active].toFixed(1)}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  );
}
