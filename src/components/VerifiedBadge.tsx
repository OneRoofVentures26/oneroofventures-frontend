import { brassTag } from "@/lib/styles";
import { cn } from "@/lib/utils";

export default function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span title="Details checked by the OneRoof team" className={cn(brassTag, className)}>
      <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M4 10.5l4 4 8-9" strokeLinecap="square" />
      </svg>
      Verified
    </span>
  );
}
