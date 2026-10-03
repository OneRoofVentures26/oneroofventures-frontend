"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getAgenciesByIds } from "@/lib/data/agencies";
import QuoteRequestForm from "@/components/QuoteRequestForm";

export default function QuoteClient() {
  const searchParams = useSearchParams();
  const initialIds = useMemo(
    () => searchParams.get("agencies")?.split(",").filter(Boolean) ?? [],
    [searchParams],
  );
  const [ids, setIds] = useState<string[]>(initialIds);
  const agencies = getAgenciesByIds(ids);

  if (ids.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center">
        <p className="text-sm font-medium text-ink">No agencies selected</p>
        <p className="mt-1 text-sm text-ink-soft">
          Pick agencies from a city page or your comparison list before
          requesting a quote.
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
    <QuoteRequestForm
      agencies={agencies}
      onRemoveAgency={(id) => setIds((prev) => prev.filter((x) => x !== id))}
    />
  );
}
