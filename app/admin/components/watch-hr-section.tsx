"use client";

import { useState } from "react";
import Link from "next/link";
import { StatCard } from "@/app/admin/components/stat-card";

const TABS = ["All", "Playbook", "SOB"] as const;
type Tab = (typeof TABS)[number];

const ROWS = [
  { id: "#POB-001", name: "Finance", type: "Playbook", watchHr: 10, pct: "25 %" },
  { id: "#SOB-002", name: "Strategy", type: "SOB", watchHr: 10, pct: "25 %" },
  { id: "#POB-003", name: "Strategy", type: "Playbook", watchHr: 10, pct: "25 %" },
  { id: "#POB-004", name: "Finance", type: "Playbook", watchHr: 10, pct: "25 %" },
];

export function WatchHrSection() {
  const [active, setActive] = useState<Tab>("All");

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
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                on
                  ? "border-white bg-white text-black"
                  : "border-white/15 bg-transparent text-white/85 hover:bg-white/[0.05]"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total Watch Hr" value="60" delta="10 %" deltaDirection="up" />
        <StatCard label="Watch Hr per Subscriber" value="1" delta="10 %" deltaDirection="up" />
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
              {ROWS.map((r, i) => (
                <tr key={i} className="text-white/85">
                  <td className="px-3 py-4">{r.id}</td>
                  <td className="px-3 py-4">{r.name}</td>
                  <td className="px-3 py-4">{r.type}</td>
                  <td className="px-3 py-4">{r.watchHr}</td>
                  <td className="px-3 py-4">{r.pct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
