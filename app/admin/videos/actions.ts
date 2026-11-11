"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/auth-helpers";
import { isAllowedKey } from "@/lib/server/s3";
import { getJobStatus, plannedRenditionKeys, submitTranscodeJob } from "@/lib/server/mediaconvert";

type LessonInput = {
  /** Client-generated (crypto.randomUUID()) for a new row, the real DB id when editing — lets
   * saveVideo() tell "same lesson, video re-uploaded" apart from "lesson removed + different one added",
   * instead of nuking every lesson (and the bookmarks/notes/progress cascaded from them) on every edit. */
  id: string;
  title: string;
  videoKey: string;
  durationSeconds: number;
  durationLabel: string;
  details: string;
  /** Source video's vertical resolution in px, when known (probed client-side at upload time). */
  sourceHeightPx?: number | null;
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
  sidebarTitle?: string;
  sidebarDescription?: string;
  instructorId: string;
  thumbnailKey: string;
  heroImageKey?: string;
  trailerKey?: string;
  trailerThumbnailKey?: string;
  guidebookKey?: string;
  guidebookCoverKey?: string;
  guidebookDescription?: string;
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
    sidebarTitle: input.sidebarTitle?.trim() || undefined,
    sidebarDescription: input.sidebarDescription?.trim() || undefined,
    guidebookDescription: input.guidebookDescription?.trim() || undefined,
    instructorId: input.instructorId.trim(),
    industryId: input.industryId.trim(),
    skillsetId: input.skillsetId.trim(),
    durationLabel: input.durationLabel.trim(),
    lessons: input.lessons
      .map((l) => ({
        id: l.id,
        title: l.title.trim(),
        videoKey: l.videoKey.trim(),
        durationSeconds: Number.isFinite(l.durationSeconds) ? l.durationSeconds : 0,
        durationLabel: l.durationLabel.trim(),
        details: l.details.trim(),
        sourceHeightPx: l.sourceHeightPx ?? null,
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
  if (input.heroImageKey && !isAllowedKey(input.heroImageKey))
    errors.push("Hero image upload is invalid.");
  if (input.trailerKey && !isAllowedKey(input.trailerKey))
    errors.push("Trailer upload is invalid.");
  if (input.trailerThumbnailKey && !isAllowedKey(input.trailerThumbnailKey))
    errors.push("Trailer thumbnail upload is invalid.");
  if (input.guidebookKey && !isAllowedKey(input.guidebookKey))
    errors.push("Guidebook upload is invalid.");
  if (input.guidebookCoverKey && !isAllowedKey(input.guidebookCoverKey))
    errors.push("Guidebook cover image upload is invalid.");
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
    sidebarTitle: cleaned.sidebarTitle?.trim() || null,
    sidebarDescription: cleaned.sidebarDescription?.trim() || null,
    instructorId: cleaned.instructorId,
    thumbnailKey: cleaned.thumbnailKey,
    heroImageKey: cleaned.heroImageKey?.trim() || null,
    trailerKey: cleaned.trailerKey?.trim() || null,
    trailerThumbnailKey: cleaned.trailerThumbnailKey?.trim() || null,
    guidebookKey: cleaned.guidebookKey?.trim() || null,
    guidebookCoverKey: cleaned.guidebookCoverKey?.trim() || null,
    guidebookDescription: cleaned.guidebookDescription?.trim() || null,
    durationSeconds: Number.isFinite(cleaned.durationSeconds) ? cleaned.durationSeconds : 0,
    durationLabel: cleaned.durationLabel,
    status,
    publishedAt,
  };

  let id = cleaned.id;
  // Lessons whose video is new or changed — queued for transcode submission
  // after the DB write succeeds (kept outside the transaction below: CreateJob
  // is an external network call, and a DB transaction shouldn't sit open
  // across one).
  const transcodeTargets: { lessonId: string; videoKey: string; sourceHeightPx: number | null }[] = [];

  try {
    if (id) {
      const existingLessons = await prisma.lesson.findMany({
        where: { videoId: id },
        select: { id: true, videoKey: true },
      });
      const existingById = new Map(existingLessons.map((l) => [l.id, l] as const));
      const keptIds = cleaned.lessons.map((l) => l.id);

      await prisma.$transaction([
        prisma.video.update({
          where: { id },
          data: {
            ...data,
            skillsetItems: {
              deleteMany: {},
              create: cleaned.skillsetItems.map((s, i) => ({ ...s, order: i })),
            },
          },
        }),
        // Only drop lessons the admin actually removed from the form — not
        // every lesson on every save. Cascades Bookmark/Note/WatchProgress
        // only for rows genuinely gone, not for an unrelated metadata edit.
        prisma.lesson.deleteMany({ where: { videoId: id, id: { notIn: keptIds } } }),
        ...cleaned.lessons.map((l, i) => {
          const existing = existingById.get(l.id);
          const videoKeyChanged = !existing || existing.videoKey !== l.videoKey;
          const lessonData = {
            title: l.title,
            videoKey: l.videoKey,
            durationSeconds: l.durationSeconds,
            durationLabel: l.durationLabel,
            details: l.details,
            order: i,
          };
          return prisma.lesson.upsert({
            where: { id: l.id },
            create: { id: l.id, videoId: id!, ...lessonData, sourceHeightPx: l.sourceHeightPx },
            update: {
              ...lessonData,
              ...(videoKeyChanged
                ? {
                    sourceHeightPx: l.sourceHeightPx,
                    transcodeStatus: "PENDING" as const,
                    transcodeJobId: null,
                    transcodeError: null,
                    renditions: { deleteMany: {} },
                  }
                : {}),
            },
          });
        }),
      ]);

      cleaned.lessons.forEach((l) => {
        const existing = existingById.get(l.id);
        if (!existing || existing.videoKey !== l.videoKey) {
          transcodeTargets.push({ lessonId: l.id, videoKey: l.videoKey, sourceHeightPx: l.sourceHeightPx ?? null });
        }
      });
    } else {
      const created = await prisma.video.create({
        data: {
          ...data,
          lessons: {
            create: cleaned.lessons.map((l, i) => ({
              id: l.id,
              title: l.title,
              videoKey: l.videoKey,
              durationSeconds: l.durationSeconds,
              durationLabel: l.durationLabel,
              details: l.details,
              order: i,
              sourceHeightPx: l.sourceHeightPx,
            })),
          },
          skillsetItems: { create: cleaned.skillsetItems.map((s, i) => ({ ...s, order: i })) },
        },
      });
      id = created.id;
      cleaned.lessons.forEach((l) =>
        transcodeTargets.push({ lessonId: l.id, videoKey: l.videoKey, sourceHeightPx: l.sourceHeightPx ?? null }),
      );
    }
  } catch (err) {
    console.error("saveVideo persistence error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, errors: [`Could not save video: ${message}`] };
  }

  for (const target of transcodeTargets) {
    try {
      const jobId = await submitTranscodeJob(target.lessonId, target.videoKey, target.sourceHeightPx);
      const planned = plannedRenditionKeys(target.videoKey, target.sourceHeightPx);
      await prisma.$transaction([
        prisma.lesson.update({
          where: { id: target.lessonId },
          data: { transcodeStatus: "PROCESSING", transcodeJobId: jobId, transcodeError: null },
        }),
        ...planned.map((p) =>
          prisma.lessonRendition.upsert({
            where: { lessonId_quality: { lessonId: target.lessonId, quality: p.quality } },
            create: { lessonId: target.lessonId, quality: p.quality, videoKey: p.key, status: "PROCESSING" },
            update: { videoKey: p.key, status: "PROCESSING" },
          }),
        ),
      ]);
    } catch (err) {
      console.error(`Transcode submission failed for lesson ${target.lessonId}:`, err);
      await prisma.lesson
        .update({
          where: { id: target.lessonId },
          data: {
            transcodeStatus: "FAILED",
            transcodeError: err instanceof Error ? err.message : String(err),
          },
        })
        .catch(() => {});
    }
  }

  revalidatePath("/admin/videos");
  return { ok: true, id };
}

export async function retryTranscode(
  lessonId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, videoId: true, videoKey: true, sourceHeightPx: true },
  });
  if (!lesson) return { ok: false, error: "Lesson not found." };

  try {
    const jobId = await submitTranscodeJob(lesson.id, lesson.videoKey, lesson.sourceHeightPx);
    const planned = plannedRenditionKeys(lesson.videoKey, lesson.sourceHeightPx);
    await prisma.$transaction([
      prisma.lesson.update({
        where: { id: lesson.id },
        data: { transcodeStatus: "PROCESSING", transcodeJobId: jobId, transcodeError: null },
      }),
      ...planned.map((p) =>
        prisma.lessonRendition.upsert({
          where: { lessonId_quality: { lessonId: lesson.id, quality: p.quality } },
          create: { lessonId: lesson.id, quality: p.quality, videoKey: p.key, status: "PROCESSING" },
          update: { videoKey: p.key, status: "PROCESSING" },
        }),
      ),
    ]);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.lesson
      .update({ where: { id: lesson.id }, data: { transcodeStatus: "FAILED", transcodeError: message } })
      .catch(() => {});
    return { ok: false, error: message };
  }

  revalidatePath(`/admin/videos/${lesson.videoId}`);
  return { ok: true };
}

