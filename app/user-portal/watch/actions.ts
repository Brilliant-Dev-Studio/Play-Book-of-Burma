"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/server/auth-helpers";

export async function saveWatchProgress(
  lessonId: string,
  currentSeconds: number,
  durationSeconds: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();

  const cur = Math.max(0, Math.floor(currentSeconds || 0));
  const dur = Math.max(0, Math.floor(durationSeconds || 0));
  // Treat ≥ 95% of duration (or ≥ duration - 5s) as completed.
  const completed =
    dur > 0 && (cur >= dur - 5 || cur / dur >= 0.95);

  try {
    // Read the prior state so we only award on the transition to completed
    // (this action fires on every timeupdate near the end of a lesson).
    const existing = await prisma.watchProgress.findUnique({
      where: { userId_lessonId: { userId: session.uid, lessonId } },
      select: { completedAt: true },
    });

    await prisma.watchProgress.upsert({
      where: { userId_lessonId: { userId: session.uid, lessonId } },
      create: {
        userId: session.uid,
        lessonId,
        currentSeconds: cur,
        durationSeconds: dur,
        completedAt: completed ? new Date() : null,
      },
      update: {
        currentSeconds: cur,
        durationSeconds: dur,
        completedAt: completed ? new Date() : null,
        lastWatchedAt: new Date(),
      },
    });

    if (completed && !existing?.completedAt) {
      await maybeAwardPlaybook(session.uid, lessonId);
    }
    return { ok: true };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return { ok: false, error: "Lesson no longer exists." };
    }
    console.error("saveWatchProgress error:", err);
    return { ok: false, error: "Could not save progress." };
  }
}

/**
 * Award the playbook (course) when the user has completed ALL its lessons.
 * Idempotent via the unique (userId, videoId) constraint. Never throws — a
 * failure here must not break progress saving.
 */
async function maybeAwardPlaybook(userId: string, lessonId: string): Promise<void> {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        videoId: true,
        video: { select: { lessons: { select: { id: true } } } },
      },
    });
    if (!lesson) return;

    const lessonIds = lesson.video.lessons.map((l) => l.id);
    if (lessonIds.length === 0) return;

    const completedCount = await prisma.watchProgress.count({
      where: {
        userId,
        completedAt: { not: null },
        lessonId: { in: lessonIds },
      },
    });
    if (completedCount < lessonIds.length) return;

    await prisma.playbookAchievement.upsert({
      where: { userId_videoId: { userId, videoId: lesson.videoId } },
      create: { userId, videoId: lesson.videoId },
      update: {},
    });
    // TODO(email): once SES + domain are ready, send sendPlaybookAchievedEmail()
    // here and set emailSentAt on the achievement (guard on emailSentAt === null).
    revalidatePath("/user-portal/progress");
  } catch (err) {
    console.error("maybeAwardPlaybook error:", err);
  }
}

export async function saveNote(
  lessonId: string,
  content: string,
): Promise<{ ok: true; deleted: boolean } | { ok: false; error: string }> {
  const session = await requireSession();
  const trimmed = content.trim();

  try {
    if (trimmed === "") {
      await prisma.note.deleteMany({
        where: { userId: session.uid, lessonId },
      });
      revalidatePath("/user-portal/watch");
      revalidatePath("/user-portal/progress");
      return { ok: true, deleted: true };
    }

    await prisma.note.upsert({
      where: { userId_lessonId: { userId: session.uid, lessonId } },
      create: { userId: session.uid, lessonId, content: trimmed },
      update: { content: trimmed },
    });
    revalidatePath("/user-portal/watch");
    revalidatePath("/user-portal/progress");
    return { ok: true, deleted: false };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return { ok: false, error: "Lesson no longer exists." };
    }
    console.error("saveNote error:", err);
    return { ok: false, error: "Could not save note." };
  }
}

export async function toggleBookmark(
  lessonId: string,
): Promise<{ ok: true; bookmarked: boolean } | { ok: false; error: string }> {
  const session = await requireSession();

  try {
    const existing = await prisma.bookmark.findUnique({
      where: { userId_lessonId: { userId: session.uid, lessonId } },
      select: { id: true },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      revalidatePath("/user-portal/watch");
      return { ok: true, bookmarked: false };
    }

    await prisma.bookmark.create({
      data: { userId: session.uid, lessonId },
    });
    revalidatePath("/user-portal/watch");
    return { ok: true, bookmarked: true };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return { ok: false, error: "Lesson no longer exists." };
    }
    console.error("toggleBookmark error:", err);
    return { ok: false, error: "Could not update bookmark." };
  }
}
