import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ViewToggle({
  view,
  buildHref,
}: {
  view: "list" | "grid";
  buildHref: (view: "list" | "grid") => string;
}) {
  return (
    <div className="flex items-center rounded-md border p-0.5">
      <Button
        asChild
        variant="ghost"
        size="icon"
        className={cn("size-8", view === "list" && "bg-muted")}
      >
        <Link href={buildHref("list")} aria-label="List view">
          <List className="size-4" />
        </Link>
      </Button>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className={cn("size-8", view === "grid" && "bg-muted")}
      >
        <Link href={buildHref("grid")} aria-label="Grid view">
          <LayoutGrid className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
