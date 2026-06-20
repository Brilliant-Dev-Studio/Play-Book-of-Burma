"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/server/auth-helpers";

export async function savePodcastProgress(
  podcastId: string,
  currentSeconds: number,
  durationSeconds: number,
): Promise<void> {
  const session = await requireSession();

  const cur = Math.max(0, Math.floor(currentSeconds || 0));
  const dur = Math.max(0, Math.floor(durationSeconds || 0));
  const completed = dur > 0 && (cur >= dur - 5 || cur / dur >= 0.95);

  await prisma.podcastProgress.upsert({
    where: { userId_podcastId: { userId: session.uid, podcastId } },
    create: {
      userId: session.uid,
      podcastId,
      currentSeconds: cur,
      durationSeconds: dur,
      completedAt: completed ? new Date() : null,
    },
    update: {
      currentSeconds: cur,
      durationSeconds: dur,
      completedAt: completed ? new Date() : null,
      lastListenedAt: new Date(),
    },
  });
}
