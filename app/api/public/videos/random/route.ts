import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { presignGetUrl, PRESIGN_TTL } from "@/lib/server/s3";

// Public, unauthenticated — N random published videos (default 12) for
// "Watch All the Playbooks"-style shuffled browse screens. Separate file
// from /api/public/videos so that route's plain pagination stays untouched.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "12", 10)));

  const ids = await prisma.video.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true },
  });

  // Fisher-Yates shuffle, then take the first `limit`.
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const pickedIds = ids.slice(0, limit).map((v) => v.id);

  const rows = await prisma.video.findMany({
    where: { id: { in: pickedIds } },
    select: {
      id: true,
      titleLine1: true,
      titleLine2: true,
      description: true,
      thumbnailKey: true,
      durationLabel: true,
      durationSeconds: true,
      publishedAt: true,
      industry: { select: { name: true } },
      skillset: { select: { name: true } },
      instructor: { select: { name: true, title: true } },
    },
  });
  const rowsById = new Map(rows.map((r) => [r.id, r]));

  const videos = await Promise.all(
    pickedIds
      .map((id) => rowsById.get(id))
      .filter((v): v is (typeof rows)[number] => Boolean(v))
      .map(async (v) => ({
        id: v.id,
        titleLine1: v.titleLine1,
        titleLine2: v.titleLine2 ?? "",
        description: v.description,
        thumbnailUrl: await presignGetUrl(v.thumbnailKey, PRESIGN_TTL.image),
        durationLabel: v.durationLabel,
        durationSeconds: v.durationSeconds,
        publishedAt: v.publishedAt?.toISOString() ?? null,
        industry: v.industry.name,
        skillset: v.skillset.name,
        instructorName: v.instructor.name,
        instructorTitle: v.instructor.title,
      })),
  );

  return NextResponse.json({ videos });
}
