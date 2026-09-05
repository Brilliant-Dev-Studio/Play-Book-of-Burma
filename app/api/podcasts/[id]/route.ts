import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getPodcastDetail } from "@/lib/server/podcasts";

function unauth() {
  return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
}
function forbidden() {
  return NextResponse.json({ error: "Active membership required." }, { status: 403 });
}
function notFound() {
  return NextResponse.json({ error: "Podcast not found." }, { status: 404 });
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
  const podcast = await getPodcastDetail(id);
  if (!podcast) return notFound();

  return NextResponse.json({ podcast });
}
