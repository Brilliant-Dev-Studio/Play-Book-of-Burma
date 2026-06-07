import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { presignGetUrl, PRESIGN_TTL } from "@/lib/server/s3";
import { requireSession } from "@/lib/server/auth-helpers";
import { WatchClient, type WatchVideo, type Tab } from "./watch-client";

export default async function WatchPage({
  searchParams,
}: {
  searchParams: Promise<{ video?: string; lesson?: string; tab?: string }>;
}) {
  const session = await requireSession();
  const { video: videoId, lesson: lessonId, tab } = await searchParams;

  if (!videoId) {
    const fallback = await prisma.video.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: { id: true },
    });
    if (!fallback) notFound();
    redirect(`/user-portal/watch?video=${fallback.id}`);
  }

  const video = await prisma.video.findFirst({
    where: { id: videoId, status: "PUBLISHED" },
    include: {
      instructor: true,
      lessons: { orderBy: { order: "asc" } },
    },
  });
  if (!video) notFound();

  const lessonIds = video.lessons.map((l) => l.id);
  const [thumbnailUrl, instructorPhotoUrl, lessonUrls, bookmarks, notes, progress] = await Promise.all([
    presignGetUrl(video.thumbnailKey, PRESIGN_TTL.image),
    presignGetUrl(video.instructor.photoKey, PRESIGN_TTL.image),
    Promise.all(
      video.lessons.map((l) => presignGetUrl(l.videoKey, PRESIGN_TTL.video)),
    ),
    lessonIds.length
      ? prisma.bookmark.findMany({
          where: { userId: session.uid, lessonId: { in: lessonIds } },
          select: { lessonId: true },
        })
      : Promise.resolve([]),
    lessonIds.length
      ? prisma.note.findMany({
          where: { userId: session.uid, lessonId: { in: lessonIds } },
          select: { lessonId: true, content: true },
        })
      : Promise.resolve([]),
    lessonIds.length
      ? prisma.watchProgress.findMany({
          where: { userId: session.uid, lessonId: { in: lessonIds } },
          select: { lessonId: true, currentSeconds: true },
        })
      : Promise.resolve([]),
  ]);
  const bookmarkedSet = new Set(bookmarks.map((b) => b.lessonId));
  const progressByLesson = new Map(progress.map((p) => [p.lessonId, p.currentSeconds]));
  const noteByLesson = new Map(notes.map((n) => [n.lessonId, n.content]));

  const watchVideo: WatchVideo = {
    id: video.id,
    title: [video.titleLine1, video.titleLine2].filter(Boolean).join(" "),
    description: video.description,
    guidebookUrl: video.guidebookKey
      ? await presignGetUrl(video.guidebookKey, PRESIGN_TTL.image)
      : null,
    thumbnailUrl,
    instructor: {
      id: video.instructor.id,
      name: video.instructor.name,
      title: video.instructor.title,
      photoUrl: instructorPhotoUrl,
      biographyParagraphs: video.instructor.biographyParagraphs,
    },
    lessons: video.lessons.map((l, i) => ({
      id: l.id,
      order: l.order,
      title: l.title,
      durationLabel: l.durationLabel,
      details: l.details,
      videoUrl: lessonUrls[i],
      bookmarked: bookmarkedSet.has(l.id),
      note: noteByLesson.get(l.id) ?? "",
      progressSeconds: progressByLesson.get(l.id) ?? 0,
    })),
  };

  const initialLessonIndex = lessonId
    ? Math.max(
        0,
        watchVideo.lessons.findIndex((l) => l.id === lessonId),
      )
    : 0;

  const initialTab: Tab = tab === "notes" ? "Notes" : "All Lessons";

  return (
    <WatchClient
      video={watchVideo}
      initialLessonIndex={initialLessonIndex}
      initialTab={initialTab}
    />
  );
}
