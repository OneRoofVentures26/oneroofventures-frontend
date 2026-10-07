"use client";

import { useRouter, useParams } from "next/navigation";
import type { CityItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export default function CitySwitcher({ cities, className }: { cities: CityItem[]; className?: string }) {
  const router = useRouter();
  const params = useParams<{ city?: string }>();
  const current = typeof params?.city === "string" && cities.some((c) => c.slug === params.city) ? params.city : "";

  if (cities.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox="0 0 20 20"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <path d="M10 17.5s5.5-4.6 5.5-9a5.5 5.5 0 1 0-11 0c0 4.4 5.5 9 5.5 9Z" strokeLinejoin="round" />
        <circle cx="10" cy="8.5" r="1.8" />
      </svg>
      <select
        value={current}
        onChange={(e) => {
          if (e.target.value) router.push(`/${e.target.value}`);
        }}
        className="h-11 w-full appearance-none rounded-xl border border-border bg-surface pl-9 pr-9 text-base font-medium text-text transition-colors duration-200 hover:border-primary/40 focus:border-primary focus:outline-none md:w-auto md:text-sm [&>option]:bg-surface [&>option]:text-text"
        aria-label="Switch city"
      >
        <option value="" disabled>
          Select a city
        </option>
        {cities.map((city) => (
          <option key={city.slug} value={city.slug}>
            {city.name}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M6 8l4 4 4-4" />
      </svg>
    </div>
  );
}
