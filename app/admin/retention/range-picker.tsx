"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DateRangeFilter, type RangeDays } from "@/app/admin/components/date-range-filter";

export function RetentionRangePicker({ initialDays }: { initialDays: RangeDays }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <DateRangeFilter
      days={initialDays}
      onChange={(days) => {
        const params = new URLSearchParams(searchParams?.toString() ?? "");
        params.set("range", String(days));
        router.push(`/admin/retention?${params.toString()}`);
      }}
    />
  );
}
