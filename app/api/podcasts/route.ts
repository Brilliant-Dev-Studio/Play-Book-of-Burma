import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/prisma";
import { presignGetUrl, PRESIGN_TTL } from "@/lib/server/s3";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
  }

  const membership = await prisma.membership.findUnique({
    where: { userId: session.uid },
    select: { status: true, expiresAt: true },
  });
  const isMember =
    membership?.status === "APPROVED" &&
    (!membership.expiresAt || membership.expiresAt >= new Date());
  if (!isMember) {
    return NextResponse.json({ error: "Active membership required." }, { status: 403 });
  }

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
