// No `db` import here on purpose — safe to import from client components.
export const DATE_RANGES = ["week", "month"] as const;
export type DateRange = (typeof DATE_RANGES)[number];

export const DATE_RANGE_LABELS: Record<DateRange, string> = {
  week: "Last Week",
  month: "Last Month",
};
