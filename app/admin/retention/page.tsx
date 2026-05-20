import { DateRangeFilter } from "@/app/admin/components/date-range-filter";

type Row = {
  month: string;
  total: number;
  m1to3: string;
  m4to6: string;
  m7to12: string;
  totalPct: string;
};

const ROWS: Row[] = [
  { month: "Jan",      total: 100, m1to3: "10%", m4to6: "20%", m7to12: "30%", totalPct: "60%" },
  { month: "Feb",      total: 50,  m1to3: "20%", m4to6: "30%", m7to12: "50%", totalPct: "100%" },
  { month: "March",    total: 70,  m1to3: "10%", m4to6: "20%", m7to12: "30%", totalPct: "60%" },
  { month: "April",    total: 100, m1to3: "20%", m4to6: "30%", m7to12: "50%", totalPct: "100%" },
  { month: "May",      total: 50,  m1to3: "10%", m4to6: "20%", m7to12: "30%", totalPct: "60%" },
  { month: "June",     total: 70,  m1to3: "20%", m4to6: "30%", m7to12: "50%", totalPct: "100%" },
  { month: "July",     total: 100, m1to3: "10%", m4to6: "20%", m7to12: "30%", totalPct: "60%" },
  { month: "August",   total: 50,  m1to3: "0%",  m4to6: "30%", m7to12: "50%", totalPct: "80%" },
  { month: "Sep",      total: 70,  m1to3: "10%", m4to6: "20%", m7to12: "30%", totalPct: "60%" },
  { month: "October",  total: 100, m1to3: "20%", m4to6: "30%", m7to12: "50%", totalPct: "100%" },
  { month: "November", total: 50,  m1to3: "10%", m4to6: "20%", m7to12: "30%", totalPct: "60%" },
  { month: "Dec",      total: 70,  m1to3: "20%", m4to6: "30%", m7to12: "50%", totalPct: "100%" },
];

export default function AdminRetentionPage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-rwst-stack)] text-3xl font-bold tracking-tight text-white">
            Subscribers Retention
          </h1>
          <p className="mt-1 text-sm text-white/55">Cohort Analysis</p>
        </div>
        <DateRangeFilter />
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
            {ROWS.map((r, i) => {
              const isLast = i === ROWS.length - 1;
              return (
                <tr key={i} className={isLast ? "border-b border-white/15" : ""}>
                  <td className="px-4 py-3 text-white/90">{r.month}</td>
                  <td className="px-2 py-1.5 text-center align-middle">
                    <div className="mx-auto flex h-11 w-32 items-center justify-center bg-coral font-semibold text-black">
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
