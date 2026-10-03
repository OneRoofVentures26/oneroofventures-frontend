"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getAgenciesByIds } from "@/lib/data/agencies";
import { useCompare } from "@/lib/compare-context";
import ComparisonTable from "@/components/ComparisonTable";

export default function CompareClient() {
  const searchParams = useSearchParams();
  const { selectedIds, setAll, remove } = useCompare();
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current) return;
    const idsParam = searchParams.get("ids");
    if (idsParam) {
      setAll(idsParam.split(",").filter(Boolean));
    }
    seeded.current = true;
  }, [searchParams, setAll]);

  const agencies = getAgenciesByIds(selectedIds);

  if (agencies.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center">
        <p className="text-sm font-medium text-ink">No agencies selected yet</p>
        <p className="mt-1 text-sm text-ink-soft">
          Browse a city and tick &quot;Compare&quot; on 2-4 agencies to see them
          side by side.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
        >
          Browse cities
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-ink">
          Comparing {agencies.length} agenc{agencies.length === 1 ? "y" : "ies"}
        </h1>
        <Link
          href={`/quote?agencies=${selectedIds.join(",")}`}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
        >
          Request quotes from these agencies
        </Link>
      </div>

      <ComparisonTable agencies={agencies} onRemove={remove} />
    </div>
  );
}
