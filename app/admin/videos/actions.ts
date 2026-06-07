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
type SkillsetInput = { title: string; description: string; imageKey: string };

export type VideoFormInput = {
  id?: string;
  type: "VIDEO" | "PODCAST";
  playbook: "CEO_PLAYBOOK";
  industryId: string;
  skillsetId: string;
  titleLine1: string;
  titleLine2?: string;
  description: string;
  instructorId: string;
  thumbnailKey: string;
  trailerKey?: string;
  guidebookKey?: string;
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
    industryId: input.industryId.trim(),
    skillsetId: input.skillsetId.trim(),
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
        imageKey: s.imageKey.trim(),
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
  if (!input.industryId) {
    errors.push("Industry is required.");
  } else {
    const exists = await prisma.industry.findUnique({
      where: { id: input.industryId },
      select: { id: true },
    });
    if (!exists) errors.push("Selected industry does not exist.");
  }
  if (!input.skillsetId) {
    errors.push("Skillset is required.");
  } else {
    const exists = await prisma.skillset.findUnique({
      where: { id: input.skillsetId },
      select: { id: true },
    });
    if (!exists) errors.push("Selected skillset does not exist.");
  }
  if (!input.thumbnailKey || !isAllowedKey(input.thumbnailKey))
    errors.push("Thumbnail upload is required.");
  if (input.trailerKey && !isAllowedKey(input.trailerKey))
    errors.push("Trailer upload is invalid.");
  if (input.guidebookKey && !isAllowedKey(input.guidebookKey))
    errors.push("Guidebook upload is invalid.");
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
  input.skillsetItems.forEach((s, i) => {
    if (!s.imageKey || !isAllowedKey(s.imageKey)) {
      errors.push(`Skillset ${i + 1} is missing its image upload.`);
    }
  });
  return errors;
}

export async function saveVideo(
  input: VideoFormInput,
  _publish?: boolean,
): Promise<{ ok: true; id: string } | { ok: false; errors: string[] }> {
  await requireAdmin();

  const cleaned = clean(input);
  const errors = await validate(cleaned);
  if (errors.length > 0) return { ok: false, errors };

  // All videos are published immediately — admin no longer chooses a draft state.
  const status: "DRAFT" | "PUBLISHED" | "ARCHIVED" = "PUBLISHED";
  const publishedAt = new Date();

  const data = {
    type: cleaned.type,
    playbook: cleaned.playbook,
    industryId: cleaned.industryId,
    skillsetId: cleaned.skillsetId,
    titleLine1: cleaned.titleLine1,
    titleLine2: cleaned.titleLine2 ?? null,
    description: cleaned.description,
    instructorId: cleaned.instructorId,
    thumbnailKey: cleaned.thumbnailKey,
    trailerKey: cleaned.trailerKey?.trim() || null,
    guidebookKey: cleaned.guidebookKey?.trim() || null,
    durationSeconds: Number.isFinite(cleaned.durationSeconds) ? cleaned.durationSeconds : 0,
    durationLabel: cleaned.durationLabel,
    status,
    publishedAt,
  };

  let id = cleaned.id;
  try {
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
  } catch (err) {
    console.error("saveVideo persistence error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, errors: [`Could not save video: ${message}`] };
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
