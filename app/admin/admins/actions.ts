"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/auth-helpers";
import { hashPassword } from "@/lib/server/password";
import { generateTempPassword } from "@/lib/server/generate-password";
import { sendWelcomeEmail } from "@/lib/server/email";

export type AdminFormInput = { email: string; displayName: string };

type AdminFormResult =
  | { ok: true; id: string; tempPassword: string }
  | { ok: false; errors: string[] };

export async function createAdmin(input: AdminFormInput): Promise<AdminFormResult> {
  await requireAdmin();

  const email = input.email.trim().toLowerCase();
  const displayName = input.displayName.trim();

  const errors: string[] = [];
  if (!email || !email.includes("@")) errors.push("Valid email is required.");
  if (!displayName) errors.push("Display name is required.");
  if (errors.length > 0) return { ok: false, errors };

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        displayName,
        passwordHash,
        tempPasswordPlain: tempPassword,
        role: "ADMIN",
        emailVerified: true,
        mustChangePassword: true,
      },
      select: { id: true, email: true, displayName: true },
    });

    await sendWelcomeEmail(user.email, tempPassword, user.displayName);

    revalidatePath("/admin/admins");
    return { ok: true, id: user.id, tempPassword };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { ok: false, errors: ["A user with this email already exists."] };
    }
    console.error("createAdmin error:", err);
    return { ok: false, errors: ["Failed to create admin."] };
  }
}
