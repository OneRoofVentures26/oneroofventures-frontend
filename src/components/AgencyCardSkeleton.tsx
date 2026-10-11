import { card } from "@/lib/styles";
import { cn } from "@/lib/utils";

export default function AgencyCardSkeleton() {
  return (
    <div className={cn(card, "flex h-full animate-pulse flex-col p-4")} aria-hidden="true">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-border" />
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="h-4 w-2/3 rounded bg-border" />
          <div className="h-3 w-1/3 rounded bg-border" />
        </div>
      </div>
      <div className="mt-3 flex gap-1.5">
        <div className="h-6 w-16 rounded-full bg-border" />
        <div className="h-6 w-20 rounded-full bg-border" />
        <div className="h-6 w-14 rounded-full bg-border" />
      </div>
      <div className="mt-4 h-5 w-28 rounded bg-border" />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="h-11 rounded-xl bg-border" />
        <div className="h-11 rounded-xl bg-border" />
      </div>
    </div>
  );
}
