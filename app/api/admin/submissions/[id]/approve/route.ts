import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/server/password";
import { generateTempPassword } from "@/lib/server/generate-password";
import { sendWelcomeEmail } from "@/lib/server/email";
import { computeExpiresAt } from "@/lib/server/membership";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const { id } = await params;

  let body: { email?: string; displayName?: string; plan?: string; amountMmk?: number; adminNote?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const submission = await prisma.membershipSubmission.findUnique({ where: { id } });
  if (!submission) return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  if (submission.status !== "PENDING") {
    return NextResponse.json({ error: "Submission already reviewed." }, { status: 409 });
  }

  const email = (body.email ?? submission.email).trim().toLowerCase();
  const displayName = (body.displayName ?? submission.fullName).trim();
  const plan = (body.plan ?? submission.plan) as "SIX_MONTHS" | "TWELVE_MONTHS";
  const amountMmk =
    typeof body.amountMmk === "number" && body.amountMmk >= 0 ? body.amountMmk : submission.amountMmk;
  const adminNote = body.adminNote?.trim() || null;

  if (!["SIX_MONTHS", "TWELVE_MONTHS"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
  const now = new Date();
  const expiresAt = computeExpiresAt(plan, now);

  try {
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          displayName,
          phone: submission.phone,
          passwordHash,
          tempPasswordPlain: tempPassword,
          role: "USER",
          emailVerified: true,
          mustChangePassword: true,
          membership: {
            create: {
              status: "APPROVED",
              plan,
              paymentMethod: submission.paymentMethod,
              paymentScreenshot: submission.screenshotKey,
              amountMmk,
              approvedAt: now,
              expiresAt,
              notes: adminNote,
            },
          },
        },
        select: { id: true, email: true, displayName: true },
      });

      await tx.membershipSubmission.update({
        where: { id: submission.id },
        data: {
          status: "APPROVED",
          adminNote,
          reviewedAt: now,
          reviewedById: session.uid,
          resultingUserId: created.id,
        },
      });

      return created;
    });

    await sendWelcomeEmail(user.email, tempPassword, user.displayName);

    return NextResponse.json({
      ok: true,
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      tempPassword,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 },
      );
    }
    console.error("approve submission error:", err);
    return NextResponse.json({ error: "Failed to approve submission." }, { status: 500 });
  }
}
