import { cn } from "@/lib/utils";

export default function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      title="Details checked by the OneRoof team"
      className={cn(
        "inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-accent-light px-2 py-0.5 text-[11px] font-semibold text-accent-dark",
        className,
      )}
    >
      <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Verified
    </span>
  );
}
