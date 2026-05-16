import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { uid, email, displayName, photoUrl } = await req.json() as {
      uid: string;
      email: string;
      displayName: string | null;
      photoUrl: string | null;
    };

    if (!uid || !email) {
      return NextResponse.json({ error: "Missing uid or email" }, { status: 400 });
    }

    await prisma.user.upsert({
      where: { id: uid },
      create: { id: uid, email, displayName, photoUrl },
      update: { email, displayName, photoUrl },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
