import { prisma } from "@/lib/prisma";
import { presignGetUrl, PRESIGN_TTL } from "@/lib/server/s3";
import { requireSession } from "@/lib/server/auth-helpers";
import {
  ProgressClient,
  type BookmarkItem,
  type NoteItemData,
} from "./progress-client";

export default async function ProgressPage() {
  const session = await requireSession();

  const [bookmarkRows, noteRows] = await Promise.all([
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

  return <ProgressClient bookmarks={bookmarks} notes={notes} />;
}
