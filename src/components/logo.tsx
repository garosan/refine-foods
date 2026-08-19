import { ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <ChefHat className="size-4" />
      </span>
      <span className="text-sm font-bold tracking-tight">
        REFINE<span className="font-normal">FOODS</span>
      </span>
    </div>
  );
}
