import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/prisma";

function unauth() {
  return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ podcastId: string }> },
) {
  const session = await getSession();
  if (!session) return unauth();

  const { podcastId } = await params;

  const note = await prisma.podcastNote.findUnique({
    where: { userId_podcastId: { userId: session.uid, podcastId } },
    select: { content: true, updatedAt: true },
  });

  return NextResponse.json({
    content: note?.content ?? null,
    updatedAt: note?.updatedAt.toISOString() ?? null,
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ podcastId: string }> },
) {
  const session = await getSession();
  if (!session) return unauth();

  const { podcastId } = await params;

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

  const podcast = await prisma.podcast.findUnique({
    where: { id: podcastId },
    select: { id: true },
  });
  if (!podcast) {
    return NextResponse.json({ error: "Podcast not found." }, { status: 404 });
  }

  if (content.trim() === "") {
    await prisma.podcastNote.deleteMany({
      where: { userId: session.uid, podcastId },
    });
    return NextResponse.json({ ok: true });
  }

  await prisma.podcastNote.upsert({
    where: { userId_podcastId: { userId: session.uid, podcastId } },
    create: { userId: session.uid, podcastId, content },
    update: { content },
  });

  return NextResponse.json({ ok: true });
}
