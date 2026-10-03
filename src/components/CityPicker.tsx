"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES } from "@/lib/data/cities";

export default function CityPicker() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CITIES;
    return CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q),
    );
  }, [query]);

  function go(slug: string) {
    setOpen(false);
    setQuery("");
    router.push(`/${slug}`);
  }

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2 shadow-sm">
        <svg
          viewBox="0 0 20 20"
          className="ml-1 h-5 w-5 flex-shrink-0 text-ink-soft"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="9" cy="9" r="6" />
          <path d="M17 17l-4-4" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder="Search your city, e.g. Mumbai"
          className="w-full bg-transparent py-2 text-sm text-ink outline-none placeholder:text-ink-soft"
        />
        <button
          onClick={() => results[0] && go(results[0].slug)}
          className="flex-shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark"
        >
          Go
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-lg">
          {results.length === 0 && (
            <p className="px-3 py-2 text-sm text-ink-soft">No matching city</p>
          )}
          {results.map((city) => (
            <button
              key={city.slug}
              onClick={() => go(city.slug)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
            >
              <span className="font-medium text-ink">{city.name}</span>
              <span className="text-xs text-ink-soft">{city.state}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
