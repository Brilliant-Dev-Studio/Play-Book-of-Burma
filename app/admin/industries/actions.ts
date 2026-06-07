"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/auth-helpers";

export type IndustryFormInput = { id?: string; name: string; order?: number };

type Result =
  | { ok: true; id: string }
  | { ok: false; errors: string[] };

export async function saveIndustry(input: IndustryFormInput): Promise<Result> {
  await requireAdmin();
  const name = input.name.trim();
  const order = Number.isFinite(input.order) ? Number(input.order) : 0;

  const errors: string[] = [];
  if (!name) errors.push("Name is required.");
  if (errors.length) return { ok: false, errors };

  try {
    const row = input.id
      ? await prisma.industry.update({
          where: { id: input.id },
          data: { name, order },
          select: { id: true },
        })
      : await prisma.industry.create({
          data: { name, order },
          select: { id: true },
        });

    revalidatePath("/admin/industries");
    revalidatePath("/admin/videos/new");
    return { ok: true, id: row.id };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { ok: false, errors: [`"${name}" already exists.`] };
    }
    console.error("saveIndustry error:", err);
    return { ok: false, errors: ["Could not save industry."] };
  }
}

export async function deleteIndustry(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    await prisma.industry.delete({ where: { id } });
    revalidatePath("/admin/industries");
    return { ok: true };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return {
        ok: false,
        error: "Cannot delete — some videos still reference this industry.",
      };
    }
    console.error("deleteIndustry error:", err);
    return { ok: false, error: "Could not delete industry." };
  }
}
