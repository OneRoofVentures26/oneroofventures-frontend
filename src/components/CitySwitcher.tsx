"use client";

import { useRouter, useParams } from "next/navigation";
import { CITIES } from "@/lib/data/cities";

export default function CitySwitcher() {
  const router = useRouter();
  const params = useParams<{ city?: string }>();
  const current = typeof params?.city === "string" ? params.city : "";

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
      {CITIES.map((city) => (
        <option key={city.slug} value={city.slug}>
          {city.name}
        </option>
      ))}
    </select>
  );
}
