import { prisma } from "@/lib/prisma";
import { ExpiringTable } from "@/app/admin/components/expiring-table";

export default async function ExpiringPage() {
  // Fetch all approved memberships expiring within the next 60 days
  const cutoff = new Date(Date.now() + 60 * 86_400_000);

  const memberships = await prisma.membership.findMany({
    where: {
      status: "APPROVED",
      expiresAt: { lte: cutoff },
    },
    orderBy: { expiresAt: "asc" },
    select: {
      plan: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          isActive: true,
        },
      },
    },
  });

  const rows = memberships
    .filter((m) => m.expiresAt !== null)
    .map((m) => ({
      userId: m.user.id,
      email: m.user.email,
      displayName: m.user.displayName,
      plan: m.plan,
      expiresAt: m.expiresAt!.toISOString(),
      isActive: m.user.isActive,
    }));

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-rwst-stack)] text-3xl font-bold tracking-tight text-white">
          Expiring Soon
        </h1>
        <p className="mt-1 text-sm text-white/55">
          Subscribers whose plans are about to expire. Filter by time window below.
        </p>
      </div>

      <ExpiringTable rows={rows} />
    </div>
  );
}
