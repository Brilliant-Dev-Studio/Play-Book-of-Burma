"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/auth-helpers";
import { isAllowedKey } from "@/lib/server/s3";

export type InstructorFormInput = {
  id?: string;
  name: string;
  title: string;
  photoKey: string;
  biographyParagraphs: string[];
};

function clean(input: InstructorFormInput): InstructorFormInput {
  return {
    ...input,
    name: input.name.trim(),
    title: input.title.trim(),
    photoKey: input.photoKey.trim(),
    biographyParagraphs: input.biographyParagraphs
      .map((p) => p.trim())
      .filter(Boolean),
  };
}

function validate(input: InstructorFormInput): string[] {
  const errors: string[] = [];
  if (!input.name) errors.push("Name is required.");
  if (!input.title) errors.push("Title is required.");
  if (!input.photoKey || !isAllowedKey(input.photoKey))
    errors.push("Photo upload is required.");
  if (input.biographyParagraphs.length === 0)
    errors.push("At least one biography paragraph is required.");
  return errors;
}

export async function saveInstructor(
  input: InstructorFormInput,
): Promise<{ ok: true; id: string } | { ok: false; errors: string[] }> {
  await requireAdmin();

  const cleaned = clean(input);
  const errors = validate(cleaned);
  if (errors.length > 0) return { ok: false, errors };

  const data = {
    name: cleaned.name,
    title: cleaned.title,
    photoKey: cleaned.photoKey,
    biographyParagraphs: cleaned.biographyParagraphs,
  };

  let id = cleaned.id;
  if (id) {
    await prisma.instructor.update({ where: { id }, data });
  } else {
    const created = await prisma.instructor.create({ data });
    id = created.id;
  }

  revalidatePath("/admin/instructors");
  revalidatePath("/admin/videos/new");
  if (id) revalidatePath(`/admin/videos/${id}`);
  return { ok: true, id };
}
