import Link from "next/link";

export type RecentSubscriber = {
  id: string;
  code: string;
  username: string;
  email: string;
  phone: string;
  type: string;
  price: string;
  status: "Approval" | "Active" | "Expired" | "Rejected";
  startsAt: string | null;
  endsAt: string | null;
};

const HEADERS = [
  "ID Number",
  "Username",
  "Email",
  "Phone Number",
  "Subscribers Type",
  "Price (MMK)",
  "Status",
  "Starting Date, Time",
  "Ending Date, Time",
];

const STATUS_STYLE: Record<RecentSubscriber["status"], string> = {
  Approval: "bg-sky-200 text-sky-900",
  Active: "bg-emerald-200 text-emerald-900",
  Expired: "bg-white/15 text-white/70",
  Rejected: "bg-red-200 text-red-900",
};

export function RecentSubscribersTable({ rows }: { rows: RecentSubscriber[] }) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-white">Recent Subscribers</h2>
        <Link
          href="/admin/subscribers"
          className="text-sm font-semibold text-white transition-colors hover:text-coral"
        >
          View All
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/15 bg-black">
        <table className="w-full min-w-[1100px] text-sm">
          <thead>
            <tr className="bg-coral text-black">
              {HEADERS.map((h) => (
                <th key={h} className="px-4 py-3 text-left font-bold whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={HEADERS.length} className="px-4 py-10 text-center text-white/50">
                  No subscribers yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-white/10 text-white/90">
                  <td className="px-4 py-4 whitespace-nowrap">{r.code}</td>
                  <td className="px-4 py-4">{r.username}</td>
                  <td className="px-4 py-4">{r.email}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{r.phone}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{r.type}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{r.price}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block min-w-[96px] rounded-md px-3 py-1.5 text-center text-xs font-bold ${STATUS_STYLE[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">{r.startsAt ?? "—"}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{r.endsAt ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
