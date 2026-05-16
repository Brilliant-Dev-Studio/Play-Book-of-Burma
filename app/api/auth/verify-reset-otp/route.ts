import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { uid, code } = await req.json();
    if (!uid || !code) {
      return NextResponse.json({ error: "uid and code are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: uid } });

    if (!user?.resetCode || !user?.resetCodeExpiry) {
      return NextResponse.json(
        { error: "No reset code found. Please request a new one." },
        { status: 400 },
      );
    }
    if (new Date() > user.resetCodeExpiry) {
      return NextResponse.json(
        { error: "Code has expired. Please request a new one." },
        { status: 400 },
      );
    }
    if (user.resetCode !== code) {
      return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: uid },
      data: { resetCode: null, resetCodeExpiry: null, resetVerified: true },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("verify-reset-otp error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
