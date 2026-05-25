"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/auth-helpers";
import { isAllowedKey } from "@/lib/server/s3";

type LessonInput = {
  title: string;
  videoKey: string;
  durationSeconds: number;
  durationLabel: string;
  details: string;
};
type SkillsetInput = { title: string; description: string; imageUrl: string };

export type VideoFormInput = {
  id?: string;
  type: "VIDEO" | "PODCAST";
  playbook: "CEO_PLAYBOOK";
  industry: "RETAILS" | "FMCG" | "TECHNOLOGY";
  skillset: "BUSINESS_FINANCE_STRATEGY";
  titleLine1: string;
  titleLine2?: string;
  description: string;
  instructorId: string;
  thumbnailKey: string;
  trailerKey?: string;
  guidebookUrl?: string;
  durationSeconds: number;
  durationLabel: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  lessons: LessonInput[];
  skillsetItems: SkillsetInput[];
};

function clean(input: VideoFormInput): VideoFormInput {
  return {
    ...input,
    titleLine1: input.titleLine1.trim(),
    titleLine2: input.titleLine2?.trim() || undefined,
    description: input.description.trim(),
    instructorId: input.instructorId.trim(),
    durationLabel: input.durationLabel.trim(),
    lessons: input.lessons
      .map((l) => ({
        title: l.title.trim(),
        videoKey: l.videoKey.trim(),
        durationSeconds: Number.isFinite(l.durationSeconds) ? l.durationSeconds : 0,
        durationLabel: l.durationLabel.trim(),
        details: l.details.trim(),
      }))
      .filter((l) => l.title),
    skillsetItems: input.skillsetItems
      .map((s) => ({
        title: s.title.trim(),
        description: s.description.trim(),
        imageUrl: s.imageUrl.trim(),
      }))
      .filter((s) => s.title),
  };
}

async function validate(input: VideoFormInput): Promise<string[]> {
  const errors: string[] = [];
  if (!input.titleLine1) errors.push("Title is required.");
  if (!input.instructorId) {
    errors.push("Instructor is required.");
  } else {
    const exists = await prisma.instructor.findUnique({
      where: { id: input.instructorId },
      select: { id: true },
    });
    if (!exists) errors.push("Selected instructor does not exist.");
  }
  if (!input.thumbnailKey || !isAllowedKey(input.thumbnailKey))
    errors.push("Thumbnail upload is required.");
  if (input.trailerKey && !isAllowedKey(input.trailerKey))
    errors.push("Trailer upload is invalid.");
  if (!input.durationLabel) errors.push("Duration label is required.");
  if (input.lessons.length === 0) {
    errors.push("At least one lesson is required.");
  } else {
    input.lessons.forEach((l, i) => {
      if (!l.videoKey || !isAllowedKey(l.videoKey)) {
        errors.push(`Lesson ${i + 1} is missing its video upload.`);
      }
    });
  }
  return errors;
}

export async function saveVideo(
  input: VideoFormInput,
  publish: boolean,
): Promise<{ ok: true; id: string } | { ok: false; errors: string[] }> {
  await requireAdmin();

  const cleaned = clean(input);
  const errors = await validate(cleaned);
  if (errors.length > 0) return { ok: false, errors };

  const status: "DRAFT" | "PUBLISHED" | "ARCHIVED" = publish ? "PUBLISHED" : cleaned.status;
  const publishedAt = status === "PUBLISHED" ? new Date() : null;

  const data = {
    type: cleaned.type,
    playbook: cleaned.playbook,
    industry: cleaned.industry,
    skillset: cleaned.skillset,
    titleLine1: cleaned.titleLine1,
    titleLine2: cleaned.titleLine2 ?? null,
    description: cleaned.description,
    instructorId: cleaned.instructorId,
    thumbnailKey: cleaned.thumbnailKey,
    trailerKey: cleaned.trailerKey?.trim() || null,
    guidebookUrl: cleaned.guidebookUrl?.trim() || null,
    durationSeconds: Number.isFinite(cleaned.durationSeconds) ? cleaned.durationSeconds : 0,
    durationLabel: cleaned.durationLabel,
    status,
    publishedAt,
  };

  let id = cleaned.id;
  if (id) {
    await prisma.$transaction([
      prisma.lesson.deleteMany({ where: { videoId: id } }),
      prisma.skillsetItem.deleteMany({ where: { videoId: id } }),
      prisma.video.update({
        where: { id },
        data: {
          ...data,
          lessons: { create: cleaned.lessons.map((l, i) => ({ ...l, order: i })) },
          skillsetItems: { create: cleaned.skillsetItems.map((s, i) => ({ ...s, order: i })) },
        },
      }),
    ]);
  } else {
    const created = await prisma.video.create({
      data: {
        ...data,
        lessons: { create: cleaned.lessons.map((l, i) => ({ ...l, order: i })) },
        skillsetItems: { create: cleaned.skillsetItems.map((s, i) => ({ ...s, order: i })) },
      },
    });
    id = created.id;
  }

  revalidatePath("/admin/videos");
  return { ok: true, id };
}

export async function deleteVideo(id: string) {
  await requireAdmin();
  await prisma.video.delete({ where: { id } });
  revalidatePath("/admin/videos");
  redirect("/admin/videos");
}
