import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/server/password";

export async function POST(req: NextRequest) {
  try {
    const { uid, password } = await req.json();
    if (!uid || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "uid and a password of at least 8 characters are required." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { id: uid } });
    if (!user?.resetVerified) {
      return NextResponse.json(
        { error: "OTP not verified. Please complete verification first." },
        { status: 403 },
      );
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: uid },
      data: {
        passwordHash,
        resetCode: null,
        resetCodeExpiry: null,
        resetVerified: false,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("reset-password error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
