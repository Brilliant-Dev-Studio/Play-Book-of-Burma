import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { uid, email, displayName } = await req.json();

    if (!uid || !email) {
      return NextResponse.json({ error: "uid and email are required" }, { status: 400 });
    }

    // TODO: replace with generateOtp() when AWS SES is wired up
    const code = "123456";
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.upsert({
      where: { id: uid },
      create: { id: uid, email, displayName, verifyCode: code, verifyCodeExpiry: expiry },
      update: { verifyCode: code, verifyCodeExpiry: expiry },
    });

    // TODO: replace with AWS SES email send
    console.log(`\n[OTP MOCK] ──────────────────────────`);
    console.log(`  Email : ${email}`);
    console.log(`  Code  : ${code}`);
    console.log(`  Expiry: ${expiry.toISOString()}`);
    console.log(`──────────────────────────────────────\n`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("send-verification error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
