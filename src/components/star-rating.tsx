import { Star, StarHalf } from "lucide-react";

export function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`full-${i}`} className="size-3.5 fill-amber-400 text-amber-400" />
      ))}
      {hasHalf && <StarHalf className="size-3.5 fill-amber-400 text-amber-400" />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`empty-${i}`} className="size-3.5 text-muted-foreground/30" />
      ))}
    </div>
  );
}
