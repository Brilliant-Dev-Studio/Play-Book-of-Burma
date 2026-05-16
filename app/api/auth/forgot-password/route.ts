import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email." },
        { status: 404 },
      );
    }

    // TODO: replace with generateOtp() when AWS SES is wired up
    const code = "123456";
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetCode: code, resetCodeExpiry: expiry, resetVerified: false },
    });

    console.log(`\n[RESET OTP MOCK] ─────────────────────`);
    console.log(`  Email : ${email}`);
    console.log(`  Code  : ${code}`);
    console.log(`  Expiry: ${expiry.toISOString()}`);
    console.log(`──────────────────────────────────────\n`);

    return NextResponse.json({ ok: true, uid: user.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("forgot-password error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
