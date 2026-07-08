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
  return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> },
) {
  const session = await getSession();
  if (!session) return unauth();

  const membership = await prisma.membership.findUnique({
    where: { userId: session.uid },
    select: { status: true, expiresAt: true },
  });
  const isMember =
    membership?.status === "APPROVED" &&
    (!membership.expiresAt || membership.expiresAt >= new Date());
  if (!isMember) return forbidden();

  const { id: videoId, lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      videoId: true,
      order: true,
      title: true,
      videoKey: true,
      durationLabel: true,
      durationSeconds: true,
      details: true,
    },
  });

  if (!lesson || lesson.videoId !== videoId) return notFound();

  const videoUrl = await presignGetUrl(lesson.videoKey, PRESIGN_TTL.video);

  return NextResponse.json({
    lesson: {
      id: lesson.id,
      videoId: lesson.videoId,
      order: lesson.order,
      title: lesson.title,
      videoUrl,
      durationLabel: lesson.durationLabel,
      durationSeconds: lesson.durationSeconds,
      details: lesson.details,
    },
  });
}
