import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/server/password";
import {
  signSession,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/server/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        membership: { select: { status: true, expiresAt: true } },
      },
    });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Your account has been suspended. Please contact support." },
        { status: 403 },
      );
    }

    const m = user.membership;
    if (m?.status === "APPROVED" && m.expiresAt && m.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Your membership plan has expired. Please renew to continue." },
        { status: 403 },
      );
    }

    const token = await signSession({ uid: user.id, email: user.email, role: user.role });

    const store = await cookies();
    store.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return NextResponse.json({
      ok: true,
      mustChangePassword: user.mustChangePassword,
      role: user.role,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("login error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
