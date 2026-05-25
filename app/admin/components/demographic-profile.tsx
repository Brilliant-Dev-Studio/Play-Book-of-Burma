"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { StatCard } from "@/app/admin/components/stat-card";

const CORAL = "#ec7147";

export type DemographicProfileProps = {
  totalSubscribers: number;
  malePct: number;
  femalePct: number;
  ageBuckets: { label: string; pct: number }[];
  regionBuckets: { label: string; pct: number }[];
};

function HorizontalPctChart({
  data,
  title,
}: {
  data: { label: string; pct: number }[];
  title: string;
}) {
  return (
    <div className="flex-1">
      <p className="mb-3 text-sm font-semibold text-white">{title}</p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 36, left: 8, bottom: 4 }}
            barCategoryGap={14}
          >
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fill: "rgba(255,255,255,0.85)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={64}
            />
            <Bar dataKey="pct" radius={[2, 2, 2, 2]} barSize={18}>
              {data.map((_, i) => (
                <Cell key={i} fill={CORAL} />
              ))}
              <LabelList
                dataKey="pct"
                position="right"
                formatter={(v) => `${v ?? 0}%`}
                fill="#ffffff"
                fontSize={12}
                fontWeight={600}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function DemographicProfile({
  totalSubscribers,
  malePct,
  femalePct,
  ageBuckets,
  regionBuckets,
}: DemographicProfileProps) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold tracking-tight text-white">Demographic Profile</h2>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Total Subscribers" value={String(totalSubscribers)} />
        <StatCard label="Male (%)" value={String(malePct)} unit="%" />
        <StatCard label="Female (%)" value={String(femalePct)} unit="%" />
      </div>

      <div className="rounded-2xl border border-white/15 bg-black p-5">
        <div className="flex flex-col gap-6 sm:flex-row">
          <HorizontalPctChart data={ageBuckets} title="Age" />
          <HorizontalPctChart data={regionBuckets} title="Regions" />
        </div>
      </div>
    </section>
  );
}
