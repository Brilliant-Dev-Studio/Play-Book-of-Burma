import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { presignGetUrl, PRESIGN_TTL } from "@/lib/server/s3";

// Public, unauthenticated equivalent of GET /api/podcasts — no session or
// membership required. Used for pre-login browse screens (landing page,
// mobile "browse before you join"). Mirrors the members-only route's
// response shape; kept as a separate file so the original route's auth
// behavior is never touched.
export async function GET() {
  const rows = await prisma.podcast.findMany({
    orderBy: [{ season: "desc" }, { episodeOrder: "asc" }, { createdAt: "desc" }],
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
      publishedAt: true,
    },
  });

  if (rows.length === 0) return NextResponse.json({ groups: [] });

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
        season: r.season,
        publishedAt: r.publishedAt.toISOString(),
      },
    })),
  );

  const groups: { label: string; items: (typeof presigned)[number]["item"][] }[] = [];

  const popular = presigned.filter((p) => p.raw.popular).map((p) => p.item);
  if (popular.length > 0) groups.push({ label: "Popular", items: popular });

  const seasons = Array.from(new Set(presigned.map((p) => p.raw.season))).sort(
    (a, b) => b - a,
  );
  for (const s of seasons) {
    const items = presigned.filter((p) => p.raw.season === s).map((p) => p.item);
    if (items.length > 0) groups.push({ label: `Season ${s}`, items });
  }

  return NextResponse.json({ groups });
}
