import Link from "next/link";

type Subscriber = {
  id: string;
  username: string;
  email: string;
  phone: string;
  type: string;
  price: string;
  status: "Approval" | "Active" | "Expired";
  startsAt: string;
  endsAt: string;
};

const ROWS: Subscriber[] = [
  {
    id: "#POB-2026-12",
    username: "Leon",
    email: "leon@gmai.com",
    phone: "09763600983",
    type: "6 Months",
    price: "100,000",
    status: "Approval",
    startsAt: "May 12, 2026, 6:00 p.m",
    endsAt: "May 12, 2026, 6:00 p.m",
  },
  {
    id: "#POB-2026-12",
    username: "Leon",
    email: "leon@gmai.com",
    phone: "09763600983",
    type: "6 Months",
    price: "100,000",
    status: "Approval",
    startsAt: "May 12, 2026, 6:00 p.m",
    endsAt: "May 12, 2026, 6:00 p.m",
  },
  {
    id: "#POB-2026-12",
    username: "Leon",
    email: "leon@gmai.com",
    phone: "09763600983",
    type: "6 Months",
    price: "100,000",
    status: "Approval",
    startsAt: "May 12, 2026, 6:00 p.m",
    endsAt: "May 12, 2026, 6:00 p.m",
  },
  {
    id: "#POB-2026-12",
    username: "Leon",
    email: "leon@gmai.com",
    phone: "09763600983",
    type: "6 Months",
    price: "100,000",
    status: "Approval",
    startsAt: "May 12, 2026, 6:00 p.m",
    endsAt: "May 12, 2026, 6:00 p.m",
  },
];

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

export function RecentSubscribersTable() {
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
            {ROWS.map((r, i) => (
              <tr key={i} className="border-t border-white/10 text-white/90">
                <td className="px-4 py-4 whitespace-nowrap">{r.id}</td>
                <td className="px-4 py-4">{r.username}</td>
                <td className="px-4 py-4">{r.email}</td>
                <td className="px-4 py-4 whitespace-nowrap">{r.phone}</td>
                <td className="px-4 py-4 whitespace-nowrap">{r.type}</td>
                <td className="px-4 py-4 whitespace-nowrap">{r.price}</td>
                <td className="px-4 py-4">
                  <span className="inline-block min-w-[96px] rounded-md bg-sky-200 px-3 py-1.5 text-center text-xs font-bold text-sky-900">
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">{r.startsAt}</td>
                <td className="px-4 py-4 whitespace-nowrap">{r.endsAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
