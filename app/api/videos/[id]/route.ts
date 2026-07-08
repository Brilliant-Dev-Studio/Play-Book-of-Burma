import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/prisma";
import { presignGetUrl, PRESIGN_TTL } from "@/lib/server/s3";

function unauth() {
  return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
}
function forbidden() {
  return NextResponse.json({ error: "Active membership required." }, { status: 403 });
}
function notFound() {
  return NextResponse.json({ error: "Video not found." }, { status: 404 });
}

async function requireMember(userId: string) {
  const membership = await prisma.membership.findUnique({
    where: { userId },
    select: { status: true, expiresAt: true },
  });
  return (
    membership?.status === "APPROVED" &&
    (!membership.expiresAt || membership.expiresAt >= new Date())
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return unauth();

  const isMember = await requireMember(session.uid);
  if (!isMember) return forbidden();

  const { id } = await params;

  const video = await prisma.video.findUnique({
    where: { id, status: "PUBLISHED" },
    select: {
      id: true,
      titleLine1: true,
      titleLine2: true,
      description: true,
      thumbnailKey: true,
      trailerKey: true,
      trailerThumbnailKey: true,
      guidebookKey: true,
      guidebookCoverKey: true,
      durationLabel: true,
      durationSeconds: true,
      publishedAt: true,
      industry: { select: { name: true } },
      skillset: { select: { name: true } },
      instructor: {
        select: {
          id: true,
          name: true,
          title: true,
          photoKey: true,
          biographyParagraphs: true,
        },
      },
      lessons: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          title: true,
          durationLabel: true,
          durationSeconds: true,
          details: true,
        },
      },
      skillsetItems: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          title: true,
          description: true,
          imageKey: true,
        },
      },
    },
  });

  if (!video) return notFound();

  const [thumbnailUrl, trailerUrl, trailerThumbnailUrl, guidebookUrl, guidebookCoverUrl, instructorPhotoUrl] =
    await Promise.all([
      presignGetUrl(video.thumbnailKey, PRESIGN_TTL.image),
      video.trailerKey ? presignGetUrl(video.trailerKey, PRESIGN_TTL.video) : null,
      video.trailerThumbnailKey ? presignGetUrl(video.trailerThumbnailKey, PRESIGN_TTL.image) : null,
      video.guidebookKey ? presignGetUrl(video.guidebookKey, PRESIGN_TTL.video) : null,
      video.guidebookCoverKey ? presignGetUrl(video.guidebookCoverKey, PRESIGN_TTL.image) : null,
      presignGetUrl(video.instructor.photoKey, PRESIGN_TTL.image),
    ]);

  const skillsetItemsWithUrls = await Promise.all(
    video.skillsetItems.map(async (si) => ({
      id: si.id,
      order: si.order,
      title: si.title,
      description: si.description,
      imageUrl: await presignGetUrl(si.imageKey, PRESIGN_TTL.image),
    })),
  );

  return NextResponse.json({
    video: {
      id: video.id,
      titleLine1: video.titleLine1,
      titleLine2: video.titleLine2 ?? "",
      description: video.description,
      thumbnailUrl,
      trailerUrl,
      trailerThumbnailUrl,
      guidebookUrl,
      guidebookCoverUrl,
      durationLabel: video.durationLabel,
      durationSeconds: video.durationSeconds,
      publishedAt: video.publishedAt?.toISOString() ?? null,
      industry: video.industry.name,
      skillset: video.skillset.name,
      instructor: {
        id: video.instructor.id,
        name: video.instructor.name,
        title: video.instructor.title,
        photoUrl: instructorPhotoUrl,
        biographyParagraphs: video.instructor.biographyParagraphs,
      },
      lessons: video.lessons,
      skillsetItems: skillsetItemsWithUrls,
    },
  });
}
