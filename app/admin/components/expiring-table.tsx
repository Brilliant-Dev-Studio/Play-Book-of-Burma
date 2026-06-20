"use client";

import { useMemo, useState } from "react";

export type ExpiringRow = {
  userId: string;
  email: string;
  displayName: string | null;
  plan: "SIX_MONTHS" | "TWELVE_MONTHS" | null;
  expiresAt: string;
  isActive: boolean;
};

type Window = 7 | 14 | 30 | 60;

const WINDOWS: { label: string; value: Window }[] = [
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
  { label: "60 days", value: 60 },
];

function planLabel(plan: "SIX_MONTHS" | "TWELVE_MONTHS" | null) {
  if (plan === "SIX_MONTHS") return "6 months";
  if (plan === "TWELVE_MONTHS") return "12 months";
  return "—";
}

function DaysChip({ days }: { days: number }) {
  if (days < 0) {
    return (
      <span className="rounded-full bg-red-500/20 px-2.5 py-1 text-xs font-bold text-red-400">
        Expired {Math.abs(days)}d ago
      </span>
    );
  }
  if (days <= 7) {
    return (
      <span className="rounded-full bg-red-500/20 px-2.5 py-1 text-xs font-bold text-red-400">
        {days}d left
      </span>
    );
  }
  if (days <= 14) {
    return (
      <span className="rounded-full bg-orange-500/20 px-2.5 py-1 text-xs font-bold text-orange-300">
        {days}d left
      </span>
    );
  }
  return (
    <span className="rounded-full bg-butter/15 px-2.5 py-1 text-xs font-bold text-butter">
      {days}d left
    </span>
  );
}

export function ExpiringTable({ rows }: { rows: ExpiringRow[] }) {
  const [window, setWindow] = useState<Window>(30);
  const now = Date.now();

  const filtered = useMemo(() => {
    const cutoff = now + window * 86_400_000;
    return rows
      .map((r) => ({
        ...r,
        _days: Math.ceil((new Date(r.expiresAt).getTime() - now) / 86_400_000),
      }))
      .filter((r) => r._days <= window)
      .sort((a, b) => a._days - b._days);
  }, [rows, window, now]);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {WINDOWS.map((w) => {
          const on = w.value === window;
          return (
            <button
              key={w.value}
              type="button"
              onClick={() => setWindow(w.value)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                on
                  ? "border-coral bg-coral text-black"
                  : "border-white/15 text-white/80 hover:bg-white/6"
              }`}
            >
              {w.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black px-6 py-16 text-center text-white/45">
          No subscriptions expiring within {window} days.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/15 bg-black">
          <table className="w-full min-w-160 text-sm">
            <thead>
              <tr className="bg-coral text-black">
                <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Email</th>
                <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Name</th>
                <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Plan</th>
                <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Expires</th>
                <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Remaining</th>
                <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Account</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.userId} className="border-t border-white/10 text-white/90">
                  <td className="px-4 py-3">{r.email}</td>
                  <td className="px-4 py-3 text-white/80">{r.displayName ?? "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{planLabel(r.plan)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-white/75">
                    {new Date(r.expiresAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <DaysChip days={r._days} />
                  </td>
                  <td className="px-4 py-3">
                    {r.isActive ? (
                      <span className="text-xs text-white/45">Active</span>
                    ) : (
                      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-400">
                        Locked
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-white/35">
        Showing {filtered.length} user{filtered.length !== 1 ? "s" : ""} expiring within {window}{" "}
        days.
      </p>
    </>
  );
}
