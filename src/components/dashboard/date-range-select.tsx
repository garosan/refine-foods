"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DATE_RANGES, DATE_RANGE_LABELS, type DateRange } from "@/app/(app)/dashboard/constants";

export function DateRangeSelect({ value }: { value: DateRange }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("range", v);
        router.push(`${pathname}?${params.toString()}`);
      }}
    >
      <SelectTrigger className="w-[150px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {DATE_RANGES.map((r) => (
          <SelectItem key={r} value={r}>
            {DATE_RANGE_LABELS[r]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
