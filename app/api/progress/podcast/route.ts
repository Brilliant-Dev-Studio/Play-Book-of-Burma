import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/prisma";

function unauth() {
  return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return unauth();

  const progress = await prisma.podcastProgress.findMany({
    where: { userId: session.uid },
    select: {
      podcastId: true,
      currentSeconds: true,
      durationSeconds: true,
      completedAt: true,
      lastListenedAt: true,
      podcast: { select: { title: true, season: true, episodeOrder: true } },
    },
    orderBy: { lastListenedAt: "desc" },
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

  const { podcastId, currentSeconds, durationSeconds, completed } = body as {
    podcastId?: unknown;
    currentSeconds?: unknown;
    durationSeconds?: unknown;
    completed?: unknown;
  };

  if (typeof podcastId !== "string" || !podcastId) {
    return NextResponse.json({ error: "podcastId required." }, { status: 400 });
  }
  if (typeof currentSeconds !== "number" || currentSeconds < 0) {
    return NextResponse.json({ error: "currentSeconds must be a non-negative number." }, { status: 400 });
  }

  const podcast = await prisma.podcast.findUnique({
    where: { id: podcastId },
    select: { id: true, durationSeconds: true },
  });
  if (!podcast) {
    return NextResponse.json({ error: "Podcast not found." }, { status: 404 });
  }

  const resolvedDuration =
    typeof durationSeconds === "number" && durationSeconds > 0
      ? durationSeconds
      : podcast.durationSeconds;

  const completedAt = completed === true ? new Date() : undefined;

  await prisma.podcastProgress.upsert({
    where: { userId_podcastId: { userId: session.uid, podcastId } },
    create: {
      userId: session.uid,
      podcastId,
      currentSeconds,
      durationSeconds: resolvedDuration,
      completedAt: completedAt ?? null,
      lastListenedAt: new Date(),
    },
    update: {
      currentSeconds,
      durationSeconds: resolvedDuration,
      ...(completedAt ? { completedAt } : {}),
      lastListenedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
