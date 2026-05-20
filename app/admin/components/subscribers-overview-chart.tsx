"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";

const DATA = [
  { month: "Jan", total: 12, sixMonths: 10, twelveMonths: 4 },
  { month: "Feb", total: 16, sixMonths: 14, twelveMonths: 6 },
  { month: "March", total: 18, sixMonths: 16, twelveMonths: 5 },
  { month: "April", total: 21, sixMonths: 18, twelveMonths: 7 },
  { month: "May", total: 29, sixMonths: 24, twelveMonths: 8 },
  { month: "June", total: 38, sixMonths: 30, twelveMonths: 14 },
  { month: "July", total: 56, sixMonths: 36, twelveMonths: 22 },
];

const CORAL = "#ec7147";
const BUTTER = "#fecf73";
const MIST = "#ccd3d8";

export function SubscribersOverviewChart() {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-2xl font-bold tracking-tight text-white">
        Subscribers Overview
      </h2>
      <div className="rounded-2xl border border-white/15 bg-black p-4 sm:p-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={DATA}
              margin={{ top: 24, right: 16, left: 0, bottom: 8 }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="rgba(255,255,255,0.6)"
                tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                tickLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.6)"
                tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                contentStyle={{
                  background: "#0a0a0a",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#fff", fontWeight: 600 }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend
                verticalAlign="top"
                align="left"
                iconType="square"
                wrapperStyle={{ paddingBottom: 12, fontSize: 12, color: "#fff" }}
              />
              <Bar
                dataKey="total"
                name="Total"
                fill={CORAL}
                radius={[4, 4, 0, 0]}
                barSize={36}
              >
                <LabelList
                  dataKey="total"
                  position="top"
                  fill="#fff"
                  fontSize={12}
                  fontWeight={600}
                />
              </Bar>
              <Line
                type="monotone"
                dataKey="sixMonths"
                name="6 months"
                stroke={BUTTER}
                strokeWidth={2}
                dot={{ fill: BUTTER, stroke: BUTTER, r: 4 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="twelveMonths"
                name="12 Months"
                stroke={MIST}
                strokeWidth={2}
                dot={{ fill: MIST, stroke: MIST, r: 4 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
