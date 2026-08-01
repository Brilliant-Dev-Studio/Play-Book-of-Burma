import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { presignGetUrl, PRESIGN_TTL } from "@/lib/server/s3";

// Public, unauthenticated equivalent of GET /api/videos — no session or
// membership required. Used for pre-login browse screens (landing page,
// mobile "browse before you join"). Mirrors the same query params and
// response shape as the members-only route; kept as a separate file so the
// original route's auth behavior is never touched.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const industry = searchParams.get("industry") ?? undefined;
  const skillset = searchParams.get("skillset") ?? undefined;
  const sort = searchParams.get("sort") ?? "newest";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "12", 10)));
  const skip = (page - 1) * limit;

  const where = {
    status: "PUBLISHED" as const,
    ...(industry ? { industry: { name: industry } } : {}),
    ...(skillset ? { skillset: { name: skillset } } : {}),
  };

  const orderBy =
    sort === "popular"
      ? [{ publishedAt: "desc" as const }, { createdAt: "desc" as const }]
      : [{ publishedAt: "desc" as const }, { createdAt: "desc" as const }];

  const [rows, total] = await Promise.all([
    prisma.video.findMany({
      where,
      orderBy,
      skip,
      take: limit,
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
    }),
    prisma.video.count({ where }),
  ]);

  const videos = await Promise.all(
    rows.map(async (v) => ({
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

  return NextResponse.json({ videos, total, page, limit });
}
