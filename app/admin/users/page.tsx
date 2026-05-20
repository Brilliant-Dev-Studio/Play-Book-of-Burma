import { prisma } from "@/lib/prisma";
import { CreateUserForm } from "@/app/admin/components/create-user-form";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      mustChangePassword: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-rwst-stack)] text-3xl font-bold tracking-tight text-white">
          Users
        </h1>
        <p className="mt-1 text-sm text-white/55">
          Provision accounts and review subscriber status.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-white/70">
                <tr>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-white/50">
                      No users yet.
                    </td>
                  </tr>
                )}
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-white/5">
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3 text-white/80">{u.displayName ?? "—"}</td>
                    <td className="px-4 py-3">{u.role}</td>
                    <td className="px-4 py-3">
                      {u.mustChangePassword ? (
                        <span className="rounded-full bg-butter/20 px-2 py-0.5 text-xs text-butter">
                          Pending password change
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {u.createdAt.toISOString().slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <aside>
          <CreateUserForm />
        </aside>
      </div>
    </div>
  );
}
