"use client";

import { useEffect, useState } from "react";
import { SectionBlock } from "@/app/admin/components/section-block";
import { StatCard } from "@/app/admin/components/stat-card";
import { SubscribersOverviewChart } from "@/app/admin/components/subscribers-overview-chart";
import {
  RecentSubscribersTable,
  type RecentSubscriber,
} from "@/app/admin/components/recent-subscribers-table";
import {
  DateRangeFilter,
  type RangeDays,
} from "@/app/admin/components/date-range-filter";
import type { ChartPoint } from "@/app/admin/components/subscribers-overview-chart";

type StatPoint = {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  direction?: "up" | "down";
};

type DashboardResponse = {
  actionRequired: StatPoint[];
  traffic: StatPoint[];
  revenue: StatPoint[];
  chart: ChartPoint[];
  recent: RecentSubscriber[];
};

function StatRow({ stats }: { stats: StatPoint[] }) {
  return (
    <>
      {stats.map((s) => (
        <StatCard
          key={s.label}
          label={s.label}
          value={s.value}
          unit={s.unit}
          delta={s.delta}
          deltaDirection={s.direction ?? "up"}
        />
      ))}
    </>
  );
}

export default function AdminDashboardPage() {
  const [days, setDays] = useState<RangeDays>(365);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/dashboard?days=${days}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error ?? "Failed to load.");
        return res.json();
      })
      .then((json: DashboardResponse) => {
        if (!cancelled) setData(json);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-rwst-stack)] text-3xl font-bold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-white/55">Overview of Platform Activity</p>
        </div>
        <DateRangeFilter days={days} onChange={setDays} />
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className={loading ? "opacity-50 transition-opacity" : "transition-opacity"}>
        <SectionBlock title="Action Required">
          <StatRow stats={data?.actionRequired ?? placeholderStats(3)} />
        </SectionBlock>

        <SectionBlock title="Website Traffic">
          <StatRow stats={data?.traffic ?? placeholderStats(3)} />
        </SectionBlock>

        <SectionBlock title="Revenue Overview">
          <StatRow stats={data?.revenue ?? placeholderStats(3)} />
        </SectionBlock>

        <SubscribersOverviewChart data={data?.chart ?? []} />

        <RecentSubscribersTable rows={data?.recent ?? []} />
      </div>
    </div>
  );
}

function placeholderStats(n: number): StatPoint[] {
  return Array.from({ length: n }, (_, i) => ({
    label: ` `.repeat(i + 1),
    value: "—",
  }));
}
