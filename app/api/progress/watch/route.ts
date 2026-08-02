import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/prisma";

function unauth() {
  return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
}

/**
 * Award the playbook (course) once every lesson in its video is complete.
 * Idempotent via the unique (userId, videoId) constraint. Never throws — a
 * failure here must not break progress saving. Mirrors
 * app/user-portal/watch/actions.ts's maybeAwardPlaybook (kept in sync
 * manually — the web Server Action and this REST route don't share code).
 */
async function maybeAwardPlaybook(userId: string, lessonId: string): Promise<void> {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        videoId: true,
        video: { select: { lessons: { select: { id: true } } } },
      },
    });
    if (!lesson) return;

    const lessonIds = lesson.video.lessons.map((l) => l.id);
    if (lessonIds.length === 0) return;

    const completedCount = await prisma.watchProgress.count({
      where: {
        userId,
        completedAt: { not: null },
        lessonId: { in: lessonIds },
      },
    });
    if (completedCount < lessonIds.length) return;

    await prisma.playbookAchievement.upsert({
      where: { userId_videoId: { userId, videoId: lesson.videoId } },
      create: { userId, videoId: lesson.videoId },
      update: {},
    });
    revalidatePath("/user-portal/progress");
  } catch (err) {
    console.error("maybeAwardPlaybook error:", err);
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) return unauth();

  const progress = await prisma.watchProgress.findMany({
    where: { userId: session.uid },
    select: {
      lessonId: true,
      currentSeconds: true,
      durationSeconds: true,
      completedAt: true,
      lastWatchedAt: true,
      lesson: { select: { videoId: true, order: true, title: true } },
    },
    orderBy: { lastWatchedAt: "desc" },
  });

  return NextResponse.json({ progress });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauth();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { lessonId, currentSeconds, durationSeconds, completed } = body as {
    lessonId?: unknown;
    currentSeconds?: unknown;
    durationSeconds?: unknown;
    completed?: unknown;
  };

  if (typeof lessonId !== "string" || !lessonId) {
    return NextResponse.json({ error: "lessonId required." }, { status: 400 });
  }
  if (typeof currentSeconds !== "number" || currentSeconds < 0) {
    return NextResponse.json({ error: "currentSeconds must be a non-negative number." }, { status: 400 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, durationSeconds: true },
  });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  }

  const resolvedDuration =
    typeof durationSeconds === "number" && durationSeconds > 0
      ? durationSeconds
      : lesson.durationSeconds;

  const completedAt = completed === true ? new Date() : undefined;

  const existing = await prisma.watchProgress.findUnique({
    where: { userId_lessonId: { userId: session.uid, lessonId } },
    select: { completedAt: true },
  });

  await prisma.watchProgress.upsert({
    where: { userId_lessonId: { userId: session.uid, lessonId } },
    create: {
      userId: session.uid,
      lessonId,
      currentSeconds,
      durationSeconds: resolvedDuration,
      completedAt: completedAt ?? null,
      lastWatchedAt: new Date(),
    },
    update: {
      currentSeconds,
      durationSeconds: resolvedDuration,
      ...(completedAt ? { completedAt } : {}),
      lastWatchedAt: new Date(),
    },
  });

  // Only fires on the transition to completed, matching the web flow.
  if (completedAt && !existing?.completedAt) {
    await maybeAwardPlaybook(session.uid, lessonId);
  }

  return NextResponse.json({ ok: true });
}
