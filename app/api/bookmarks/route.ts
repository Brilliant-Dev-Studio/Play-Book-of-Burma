import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/prisma";

function unauth() {
  return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return unauth();

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.uid },
    orderBy: { createdAt: "desc" },
    select: {
      lessonId: true,
      createdAt: true,
      lesson: {
        select: {
          id: true,
          title: true,
          order: true,
          durationLabel: true,
          videoId: true,
          video: { select: { titleLine1: true, titleLine2: true } },
        },
      },
    },
  });

  return NextResponse.json({
    bookmarks: bookmarks.map((b) => ({
      lessonId: b.lessonId,
      lessonTitle: b.lesson.title,
      lessonOrder: b.lesson.order,
      lessonDuration: b.lesson.durationLabel,
      videoId: b.lesson.videoId,
      videoTitle: `${b.lesson.video.titleLine1}${b.lesson.video.titleLine2 ? " " + b.lesson.video.titleLine2 : ""}`.trim(),
      bookmarkedAt: b.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauth();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { lessonId } = body as { lessonId?: unknown };
  if (typeof lessonId !== "string" || !lessonId) {
    return NextResponse.json({ error: "lessonId required." }, { status: 400 });
  }

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  }

  await prisma.bookmark.upsert({
    where: { userId_lessonId: { userId: session.uid, lessonId } },
    create: { userId: session.uid, lessonId },
    update: {},
  });

  return NextResponse.json({ ok: true });
}
