import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md";
  showNumber?: boolean;
  className?: string;
}

export default function StarRating({
  rating,
  size = "sm",
  showNumber = true,
  className,
}: StarRatingProps) {
  const starSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = Math.max(0, Math.min(1, rating - i));
          return (
            <span key={i} className={cn("relative inline-block", starSize)}>
              <svg viewBox="0 0 20 20" className={cn(starSize, "text-border fill-current")}>
                <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.2 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.2 6.1-.6z" />
              </svg>
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <svg viewBox="0 0 20 20" className={cn(starSize, "text-gold fill-current")}>
                  <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.2 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.2 6.1-.6z" />
                </svg>
              </span>
            </span>
          );
        })}
      </div>
      {showNumber && (
        <span className="text-sm font-medium text-ink">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
