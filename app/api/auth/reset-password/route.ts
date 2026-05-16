import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { uid, password } = await req.json();
    if (!uid || !password) {
      return NextResponse.json({ error: "uid and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: uid } });
    if (!user?.resetVerified) {
      return NextResponse.json(
        { error: "OTP not verified. Please complete verification first." },
        { status: 403 },
      );
    }

    // TODO: use Firebase Admin SDK to update password
    // await adminAuth.updateUser(uid, { password });

    await prisma.user.update({
      where: { id: uid },
      data: { resetVerified: false },
    });

    console.log(`[RESET MOCK] Password reset for uid: ${uid}`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("reset-password error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
