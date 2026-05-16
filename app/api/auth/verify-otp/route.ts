import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { uid, code } = await req.json();

    if (!uid || !code) {
      return NextResponse.json({ error: "uid and code are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: uid } });

    if (!user?.verifyCode || !user?.verifyCodeExpiry) {
      return NextResponse.json(
        { error: "No verification code found. Please request a new one." },
        { status: 400 },
      );
    }

    if (new Date() > user.verifyCodeExpiry) {
      return NextResponse.json(
        { error: "Code has expired. Please request a new one." },
        { status: 400 },
      );
    }

    if (user.verifyCode !== code) {
      return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: uid },
      data: { emailVerified: true, verifyCode: null, verifyCodeExpiry: null },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("verify-otp error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
