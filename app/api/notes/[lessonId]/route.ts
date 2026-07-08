import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/prisma";

function unauth() {
  return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const session = await getSession();
  if (!session) return unauth();

  const { lessonId } = await params;

  const note = await prisma.note.findUnique({
    where: { userId_lessonId: { userId: session.uid, lessonId } },
    select: { content: true, updatedAt: true },
  });

  return NextResponse.json({
    content: note?.content ?? null,
    updatedAt: note?.updatedAt.toISOString() ?? null,
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const session = await getSession();
  if (!session) return unauth();

  const { lessonId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { content } = body as { content?: unknown };
  if (typeof content !== "string") {
    return NextResponse.json({ error: "content must be a string." }, { status: 400 });
  }

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  }

  if (content.trim() === "") {
    await prisma.note.deleteMany({
      where: { userId: session.uid, lessonId },
    });
    return NextResponse.json({ ok: true });
  }

  await prisma.note.upsert({
    where: { userId_lessonId: { userId: session.uid, lessonId } },
    create: { userId: session.uid, lessonId, content },
    update: { content },
  });

  return NextResponse.json({ ok: true });
}
