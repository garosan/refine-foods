"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleCategoryVisibility } from "@/app/(app)/categories/actions";

export function VisibilityToggle({
  categoryId,
  visible,
}: {
  categoryId: string;
  visible: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={visible}
        disabled={isPending}
        onCheckedChange={(checked) =>
          startTransition(() => toggleCategoryVisibility(categoryId, checked))
        }
      />
      <span className="text-sm text-muted-foreground">
        {visible ? "Visible" : "Hidden"}
      </span>
    </div>
  );
}
