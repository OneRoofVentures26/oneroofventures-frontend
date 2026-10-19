"use client";

import { useState } from "react";
import { COVERAGE, PACKAGES, type Coverage, type PackageKey } from "@/lib/packages";
import { chip } from "@/lib/styles";
import { cn, formatINR } from "@/lib/utils";

/*
 * What each package covers. Desktop: one table, packages side by side.
 * Phones: a package switcher with one package's coverage at a time, so
 * nothing hides off the side of the screen.
 */

const GROUPS = [...new Set(COVERAGE.map((r) => r.group))];

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={cn("h-4 w-4 flex-shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Cell({ value }: { value: Coverage }) {
  if (value === true) {
    return (
      <span className="inline-flex text-success-text">
        <Check />
        <span className="sr-only">Included</span>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="text-text-muted/60">
        —<span className="sr-only">Not included</span>
      </span>
    );
  }
  return <span className="text-text">{value}</span>;
}

function DesktopTable() {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-text/20">
          <th scope="col" className="w-[34%] py-3 pr-4 text-left text-[13px] font-medium text-text-muted">
            What&apos;s covered
          </th>
          {PACKAGES.map((p) => (
            <th key={p.key} scope="col" className={cn("w-[22%] px-3 py-3 text-left align-bottom", p.popular && "bg-primary/5")}>
              <span className="block font-display text-base font-bold text-text">{p.name}</span>
              <span className="num block text-[13px] font-normal text-text-muted">{formatINR(p.monthly)}/mo</span>
            </th>
          ))}
        </tr>
      </thead>
      {GROUPS.map((group) => (
        <tbody key={group}>
          <tr>
            <th
              colSpan={PACKAGES.length + 1}
              scope="colgroup"
              className="pb-2 pt-6 text-left text-[12px] font-semibold uppercase tracking-[0.14em] text-accent-text"
            >
              {group}
            </th>
          </tr>
          {COVERAGE.filter((r) => r.group === group).map((row) => (
            <tr key={row.label} className="border-b border-border">
              <th scope="row" className="py-3 pr-4 text-left align-top font-medium text-text">
                {row.label}
              </th>
              {PACKAGES.map((p) => (
                <td key={p.key} className={cn("px-3 py-3 align-top leading-5", p.popular && "bg-primary/5")}>
                  <Cell value={row.values[p.key]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      ))}
    </table>
  );
}

function MobileList() {
  const [active, setActive] = useState<PackageKey>(PACKAGES.find((p) => p.popular)?.key ?? PACKAGES[0].key);
  const pkg = PACKAGES.find((p) => p.key === active)!;

  return (
    <div>
      <div role="tablist" aria-label="Package" className="grid grid-cols-3 gap-2">
        {PACKAGES.map((p) => (
          <button
            key={p.key}
            type="button"
            role="tab"
            aria-selected={active === p.key}
            onClick={() => setActive(p.key)}
            className={cn(chip(active === p.key, true), "flex-col gap-0 py-1.5")}
          >
            <span className="font-semibold">{p.name}</span>
            <span className="num text-[12px] opacity-80">{formatINR(p.monthly)}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-label={`${pkg.name} coverage`}>
        {GROUPS.map((group) => (
          <section key={group}>
            <h3 className="pb-1 pt-6 text-[12px] font-semibold uppercase tracking-[0.14em] text-accent-text">{group}</h3>
            <dl className="divide-y divide-border">
              {COVERAGE.filter((r) => r.group === group).map((row) => {
                const value = row.values[active];
                return (
                  <div key={row.label} className="flex items-start justify-between gap-4 py-3 text-sm">
                    <dt className={cn("min-w-0", value === false ? "text-text-muted" : "font-medium text-text")}>{row.label}</dt>
                    <dd className="max-w-[48%] flex-shrink-0 text-right leading-5">
                      <Cell value={value} />
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}

export default function PackageCoverage() {
  return (
    <>
      <div className="md:hidden">
        <MobileList />
      </div>
      <div className="hidden md:block">
        <DesktopTable />
      </div>
    </>
  );
}
