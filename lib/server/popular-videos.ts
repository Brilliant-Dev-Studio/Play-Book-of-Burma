import "server-only";
import { prisma } from "@/lib/prisma";
import { presignGetUrl, PRESIGN_TTL } from "@/lib/server/s3";

export type PopularVideoItem = {
  id: string;
  titleLine1: string;
  titleLine2: string;
  instructorName: string;
  instructorTitle: string;
  description: string;
  duration: string;
  durationSeconds: number;
  publishedAt: string | null; // ISO date string
  thumbnailUrl: string;
};

const DEFAULT_TAKE = 12;

const VIDEO_SELECT = {
  id: true,
  titleLine1: true,
  titleLine2: true,
  description: true,
  thumbnailKey: true,
  durationLabel: true,
  durationSeconds: true,
  publishedAt: true,
  instructor: { select: { name: true, title: true } },
} as const;

type VideoRow = {
  id: string;
  titleLine1: string;
  titleLine2: string | null;
  description: string;
  thumbnailKey: string;
  durationLabel: string;
  durationSeconds: number;
  publishedAt: Date | null;
  instructor: { name: string; title: string };
};

async function toItems(rows: VideoRow[]): Promise<PopularVideoItem[]> {
  return Promise.all(
    rows.map(async (v) => ({
      id: v.id,
      titleLine1: v.titleLine1,
      titleLine2: v.titleLine2 ?? "",
      instructorName: v.instructor.name,
      instructorTitle: v.instructor.title,
      description: v.description,
      duration: v.durationLabel,
      durationSeconds: v.durationSeconds,
      publishedAt: v.publishedAt ? v.publishedAt.toISOString() : null,
      thumbnailUrl: await presignGetUrl(v.thumbnailKey, PRESIGN_TTL.image),
    })),
  );
}

/** Most recently published videos, newest first. */
export async function getNewlyAddedVideos(take = DEFAULT_TAKE): Promise<PopularVideoItem[]> {
  const rows = await prisma.video.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take,
    select: VIDEO_SELECT,
  });
  return toItems(rows);
}

/**
 * Returns the most-watched published videos. Ranking is the count of
 * WatchProgress rows pointing at each video's lessons (≈ total resumed
 * watch sessions, regardless of completion). When the pool of watched
 * videos is smaller than `take`, falls back to the most recently
 * published videos to pad the carousel.
 */
export async function getPopularVideos(take = DEFAULT_TAKE): Promise<PopularVideoItem[]> {
  // 1. Pull all watch progress rows (just the videoId — small payload).
  const progress = await prisma.watchProgress.findMany({
    select: { lesson: { select: { videoId: true } } },
  });

  // 2. Tally watch sessions per video.
  const counts = new Map<string, number>();
  for (const p of progress) {
    const vid = p.lesson.videoId;
    counts.set(vid, (counts.get(vid) ?? 0) + 1);
  }
  const rankedIds = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);

  // 3. Fetch those videos (only PUBLISHED) so we can keep ranking order.
  const ranked = rankedIds.length
    ? await prisma.video.findMany({
        where: { id: { in: rankedIds }, status: "PUBLISHED" },
        select: VIDEO_SELECT,
      })
    : [];
  const rankedById = new Map(ranked.map((v) => [v.id, v]));
  const ordered = rankedIds
    .map((id) => rankedById.get(id))
    .filter((v): v is (typeof ranked)[number] => Boolean(v));

  // 4. Pad with most-recent published if we don't have `take` videos yet.
  const needed = Math.max(0, take - ordered.length);
  let fillers: typeof ranked = [];
  if (needed > 0) {
    fillers = await prisma.video.findMany({
      where: {
        status: "PUBLISHED",
        ...(ordered.length ? { id: { notIn: ordered.map((v) => v.id) } } : {}),
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: needed,
      select: VIDEO_SELECT,
    });
  }

  const all = [...ordered, ...fillers].slice(0, take);

  return toItems(all);
}
