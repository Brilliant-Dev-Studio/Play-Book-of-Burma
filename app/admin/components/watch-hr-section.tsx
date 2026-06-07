"use client";

import { useState } from "react";
import Link from "next/link";
import { StatCard } from "@/app/admin/components/stat-card";
import type { WatchHrRow } from "@/lib/server/subscribers-stats";

const TABS = ["All", "Playbook", "SOB"] as const;
type Tab = (typeof TABS)[number];

const MAX_ROWS = 6;

/** Render hours with at most one decimal, dropping a trailing ".0". */
function fmtHr(hours: number): string {
  const r = Math.round(hours * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

export function WatchHrSection({
  subscribers,
  audioHours,
  videoHours,
  rows,
}: {
  subscribers: number;
  /** Playbook bucket (audio). */
  audioHours: number;
  /** SOB bucket (video). */
  videoHours: number;
  rows: WatchHrRow[];
}) {
  const [active, setActive] = useState<Tab>("All");

  // Playbook = audio, SOB = video (per product spec).
  const hoursByTab: Record<Tab, number> = {
    All: audioHours + videoHours,
    Playbook: audioHours,
    SOB: videoHours,
  };

  const total = hoursByTab[active];
  const perSubscriber = subscribers > 0 ? total / subscribers : 0;

  const visibleRows = (
    active === "All" ? rows : rows.filter((r) => r.type === active)
  ).slice(0, MAX_ROWS);

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold tracking-tight text-white">Watch Hr</h2>

      <div className="mb-5 grid grid-cols-3 gap-3">
        {TABS.map((t) => {
          const on = t === active;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setActive(t)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-4 py-3 transition-colors ${
                on
                  ? "border-white bg-white text-black"
                  : "border-white/15 bg-transparent text-white/85 hover:bg-white/[0.05]"
              }`}
            >
              <span className="text-sm font-semibold">{t}</span>
              <span
                className={`text-lg font-bold tracking-tight ${
                  on ? "text-black" : "text-white"
                }`}
              >
                {fmtHr(hoursByTab[t])}
                <span
                  className={`ml-1 text-xs font-semibold ${
                    on ? "text-black/55" : "text-white/55"
                  }`}
                >
                  hr
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total Watch Hr" value={fmtHr(total)} unit="hr" />
        <StatCard
          label="Watch Hr per Subscriber"
          value={fmtHr(perSubscriber)}
          unit="hr"
        />
      </div>

      <div className="rounded-2xl border border-white/15 bg-black p-5">
        <div className="mb-3 flex justify-end">
          <Link
            href="#"
            className="text-sm font-semibold text-white transition-colors hover:text-coral"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/15 text-white">
                <th className="px-3 py-3 text-left font-bold">ID</th>
                <th className="px-3 py-3 text-left font-bold">Name</th>
                <th className="px-3 py-3 text-left font-bold">Types</th>
                <th className="px-3 py-3 text-left font-bold">Watch Hr</th>
                <th className="px-3 py-3 text-left font-bold">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-8 text-center text-white/55"
                  >
                    No watch data yet.
                  </td>
                </tr>
              ) : (
                visibleRows.map((r) => (
                  <tr key={r.id} className="text-white/85">
                    <td className="px-3 py-4">{r.id}</td>
                    <td className="px-3 py-4">{r.name}</td>
                    <td className="px-3 py-4">{r.type}</td>
                    <td className="px-3 py-4">{fmtHr(r.watchHours)}</td>
                    <td className="px-3 py-4">{r.pctOfTotal} %</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
