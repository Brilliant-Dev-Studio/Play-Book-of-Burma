import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public, unauthenticated plan catalog — same data + ordering as the
// "Choose Monthly Membership" page (app/membership/page.tsx), which reads
// prisma.plan directly since it's a server component. This route exposes
// the identical data for the mobile app's pricing screen.
export async function GET() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      key: true,
      name: true,
      months: true,
      priceMmk: true,
      perks: true,
      featured: true,
    },
  });

  return NextResponse.json({ plans });
}
