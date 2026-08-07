"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/auth-helpers";

export type PlanFormInput = {
  key: "SIX_MONTHS" | "TWELVE_MONTHS";
  name: string;
  months: number;
  priceMmk: number;
  perks: string[];
  featured: boolean;
  isActive: boolean;
};

function clean(input: PlanFormInput): PlanFormInput {
  return {
    ...input,
    name: input.name.trim(),
    perks: input.perks.map((p) => p.trim()).filter(Boolean),
  };
}

function validate(input: PlanFormInput): string[] {
  const errors: string[] = [];
  if (!input.name) errors.push("Name is required.");
  if (!Number.isInteger(input.months) || input.months <= 0)
    errors.push("Months must be a positive whole number.");
  if (!Number.isInteger(input.priceMmk) || input.priceMmk < 0)
    errors.push("Price must be a non-negative whole number.");
  return errors;
}

export async function savePlan(
  input: PlanFormInput,
): Promise<{ ok: true } | { ok: false; errors: string[] }> {
  await requireAdmin();

  const cleaned = clean(input);
  const errors = validate(cleaned);
  if (errors.length > 0) return { ok: false, errors };

  await prisma.plan.update({
    where: { key: cleaned.key },
    data: {
      name: cleaned.name,
      months: cleaned.months,
      priceMmk: cleaned.priceMmk,
      perks: cleaned.perks,
      featured: cleaned.featured,
      isActive: cleaned.isActive,
    },
  });

  revalidatePath("/admin/plans");
  revalidatePath("/membership");
  return { ok: true };
}
