import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ViewToggle<T extends string>({
  value,
  options,
  buildHref,
}: {
  value: T;
  options: { value: T; icon: LucideIcon; label: string }[];
  buildHref: (value: T) => string;
}) {
  return (
    <div className="flex items-center rounded-md border p-0.5">
      {options.map((opt) => (
        <Button
          key={opt.value}
          asChild
          variant="ghost"
          size="icon"
          className={cn("size-8", value === opt.value && "bg-muted")}
        >
          <Link href={buildHref(opt.value)} aria-label={opt.label}>
            <opt.icon className="size-4" />
          </Link>
        </Button>
      ))}
    </div>
  );
}
