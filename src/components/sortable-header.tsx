import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export function SortableHeader({
  label,
  field,
  currentSort,
  currentDir,
  buildHref,
}: {
  label: string;
  field: string;
  currentSort: string;
  currentDir: "asc" | "desc";
  buildHref: (sort: string, dir: "asc" | "desc") => string;
}) {
  const isActive = currentSort === field;
  const nextDir = isActive && currentDir === "asc" ? "desc" : "asc";

  return (
    <Link
      href={buildHref(field, nextDir)}
      className="inline-flex items-center gap-1 hover:text-foreground"
    >
      {label}
      {isActive ? (
        currentDir === "asc" ? (
          <ArrowUp className="size-3.5" />
        ) : (
          <ArrowDown className="size-3.5" />
        )
      ) : (
        <ArrowUpDown className="size-3.5 opacity-40" />
      )}
    </Link>
  );
}
