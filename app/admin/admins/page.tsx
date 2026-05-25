import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminsTable } from "@/app/admin/components/admins-table";

export default async function AdminAdminsPage() {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      displayName: true,
      createdAt: true,
    },
  });

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-rwst-stack)] text-3xl font-bold tracking-tight text-white">
            Admins
          </h1>
          <p className="mt-1 text-sm text-white/55">
            Staff accounts with admin access.
          </p>
        </div>
        <Link
          href="/admin/admins/new"
          className="rounded-md bg-coral px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-coral/90"
        >
          + New Admin
        </Link>
      </div>

      <AdminsTable
        admins={admins.map((a) => ({
          ...a,
          createdAt: a.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
