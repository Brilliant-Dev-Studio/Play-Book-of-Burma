"use client";

import { useMemo, useState } from "react";

type DisplayStatus = "ACTIVE" | "PENDING" | "EXPIRED" | "NONE";

export type UserRow = {
  id: string;
  email: string;
  displayName: string | null;
  membership: {
    status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
    plan: "SIX_MONTHS" | "TWELVE_MONTHS" | null;
    expiresAt: string | null;
  } | null;
  createdAt: string;
};

const TABS: { label: string; value: DisplayStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Pending", value: "PENDING" },
  { label: "Expired", value: "EXPIRED" },
  { label: "No membership", value: "NONE" },
];

function deriveStatus(row: UserRow, now: number): DisplayStatus {
  if (!row.membership) return "NONE";
  const { status, expiresAt } = row.membership;
  if (status === "APPROVED") {
    if (expiresAt && new Date(expiresAt).getTime() <= now) return "EXPIRED";
    return "ACTIVE";
  }
  if (status === "EXPIRED") return "EXPIRED";
  if (status === "PENDING") return "PENDING";
  return "NONE";
}

function planLabel(plan: "SIX_MONTHS" | "TWELVE_MONTHS" | null): string {
  if (plan === "SIX_MONTHS") return "6 months";
  if (plan === "TWELVE_MONTHS") return "12 months";
  return "—";
}

function StatusPill({ status }: { status: DisplayStatus }) {
  const styles: Record<DisplayStatus, string> = {
    ACTIVE: "bg-emerald-500/20 text-emerald-300",
    PENDING: "bg-butter/20 text-butter",
    EXPIRED: "bg-zinc-500/20 text-zinc-300",
    NONE: "bg-white/10 text-white/70",
  };
  const label: Record<DisplayStatus, string> = {
    ACTIVE: "Active",
    PENDING: "Pending",
    EXPIRED: "Expired",
    NONE: "No membership",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${styles[status]}`}>
      {label[status]}
    </span>
  );
}

export function UsersTable({ users }: { users: UserRow[] }) {
  const [tab, setTab] = useState<DisplayStatus | "ALL">("ALL");
  const now = Date.now();

  const annotated = useMemo(
    () => users.map((u) => ({ ...u, _status: deriveStatus(u, now) })),
    [users, now],
  );

  const counts = useMemo(() => {
    const base = { ALL: annotated.length, ACTIVE: 0, PENDING: 0, EXPIRED: 0, NONE: 0 };
    for (const u of annotated) base[u._status] += 1;
    return base;
  }, [annotated]);

  const rows = useMemo(() => {
    if (tab === "ALL") return annotated;
    return annotated.filter((u) => u._status === tab);
  }, [tab, annotated]);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {TABS.map((t) => {
          const on = t.value === tab;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                on
                  ? "border-coral bg-coral text-black"
                  : "border-white/15 text-white/80 hover:bg-white/[0.06]"
              }`}
            >
              {t.label}
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  on ? "bg-black/15 text-black" : "bg-white/10 text-white/75"
                }`}
              >
                {counts[t.value]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/15 bg-black">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="bg-coral text-black">
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Email</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Name</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Plan</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Expiry</th>
              <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-white/50">
                  No users in this view.
                </td>
              </tr>
            )}
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-white/10 text-white/90">
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3 text-white/80">{u.displayName ?? "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap">{planLabel(u.membership?.plan ?? null)}</td>
                <td className="px-4 py-3">
                  <StatusPill status={u._status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-white/75">
                  {u.membership?.expiresAt
                    ? new Date(u.membership.expiresAt).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-white/65">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
