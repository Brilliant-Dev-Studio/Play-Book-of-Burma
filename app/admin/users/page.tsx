import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { UsersTable } from "@/app/admin/components/users-table";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      displayName: true,
      isActive: true,
      createdAt: true,
      membership: {
        select: { status: true, plan: true, expiresAt: true },
      },
    },
  });

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-rwst-stack)] text-3xl font-bold tracking-tight text-white">
            Users
          </h1>
          <p className="mt-1 text-sm text-white/55">
            Subscriber accounts with membership status.
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="rounded-md bg-coral px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-coral/90"
        >
          + New User
        </Link>
      </div>

      <UsersTable
        users={users.map((u) => ({
          id: u.id,
          email: u.email,
          displayName: u.displayName,
          isActive: u.isActive,
          createdAt: u.createdAt.toISOString(),
          membership: u.membership
            ? {
                status: u.membership.status,
                plan: u.membership.plan,
                expiresAt: u.membership.expiresAt
                  ? u.membership.expiresAt.toISOString()
                  : null,
              }
            : null,
        }))}
      />
    </div>
  );
}
