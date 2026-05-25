import "server-only";
import { prisma } from "@/lib/prisma";
import { PLAN_LABEL, type PlanKey } from "@/lib/server/pricing";

export type StatPoint = {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  direction?: "up" | "down";
};

export type DashboardData = {
  range: { from: string; to: string; days: number };
  actionRequired: StatPoint[];
  traffic: StatPoint[];
  revenue: StatPoint[];
  chart: { month: string; total: number; sixMonths: number; twelveMonths: number }[];
  recent: {
    id: string;
    code: string;
    username: string;
    email: string;
    phone: string;
    type: string;
    price: string;
    status: "Approval" | "Active" | "Expired" | "Rejected";
    startsAt: string | null;
    endsAt: string | null;
  }[];
};

function pctDelta(current: number, previous: number): { delta: string; direction: "up" | "down" } {
  if (previous === 0) {
    if (current === 0) return { delta: "0 %", direction: "up" };
    return { delta: "100 %", direction: "up" };
  }
  const pct = ((current - previous) / previous) * 100;
  return {
    delta: `${Math.abs(pct).toFixed(pct % 1 === 0 ? 0 : 1)} %`,
    direction: pct >= 0 ? "up" : "down",
  };
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function formatDateTime(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function shortMonth(d: Date): string {
  return d.toLocaleString("en-US", { month: "short" });
}

function membershipCode(id: string, createdAt: Date): string {
  return `#POB-${createdAt.getFullYear()}-${id.slice(-4).toUpperCase()}`;
}

export async function getDashboardData(days: number): Promise<DashboardData> {
  const now = new Date();
  const from = new Date(now.getTime() - days * 86_400_000);
  const prevFrom = new Date(from.getTime() - days * 86_400_000);

  const [
    approvedInRange,
    approvedPrevRange,
    pendingNow,
    pendingPrev,
    chartRowsRaw,
    recentRaw,
  ] = await Promise.all([
    prisma.membership.findMany({
      where: { status: "APPROVED", approvedAt: { gte: from, lte: now } },
      select: { approvedAt: true, expiresAt: true, createdAt: true, plan: true, amountMmk: true },
    }),
    prisma.membership.findMany({
      where: { status: "APPROVED", approvedAt: { gte: prevFrom, lt: from } },
      select: { approvedAt: true, expiresAt: true, createdAt: true, plan: true, amountMmk: true },
    }),
    prisma.membershipSubmission.count({ where: { status: "PENDING" } }),
    prisma.membershipSubmission.count({
      where: { status: "PENDING", createdAt: { lt: from } },
    }),
    prisma.membership.findMany({
      where: {
        status: "APPROVED",
        approvedAt: { gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) },
      },
      select: { approvedAt: true, plan: true },
    }),
    prisma.membership.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        approvedAt: true,
        expiresAt: true,
        createdAt: true,
        plan: true,
        amountMmk: true,
        user: { select: { displayName: true, email: true, phone: true } },
      },
    }),
  ]);

  // Approval time from MembershipSubmission (createdAt → reviewedAt for APPROVED)
  const [approvalTimeRows, approvalTimeRowsPrev] = await Promise.all([
    prisma.membershipSubmission.findMany({
      where: { status: "APPROVED", reviewedAt: { gte: from, lte: now } },
      select: { createdAt: true, reviewedAt: true },
    }),
    prisma.membershipSubmission.findMany({
      where: { status: "APPROVED", reviewedAt: { gte: prevFrom, lt: from } },
      select: { createdAt: true, reviewedAt: true },
    }),
  ]);

  const newCount = approvedInRange.length;
  const newPrevCount = approvedPrevRange.length;
  const newDelta = pctDelta(newCount, newPrevCount);

  const pendingDelta = pctDelta(pendingNow, pendingPrev);

  const avgDays = (rows: { createdAt: Date; reviewedAt: Date | null }[]) => {
    if (rows.length === 0) return 0;
    const sum = rows.reduce((acc, r) => {
      if (!r.reviewedAt) return acc;
      return acc + (r.reviewedAt.getTime() - r.createdAt.getTime()) / 86_400_000;
    }, 0);
    return sum / rows.length;
  };
  const avgApproval = avgDays(approvalTimeRows);
  const avgApprovalPrev = avgDays(approvalTimeRowsPrev);
  const approvalDelta = pctDelta(avgApproval, avgApprovalPrev);

  const revInRange = approvedInRange.reduce((s, m) => s + m.amountMmk, 0);
  const revPrevRange = approvedPrevRange.reduce((s, m) => s + m.amountMmk, 0);
  const revDelta = pctDelta(revInRange, revPrevRange);
  const revPerCust = newCount === 0 ? 0 : Math.round(revInRange / newCount);
  const revPerCustPrev = newPrevCount === 0 ? 0 : Math.round(revPrevRange / newPrevCount);
  const revPerCustDelta = pctDelta(revPerCust, revPerCustPrev);

  const months: { key: string; label: string; date: Date }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: shortMonth(d), date: d });
  }
  const chart = months.map((m) => {
    const nextMonth = new Date(m.date.getFullYear(), m.date.getMonth() + 1, 1);
    const rows = chartRowsRaw.filter(
      (r) => r.approvedAt && r.approvedAt >= m.date && r.approvedAt < nextMonth,
    );
    const six = rows.filter((r) => r.plan === "SIX_MONTHS").length;
    const twelve = rows.filter((r) => r.plan === "TWELVE_MONTHS").length;
    return { month: m.label, total: rows.length, sixMonths: six, twelveMonths: twelve };
  });

  const recent = recentRaw.map((r) => {
    const plan: PlanKey = r.plan === "TWELVE_MONTHS" ? "TWELVE_MONTHS" : "SIX_MONTHS";
    const status: "Approval" | "Active" | "Expired" | "Rejected" =
      r.status === "PENDING"
        ? "Approval"
        : r.status === "APPROVED"
          ? "Active"
          : r.status === "EXPIRED"
            ? "Expired"
            : "Rejected";
    return {
      id: r.id,
      code: membershipCode(r.id, r.createdAt),
      username: r.user.displayName ?? r.user.email.split("@")[0],
      email: r.user.email,
      phone: r.user.phone ?? "—",
      type: PLAN_LABEL[plan],
      price: formatNumber(r.amountMmk),
      status,
      startsAt: formatDateTime(r.approvedAt),
      endsAt: formatDateTime(r.expiresAt),
    };
  });

  return {
    range: { from: from.toISOString(), to: now.toISOString(), days },
    actionRequired: [
      { label: "New Subscribers", value: formatNumber(newCount), delta: newDelta.delta, direction: newDelta.direction },
      { label: "Approval Pending", value: formatNumber(pendingNow), delta: pendingDelta.delta, direction: pendingDelta.direction },
      {
        label: "Approval Time / Subscriber",
        value: avgApproval.toFixed(1),
        unit: "days",
        delta: approvalDelta.delta,
        direction: approvalDelta.direction,
      },
    ],
    traffic: [
      { label: "All Unique Visitors", value: "—" },
      { label: "Visitors on Membership Page", value: "—" },
      { label: "Conversion to Subscribers", value: "—", unit: "%" },
    ],
    revenue: [
      { label: "Total Revenue", value: formatNumber(revInRange), unit: "MMK", delta: revDelta.delta, direction: revDelta.direction },
      { label: "No. of Subscribers", value: formatNumber(newCount), delta: newDelta.delta, direction: newDelta.direction },
      { label: "Revenue / Customer", value: formatNumber(revPerCust), unit: "MMK", delta: revPerCustDelta.delta, direction: revPerCustDelta.direction },
    ],
    chart,
    recent,
  };
}