export async function syncTranscodeStatus(
  lessonId: string,
): Promise<{ ok: true; status: string } | { ok: false; error: string }> {
  await requireAdmin();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, videoId: true, transcodeJobId: true, transcodeStatus: true },
  });
  if (!lesson) return { ok: false, error: "Lesson not found." };
  if (!lesson.transcodeJobId) return { ok: false, error: "No transcode job submitted for this lesson." };

  try {
    const job = await getJobStatus(lesson.transcodeJobId);
    if (job.status === "COMPLETE") {
      await prisma.$transaction([
        prisma.lesson.update({ where: { id: lesson.id }, data: { transcodeStatus: "READY" } }),
        prisma.lessonRendition.updateMany({ where: { lessonId: lesson.id }, data: { status: "READY" } }),
      ]);
      revalidatePath(`/admin/videos/${lesson.videoId}`);
      return { ok: true, status: "READY" };
    }
    if (job.status === "ERROR" || job.status === "CANCELED") {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { transcodeStatus: "FAILED", transcodeError: job.errorMessage ?? job.status },
      });
      revalidatePath(`/admin/videos/${lesson.videoId}`);
      return { ok: true, status: "FAILED" };
    }
    return { ok: true, status: lesson.transcodeStatus };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function deleteVideo(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    await prisma.video.delete({ where: { id } });
    revalidatePath("/admin/videos");
    return { ok: true };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return { ok: false, error: `Could not delete video (${err.code}).` };
    }
    return { ok: false, error: "Could not delete video." };
  }
}
