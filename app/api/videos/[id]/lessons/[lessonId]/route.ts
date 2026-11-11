import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/prisma";
import { presignGetUrl, PRESIGN_TTL } from "@/lib/server/s3";
import { RENDITION_HEIGHT } from "@/lib/server/mediaconvert";

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
      transcodeStatus: true,
      sourceHeightPx: true,
      renditions: { select: { quality: true, videoKey: true, status: true } },
    },
  });

  if (!lesson || lesson.videoId !== videoId) return notFound();

  const videoUrl = await presignGetUrl(lesson.videoKey, PRESIGN_TTL.video);

  // Only surface a picker once every rung is confirmed ready — a half-finished
  // transcode must never show a broken or single-option menu. `videoUrl`
  // above always comes from the untouched source key regardless of transcode
  // state, so playback itself is never affected by this.
  type QualityOption = { label: string; height: number | null; url: string; isSource: boolean };
  const qualities: QualityOption[] =
    lesson.transcodeStatus === "READY"
      ? await Promise.all(
          lesson.renditions
            .filter((r) => r.status === "READY")
            .map(async (r) => ({
              label: `${RENDITION_HEIGHT[r.quality]}p`,
              height: RENDITION_HEIGHT[r.quality] as number | null,
              url: await presignGetUrl(r.videoKey, PRESIGN_TTL.video),
              isSource: false,
            })),
        )
      : [];
  // Deliberately NOT offering the raw source ("Original") here — camera/export
  // uploads are often not faststart-optimized (metadata at the end of the file
  // instead of the front), so seeking into a large one can hang indefinitely.
  // MediaConvert's own outputs (the renditions above) are faststart by default.

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
      qualities,
    },
  });
}
