import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/prisma";

function unauth() {
  return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
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

  return NextResponse.json({ ok: true });
}
