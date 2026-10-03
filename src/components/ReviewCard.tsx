import type { Review } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import StarRating from "@/components/StarRating";

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{review.author}</p>
          <p className="text-xs text-ink-soft">{review.company}</p>
        </div>
        <StarRating rating={review.rating} showNumber={false} />
      </div>

      <p className="mt-3 text-sm text-ink-soft">{review.text}</p>

      <div className="mt-4 flex items-center gap-2">
        {review.verified && (
          <span className="flex items-center gap-1 rounded-full bg-accent-light px-2 py-0.5 text-[11px] font-medium text-accent-dark">
            <svg viewBox="0 0 20 20" className="h-3 w-3 fill-current">
              <path d="M10 1.5l2 1.2 2.3-.3 1 2.1 2.1 1-.3 2.3 1.2 2-1.2 2 .3 2.3-2.1 1-1 2.1-2.3-.3-2 1.2-2-1.2-2.3.3-1-2.1-2.1-1 .3-2.3-1.2-2 1.2-2-.3-2.3 2.1-1 1-2.1 2.3.3z" />
            </svg>
            Verified
          </span>
        )}
        <span className="text-xs text-ink-soft">{formatDate(review.date)}</span>
      </div>
    </div>
  );
}
