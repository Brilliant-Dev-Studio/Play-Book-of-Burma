import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const { id } = await params;
  let adminNote: string | null = null;
  try {
    const body = (await req.json()) as { adminNote?: string };
    if (typeof body.adminNote === "string") adminNote = body.adminNote.trim().slice(0, 500) || null;
  } catch {}

  const submission = await prisma.membershipSubmission.findUnique({ where: { id } });
  if (!submission) return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  if (submission.status !== "PENDING") {
    return NextResponse.json({ error: "Submission already reviewed." }, { status: 409 });
  }

  await prisma.membershipSubmission.update({
    where: { id },
    data: {
      status: "REJECTED",
      adminNote,
      reviewedAt: new Date(),
      reviewedById: session.uid,
    },
  });

  return NextResponse.json({ ok: true });
}
