"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/server/auth-helpers";

export async function saveNote(
  lessonId: string,
  content: string,
): Promise<{ ok: true; deleted: boolean } | { ok: false; error: string }> {
  const session = await requireSession();
  const trimmed = content.trim();

  try {
    if (trimmed === "") {
      await prisma.note.deleteMany({
        where: { userId: session.uid, lessonId },
      });
      revalidatePath("/user-portal/watch");
      revalidatePath("/user-portal/progress");
      return { ok: true, deleted: true };
    }

    await prisma.note.upsert({
      where: { userId_lessonId: { userId: session.uid, lessonId } },
      create: { userId: session.uid, lessonId, content: trimmed },
      update: { content: trimmed },
    });
    revalidatePath("/user-portal/watch");
    revalidatePath("/user-portal/progress");
    return { ok: true, deleted: false };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return { ok: false, error: "Lesson no longer exists." };
    }
    console.error("saveNote error:", err);
    return { ok: false, error: "Could not save note." };
  }
}

export async function toggleBookmark(
  lessonId: string,
): Promise<{ ok: true; bookmarked: boolean } | { ok: false; error: string }> {
  const session = await requireSession();

  try {
    const existing = await prisma.bookmark.findUnique({
      where: { userId_lessonId: { userId: session.uid, lessonId } },
      select: { id: true },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      revalidatePath("/user-portal/watch");
      return { ok: true, bookmarked: false };
    }

    await prisma.bookmark.create({
      data: { userId: session.uid, lessonId },
    });
    revalidatePath("/user-portal/watch");
    return { ok: true, bookmarked: true };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return { ok: false, error: "Lesson no longer exists." };
    }
    console.error("toggleBookmark error:", err);
    return { ok: false, error: "Could not update bookmark." };
  }
}
