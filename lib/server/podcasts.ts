import { prisma } from "@/lib/prisma";
import { presignGetUrl, PRESIGN_TTL } from "@/lib/server/s3";

export type HomePodcastItem = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  audioUrl: string;
};

export type UserPortalPodcastItem = HomePodcastItem & {
  durationLabel: string;
  durationSeconds: number;
};

export async function getUserPortalPodcasts(): Promise<UserPortalPodcastItem[]> {
  const rows = await prisma.podcast.findMany({
    orderBy: [
      { popular: "desc" },
      { season: "desc" },
      { episodeOrder: "asc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      title: true,
      description: true,
      thumbnailKey: true,
      audioKey: true,
      durationLabel: true,
      durationSeconds: true,
    },
  });

  return Promise.all(
    rows.map(async (r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      thumbnailUrl: await presignGetUrl(r.thumbnailKey, PRESIGN_TTL.image),
      audioUrl: await presignGetUrl(r.audioKey, PRESIGN_TTL.video),
      durationLabel: r.durationLabel,
      durationSeconds: r.durationSeconds,
    })),
  );
}

export type HomePodcastGroup = {
  label: string;
  items: UserPortalPodcastItem[];
};

export async function getHomePodcastGroups(): Promise<HomePodcastGroup[]> {
  const rows = await prisma.podcast.findMany({
    orderBy: [
      { season: "desc" },
      { episodeOrder: "asc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      title: true,
      description: true,
      thumbnailKey: true,
      audioKey: true,
      durationLabel: true,
      durationSeconds: true,
      season: true,
      popular: true,
    },
  });

  if (rows.length === 0) return [];

  const presigned = await Promise.all(
    rows.map(async (r) => ({
      raw: r,
      item: {
        id: r.id,
        title: r.title,
        description: r.description,
        thumbnailUrl: await presignGetUrl(r.thumbnailKey, PRESIGN_TTL.image),
        audioUrl: await presignGetUrl(r.audioKey, PRESIGN_TTL.video),
        durationLabel: r.durationLabel,
        durationSeconds: r.durationSeconds,
      } satisfies UserPortalPodcastItem,
    })),
  );

  const groups: HomePodcastGroup[] = [];

  const popular = presigned.filter((p) => p.raw.popular).map((p) => p.item);
  if (popular.length > 0) groups.push({ label: "Popular", items: popular });

  const seasons = Array.from(new Set(presigned.map((p) => p.raw.season))).sort(
    (a, b) => b - a,
  );
  for (const s of seasons) {
    const items = presigned
      .filter((p) => p.raw.season === s)
      .map((p) => p.item);
    if (items.length > 0) groups.push({ label: `Season ${s}`, items });
  }

  return groups;
}

export type PodcastChapterItem = { label: string; seconds: number };

export type PodcastDetail = UserPortalPodcastItem & {
  chapters: PodcastChapterItem[];
};

export async function getPodcastDetail(id: string): Promise<PodcastDetail | null> {
  const row = await prisma.podcast.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      thumbnailKey: true,
      audioKey: true,
      durationLabel: true,
      durationSeconds: true,
      chapters: {
        orderBy: { order: "asc" },
        select: { label: true, seconds: true },
      },
    },
  });
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    thumbnailUrl: await presignGetUrl(row.thumbnailKey, PRESIGN_TTL.image),
    audioUrl: await presignGetUrl(row.audioKey, PRESIGN_TTL.video),
    durationLabel: row.durationLabel,
    durationSeconds: row.durationSeconds,
    chapters: row.chapters,
  };
}
