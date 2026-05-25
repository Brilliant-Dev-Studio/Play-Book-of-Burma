import "server-only";

export const PLAN_PRICE_MMK = {
  SIX_MONTHS: 180_000,
  TWELVE_MONTHS: 360_000,
} as const;

export type PlanKey = keyof typeof PLAN_PRICE_MMK;

export const PLAN_LABEL: Record<PlanKey, string> = {
  SIX_MONTHS: "6 Months",
  TWELVE_MONTHS: "12 Months",
};

export function derivePlan(approvedAt: Date | null, expiresAt: Date | null): PlanKey {
  if (!approvedAt || !expiresAt) return "SIX_MONTHS";
  const days = (expiresAt.getTime() - approvedAt.getTime()) / 86_400_000;
  return days > 240 ? "TWELVE_MONTHS" : "SIX_MONTHS";
}

export function priceFor(plan: PlanKey): number {
  return PLAN_PRICE_MMK[plan];
}
