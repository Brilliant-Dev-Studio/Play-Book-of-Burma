import "server-only";

export const PLAN_DAYS = { SIX_MONTHS: 182, TWELVE_MONTHS: 365 } as const;

export type Plan = keyof typeof PLAN_DAYS;

export function computeExpiresAt(plan: Plan, from: Date = new Date()): Date {
  return new Date(from.getTime() + PLAN_DAYS[plan] * 86_400_000);
}
