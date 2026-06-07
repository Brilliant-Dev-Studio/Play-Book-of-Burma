import { prisma } from "@/lib/prisma";
import { presignGetUrl, PRESIGN_TTL } from "@/lib/server/s3";
import { requireSession } from "@/lib/server/auth-helpers";
import {
  ProgressClient,
  type BookmarkItem,
  type ContinueWatchingItem,
  type NoteItemData,
  type PlaybookAchievedItem,
} from "./progress-client";

export default async function ProgressPage() {
  const session = await requireSession();

  const [bookmarkRows, noteRows, progressRows, achievedRows] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId: session.uid },
      orderBy: { createdAt: "desc" },
      select: {
        lessonId: true,
        lesson: {
          select: {
            order: true,
            durationLabel: true,
            video: {
              select: {
                id: true,
                titleLine1: true,
                thumbnailKey: true,
                instructor: { select: { name: true } },
                lessons: { select: { id: true } },
              },
            },
          },
        },
      },
    }),
    prisma.note.findMany({
      where: { userId: session.uid },
      orderBy: { updatedAt: "desc" },
      select: {
        lessonId: true,
        content: true,
        lesson: {
          select: {
            order: true,
            video: {
              select: {
                id: true,
                titleLine1: true,
                instructor: { select: { name: true, photoKey: true } },
                lessons: { select: { id: true } },
              },
            },
          },
        },
      },
    }),
    prisma.watchProgress.findMany({
      where: {
        userId: session.uid,
        completedAt: null,
        currentSeconds: { gt: 0 },
      },
      orderBy: { lastWatchedAt: "desc" },
      take: 12,
      select: {
        lessonId: true,
        currentSeconds: true,
        durationSeconds: true,
        lesson: {
          select: {
            order: true,
            durationLabel: true,
            video: {
              select: {
                id: true,
                titleLine1: true,
                thumbnailKey: true,
                instructor: { select: { name: true } },
                lessons: { select: { id: true } },
              },
            },
          },
        },
      },
    }),
    prisma.playbookAchievement.findMany({
      where: { userId: session.uid },
      orderBy: { achievedAt: "desc" },
      select: {
        video: {
          select: {
            id: true,
            titleLine1: true,
            titleLine2: true,
            thumbnailKey: true,
            durationLabel: true,
            instructor: { select: { name: true, title: true } },
          },
        },
      },
    }),
  ]);

  const bookmarks: BookmarkItem[] = await Promise.all(
    bookmarkRows.map(async (r) => ({
      videoId: r.lesson.video.id,
      lessonId: r.lessonId,
      thumbnailUrl: await presignGetUrl(
        r.lesson.video.thumbnailKey,
        PRESIGN_TTL.image,
      ),
      durationLabel: r.lesson.durationLabel,
      instructorName: r.lesson.video.instructor.name,
      videoTitle: r.lesson.video.titleLine1,
      lessonOrder: r.lesson.order + 1,
      totalLessons: r.lesson.video.lessons.length,
    })),
  );

  const notes: NoteItemData[] = await Promise.all(
    noteRows.map(async (r) => ({
      videoId: r.lesson.video.id,
      lessonId: r.lessonId,
      instructorPhotoUrl: await presignGetUrl(
        r.lesson.video.instructor.photoKey,
        PRESIGN_TTL.image,
      ),
      instructorName: r.lesson.video.instructor.name,
      videoTitle: r.lesson.video.titleLine1,
      lessonOrder: r.lesson.order + 1,
      totalLessons: r.lesson.video.lessons.length,
      preview: r.content,
    })),
  );

  const continueWatching: ContinueWatchingItem[] = await Promise.all(
    progressRows.map(async (r) => {
      const pct =
        r.durationSeconds > 0
          ? Math.min(100, Math.round((r.currentSeconds / r.durationSeconds) * 100))
          : 0;
      return {
        videoId: r.lesson.video.id,
        lessonId: r.lessonId,
        thumbnailUrl: await presignGetUrl(
          r.lesson.video.thumbnailKey,
          PRESIGN_TTL.image,
        ),
        durationLabel: r.lesson.durationLabel,
        progressPct: pct,
        author: r.lesson.video.instructor.name,
        subtitle: `${r.lesson.video.titleLine1} | Lesson ${r.lesson.order + 1} of ${r.lesson.video.lessons.length}`,
      };
    }),
  );

  const achieved: PlaybookAchievedItem[] = await Promise.all(
    achievedRows.map(async (r) => ({
      videoId: r.video.id,
      thumbnailUrl: await presignGetUrl(r.video.thumbnailKey, PRESIGN_TTL.image),
      titleLine1: r.video.titleLine1,
      titleLine2: r.video.titleLine2 ?? "",
      metaLine1: r.video.instructor.name,
      metaLine2: r.video.instructor.title,
      duration: r.video.durationLabel,
    })),
  );

  return (
    <ProgressClient
      bookmarks={bookmarks}
      notes={notes}
      continueWatching={continueWatching}
      achieved={achieved}
    />
  );
}
