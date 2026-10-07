"use client";

import { useRouter, useParams } from "next/navigation";
import type { CityItem } from "@/lib/api/types";

export default function CitySwitcher({ cities }: { cities: CityItem[] }) {
  const router = useRouter();
  const params = useParams<{ city?: string }>();
  const current = typeof params?.city === "string" && cities.some((c) => c.slug === params.city) ? params.city : "";

  if (cities.length === 0) return null;

  return (
    <select
      value={current}
      onChange={(e) => {
        if (e.target.value) router.push(`/${e.target.value}`);
      }}
      className="w-28 max-w-[40vw] rounded-md border border-border bg-surface px-2 py-1.5 text-xs font-medium text-ink outline-none focus:border-accent sm:w-auto sm:max-w-none sm:px-3 sm:text-sm"
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
  );
}
