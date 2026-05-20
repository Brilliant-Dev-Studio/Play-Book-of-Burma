import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/server/auth-helpers";
import { hashPassword, verifyPassword } from "@/lib/server/password";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.uid } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (!user.mustChangePassword) {
      if (typeof currentPassword !== "string" || currentPassword.length === 0) {
        return NextResponse.json(
          { error: "Current password is required." },
          { status: 400 },
        );
      }
      const ok = await verifyPassword(currentPassword, user.passwordHash);
      if (!ok) {
        return NextResponse.json(
          { error: "Current password is incorrect." },
          { status: 401 },
        );
      }
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, mustChangePassword: false },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("change-password error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
