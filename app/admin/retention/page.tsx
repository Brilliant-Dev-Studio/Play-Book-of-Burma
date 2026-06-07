import { prisma } from "@/lib/prisma";
import { RetentionRangePicker } from "./range-picker";
import type { RangeDays } from "@/app/admin/components/date-range-filter";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "Sep",
  "October",
  "November",
  "Dec",
] as const;

const ALLOWED_RANGES: RangeDays[] = [7, 30, 90, 365];

type Row = {
  monthLabel: string;
  total: number;
  m1to3: string;
  m4to6: string;
  m7to12: string;
  totalPct: string;
};

function pct(numer: number, denom: number): string {
  if (denom === 0) return "—";
  return `${Math.round((numer / denom) * 100)}%`;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

export default async function AdminRetentionPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const rangeDays: RangeDays = (() => {
    const n = Number(range);
    return ALLOWED_RANGES.includes(n as RangeDays) ? (n as RangeDays) : 365;
  })();

  const now = new Date();
  const rangeStart = addDays(now, -rangeDays);

  const memberships = await prisma.membership.findMany({
    where: {
      status: { in: ["APPROVED", "EXPIRED"] },
      approvedAt: { gte: rangeStart, lte: now, not: null },
    },
    select: { approvedAt: true, expiresAt: true },
  });

  // Group memberships by approvedAt year+month
  const cohorts = new Map<
    string,
    { year: number; month: number; members: { approvedAt: Date; expiresAt: Date | null }[] }
  >();
  for (const m of memberships) {
    if (!m.approvedAt) continue;
    const y = m.approvedAt.getFullYear();
    const mo = m.approvedAt.getMonth();
    const key = `${y}-${mo}`;
    if (!cohorts.has(key))
      cohorts.set(key, { year: y, month: mo, members: [] });
    cohorts.get(key)!.members.push({
      approvedAt: m.approvedAt,
      expiresAt: m.expiresAt,
    });
  }

  // Build rows: walk each calendar month inside [rangeStart, now]
  const rows: Row[] = [];
  const cursor = startOfMonth(rangeStart);
  const end = startOfMonth(now);
  while (cursor <= end) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}`;
    const cohort = cohorts.get(key);
    const total = cohort?.members.length ?? 0;

    let r1to3 = 0;
    let r4to6 = 0;
    let r7to12 = 0;
    let rTotal = 0;

    if (cohort) {
      for (const m of cohort.members) {
        if (!m.expiresAt) continue;
        // Cohort start = approvedAt; reference dates for each window's far edge.
        const ms90 = addDays(m.approvedAt, 90); // covers 1-3 months
        const ms180 = addDays(m.approvedAt, 180); // covers 4-6 months
        const ms365 = addDays(m.approvedAt, 365); // covers 7-12 months
        if (m.expiresAt >= ms90) r1to3 += 1;
        if (m.expiresAt >= ms180) r4to6 += 1;
        if (m.expiresAt >= ms365) r7to12 += 1;
        if (m.expiresAt >= now) rTotal += 1;
      }
    }

    rows.push({
      monthLabel: MONTH_NAMES[cursor.getMonth()],
      total,
      m1to3: pct(r1to3, total),
      m4to6: pct(r4to6, total),
      m7to12: pct(r7to12, total),
      totalPct: pct(rTotal, total),
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-rwst-stack)] text-3xl font-bold tracking-tight text-white">
            Subscribers Retention
          </h1>
          <p className="mt-1 text-sm text-white/55">Cohort Analysis</p>
        </div>
        <RetentionRangePicker initialDays={rangeDays} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-y border-white/15 text-white">
              <th className="px-4 py-4 text-left font-bold">Months</th>
              <th className="px-4 py-4 text-center font-bold">Total Users</th>
              <th className="px-4 py-4 text-center font-bold">1-3 months</th>
              <th className="px-4 py-4 text-center font-bold">4-6 months</th>
              <th className="px-4 py-4 text-center font-bold">7-12 months</th>
              <th className="px-4 py-4 text-center font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-white/55">
                  No approved memberships in this range yet.
                </td>
              </tr>
            )}
            {rows.map((r, i) => {
              const isLast = i === rows.length - 1;
              return (
                <tr key={i} className={isLast ? "border-b border-white/15" : ""}>
                  <td className="px-4 py-3 text-white/90">{r.monthLabel}</td>
                  <td className="px-2 py-1.5 text-center align-middle">
                    <div
                      className={`mx-auto flex h-11 w-32 items-center justify-center font-semibold ${
                        r.total > 0 ? "bg-coral text-black" : "border border-white/10 bg-white/[0.04] text-white/40"
                      }`}
                    >
                      {r.total}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-white/90">{r.m1to3}</td>
                  <td className="px-4 py-3 text-center text-white/90">{r.m4to6}</td>
                  <td className="px-4 py-3 text-center text-white/90">{r.m7to12}</td>
                  <td className="px-4 py-3 text-center text-white/90">{r.totalPct}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
