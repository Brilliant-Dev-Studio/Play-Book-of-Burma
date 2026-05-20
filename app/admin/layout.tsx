import { requireAdmin } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/app/admin/components/admin-sidebar";
import { AdminTopBar } from "@/app/admin/components/admin-top-bar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { email: true, displayName: true, photoUrl: true },
  });

  return (
    <div className="flex min-h-dvh bg-black text-white">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar
          user={{
            email: user?.email ?? session.email,
            displayName: user?.displayName ?? null,
            photoUrl: user?.photoUrl ?? null,
          }}
        />
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
