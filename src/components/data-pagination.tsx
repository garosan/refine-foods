import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function windowedPages(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, total, current]);
  if (current > 1) pages.add(current - 1);
  if (current < total) pages.add(current + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("ellipsis");
    result.push(sorted[i]);
  }
  return result;
}

export function DataPagination({
  page,
  totalPages,
  totalItems,
  buildHref,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-4 border-t px-2 py-3">
      <p className="text-sm text-muted-foreground">
        {totalItems.toLocaleString()} total
      </p>
      <div className="flex items-center gap-1">
        <Button asChild variant="ghost" size="icon" disabled={page <= 1}>
          <Link
            href={buildHref(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={cn(page <= 1 && "pointer-events-none opacity-50")}
          >
            <ChevronLeft className="size-4" />
          </Link>
        </Button>

        {windowedPages(page, totalPages).map((p, i) =>
          p === "ellipsis" ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Button
              key={p}
              asChild
              variant={p === page ? "outline" : "ghost"}
              size="icon"
            >
              <Link href={buildHref(p)}>{p}</Link>
            </Button>
          ),
        )}

        <Button
          asChild
          variant="ghost"
          size="icon"
          disabled={page >= totalPages}
        >
          <Link
            href={buildHref(Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
            className={cn(page >= totalPages && "pointer-events-none opacity-50")}
          >
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
