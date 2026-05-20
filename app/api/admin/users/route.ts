import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/server/auth-helpers";
import { hashPassword } from "@/lib/server/password";
import { generateTempPassword } from "@/lib/server/generate-password";
import { sendWelcomeEmail } from "@/lib/server/email";

async function requireAdminJson() {
  const session = await getSession();
  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthenticated." }, { status: 401 }),
    } as const;
  }
  if (session.role !== "ADMIN") {
    return {
      error: NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    } as const;
  }
  return { session } as const;
}

export async function GET() {
  const gate = await requireAdminJson();
  if ("error" in gate) return gate.error;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      mustChangePassword: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const gate = await requireAdminJson();
  if ("error" in gate) return gate.error;

  try {
    const { email, displayName } = await req.json();
    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    const user = await prisma.user.create({
      data: {
        email,
        displayName: typeof displayName === "string" && displayName.length > 0 ? displayName : null,
        passwordHash,
        role: "USER",
        mustChangePassword: true,
        emailVerified: true,
      },
      select: { id: true, email: true, displayName: true },
    });

    await sendWelcomeEmail(user.email, tempPassword, user.displayName);

    return NextResponse.json({ ok: true, uid: user.id, email: user.email, tempPassword });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 },
      );
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error("admin/users POST error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
