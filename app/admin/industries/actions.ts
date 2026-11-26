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
    revalidatePath("/"); // home hero lists industries ("Pick Industry" flyout)
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
  // Say exactly what is blocking the delete — podcasts reference industries too, and the old
  // message only mentioned videos (confusing when the Videos column showed 0).
  const usage = await prisma.industry.findUnique({
    where: { id },
    select: { _count: { select: { videos: true, podcasts: true } } },
  });
  if (usage) {
    const { videos, podcasts } = usage._count;
    if (videos > 0 || podcasts > 0) {
      const parts = [
        videos > 0 ? `${videos} video${videos === 1 ? "" : "s"}` : null,
        podcasts > 0 ? `${podcasts} podcast${podcasts === 1 ? "" : "s"}` : null,
      ].filter(Boolean);
      return {
        ok: false,
        error: `Cannot delete — still used by ${parts.join(" and ")}. Change their industry (Admin → Videos / Podcasts) first.`,
      };
    }
  }
  try {
    await prisma.industry.delete({ where: { id } });
    revalidatePath("/admin/industries");
    revalidatePath("/");
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
