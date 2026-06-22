import { prisma } from "@/lib/prisma";
import { presignGetUrl, PRESIGN_TTL } from "@/lib/server/s3";
import { requireSession } from "@/lib/server/auth-helpers";
import { getHomePodcastGroups } from "@/lib/server/podcasts";
import {
  UserPortalClient,
  type ContinueWatchingItem,
  type NewlyAddedItem,
} from "./user-portal-client";

export default async function UserPortalPage() {
  const session = await requireSession();
  const [videos, industries, skillsets, progressRows, podcasts] = await Promise.all([
    prisma.video.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        titleLine1: true,
        titleLine2: true,
        thumbnailKey: true,
        durationLabel: true,
        playbook: true,
        instructor: { select: { name: true, title: true } },
        industry: { select: { name: true } },
        skillset: { select: { name: true } },
      },
    }),
    prisma.industry.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { name: true },
    }),
    prisma.skillset.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { name: true },
    }),
    prisma.watchProgress.findMany({
      where: {
        userId: session.uid,
        completedAt: null,
        currentSeconds: { gt: 0 },
      },
      orderBy: { lastWatchedAt: "desc" },
      take: 8,
      select: {
        lessonId: true,
        currentSeconds: true,
        durationSeconds: true,
        lesson: {
          select: {
            order: true,
            title: true,
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
    getHomePodcastGroups(),
  ]);

  const filterGroups = [
    { heading: "Playbook", options: ["CEO Playbook"] },
    { heading: "Industry", options: industries.map((i) => i.name) },
    { heading: "Skillsets", options: skillsets.map((s) => s.name) },
  ];

  const playbookLabels: Record<string, string> = { CEO_PLAYBOOK: "CEO Playbook" };

  const mapVideo = async (v: (typeof videos)[number]): Promise<NewlyAddedItem> => ({
    id: v.id,
    titleLine1: v.titleLine1,
    titleLine2: v.titleLine2 ?? "",
    instructorName: v.instructor.name,
    instructorTitle: v.instructor.title,
    duration: v.durationLabel,
    thumbnailUrl: await presignGetUrl(v.thumbnailKey, PRESIGN_TTL.image),
    playbook: playbookLabels[v.playbook] ?? v.playbook,
    industry: v.industry.name,
    skillset: v.skillset.name,
  });

  const allPlaybooks = await Promise.all(videos.map(mapVideo));
  const newlyAdded = allPlaybooks.slice(0, 15);

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

  return (
    <UserPortalClient
      newlyAdded={newlyAdded}
      allPlaybooks={allPlaybooks}
      filterGroups={filterGroups}
      continueWatching={continueWatching}
      podcasts={podcasts}
    />
  );
}
