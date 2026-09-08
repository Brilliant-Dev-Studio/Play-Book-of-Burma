import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
  }

  const m = await prisma.membership.findUnique({
    where: { userId: session.uid },
    select: {
      status: true,
      plan: true,
      paymentMethod: true,
      amountMmk: true,
      approvedAt: true,
      expiresAt: true,
    },
  });

  if (!m) {
    return NextResponse.json({ membership: null });
  }

  const isActive =
    m.status === "APPROVED" && (!m.expiresAt || m.expiresAt >= new Date());

  const planLabel =
    m.plan === "SIX_MONTHS" ? "6 Months" : m.plan === "TWELVE_MONTHS" ? "12 Months" : null;

  return NextResponse.json({
    membership: {
      status: m.status,
      plan: m.plan,
      planLabel,
      paymentMethod: m.paymentMethod,
      amountMmk: m.amountMmk,
      approvedAt: m.approvedAt?.toISOString() ?? null,
      expiresAt: m.expiresAt?.toISOString() ?? null,
      // Convenience aliases matching the "Membership Plan" screen directly —
      // startAt/closeAt are the same values as approvedAt/expiresAt.
      startAt: m.approvedAt?.toISOString() ?? null,
      closeAt: m.expiresAt?.toISOString() ?? null,
      isActive,
    },
  });
}
