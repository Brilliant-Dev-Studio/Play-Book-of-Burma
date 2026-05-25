"use client";

export type AdminRow = {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
};

export function AdminsTable({ admins }: { admins: AdminRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/15 bg-black">
      <table className="w-full min-w-[600px] text-sm">
        <thead>
          <tr className="bg-coral text-black">
            <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Email</th>
            <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Name</th>
            <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Created</th>
          </tr>
        </thead>
        <tbody>
          {admins.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-12 text-center text-white/50">
                No admins yet.
              </td>
            </tr>
          )}
          {admins.map((a) => (
            <tr key={a.id} className="border-t border-white/10 text-white/90">
              <td className="px-4 py-3">{a.email}</td>
              <td className="px-4 py-3 text-white/80">{a.displayName ?? "—"}</td>
              <td className="px-4 py-3 whitespace-nowrap text-white/65">
                {new Date(a.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
