import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/server/auth-helpers";

export default async function UserPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { mustChangePassword: true },
  });
  if (!user) redirect("/login");
  if (user.mustChangePassword) redirect("/change-password");

  return <>{children}</>;
}
