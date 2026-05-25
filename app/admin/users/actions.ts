"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/auth-helpers";
import { hashPassword } from "@/lib/server/password";
import { generateTempPassword } from "@/lib/server/generate-password";
import { sendWelcomeEmail } from "@/lib/server/email";
import { computeExpiresAt, type Plan } from "@/lib/server/membership";
import { isAllowedKey } from "@/lib/server/s3";

export type SubscriberFormInput = {
  email: string;
  displayName: string;
  phone?: string;
  plan: Plan;
  amountMmk: number;
  paymentMethod?: "KBZ_PAY" | "WAVE_MONEY";
  paymentScreenshotKey?: string;
  adminNote?: string;
  expiresAt?: string;
};

type SubscriberFormResult =
  | { ok: true; id: string; tempPassword: string }
  | { ok: false; errors: string[] };

function clean(input: SubscriberFormInput): SubscriberFormInput {
  return {
    ...input,
    email: input.email.trim().toLowerCase(),
    displayName: input.displayName.trim(),
    phone: input.phone?.trim() || undefined,
    paymentScreenshotKey: input.paymentScreenshotKey?.trim() || undefined,
    adminNote: input.adminNote?.trim() || undefined,
    expiresAt: input.expiresAt?.trim() || undefined,
  };
}

function validate(input: SubscriberFormInput): string[] {
  const errors: string[] = [];
  if (!input.email || !input.email.includes("@")) errors.push("Valid email is required.");
  if (!input.displayName) errors.push("Display name is required.");
  if (input.plan !== "SIX_MONTHS" && input.plan !== "TWELVE_MONTHS")
    errors.push("Invalid plan.");
  if (!Number.isFinite(input.amountMmk) || input.amountMmk < 0)
    errors.push("Amount must be a non-negative number.");
  if (input.paymentMethod && input.paymentMethod !== "KBZ_PAY" && input.paymentMethod !== "WAVE_MONEY")
    errors.push("Invalid payment method.");
  if (input.paymentScreenshotKey && !isAllowedKey(input.paymentScreenshotKey))
    errors.push("Payment screenshot upload is invalid.");
  if (input.expiresAt && Number.isNaN(new Date(input.expiresAt).getTime()))
    errors.push("Invalid expiry date.");
  return errors;
}

export async function regenerateTempPassword(
  userId: string,
): Promise<
  | { ok: true; tempPassword: string }
  | { ok: false; error: string }
> {
  await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, displayName: true },
  });
  if (!user) return { ok: false, error: "User not found." };

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      tempPasswordPlain: tempPassword,
      mustChangePassword: true,
    },
  });

  await sendWelcomeEmail(user.email, tempPassword, user.displayName);

  revalidatePath("/admin/submissions");
  revalidatePath("/admin/users");
  return { ok: true, tempPassword };
}

export async function createSubscriber(
  input: SubscriberFormInput,
): Promise<SubscriberFormResult> {
  await requireAdmin();

  const cleaned = clean(input);
  const errors = validate(cleaned);
  if (errors.length > 0) return { ok: false, errors };

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
  const now = new Date();
  const expiresAt = cleaned.expiresAt
    ? new Date(cleaned.expiresAt)
    : computeExpiresAt(cleaned.plan, now);

  try {
    const user = await prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          email: cleaned.email,
          displayName: cleaned.displayName,
          phone: cleaned.phone ?? null,
          passwordHash,
          tempPasswordPlain: tempPassword,
          role: "USER",
          emailVerified: true,
          mustChangePassword: true,
          membership: {
            create: {
              status: "APPROVED",
              plan: cleaned.plan,
              paymentMethod: cleaned.paymentMethod ?? null,
              paymentScreenshot: cleaned.paymentScreenshotKey ?? null,
              amountMmk: cleaned.amountMmk,
              approvedAt: now,
              expiresAt,
              notes: cleaned.adminNote ?? null,
            },
          },
        },
        select: { id: true, email: true, displayName: true },
      });
    });

    await sendWelcomeEmail(user.email, tempPassword, user.displayName);

    revalidatePath("/admin/users");
    return { ok: true, id: user.id, tempPassword };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { ok: false, errors: ["A user with this email already exists."] };
    }
    console.error("createSubscriber error:", err);
    return { ok: false, errors: ["Failed to create subscriber."] };
  }
}
