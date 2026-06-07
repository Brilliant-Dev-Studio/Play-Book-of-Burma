"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/auth-helpers";
import { isAllowedKey } from "@/lib/server/s3";

export type PodcastFormInput = {
  id?: string;
  title: string;
  description: string;
  audioKey: string;
  thumbnailKey: string;
  season: number;
  episodeOrder: number;
  durationSeconds: number;
  durationLabel: string;
  popular: boolean;
  industryId: string;
};

type Result =
  | { ok: true; id: string }
  | { ok: false; errors: string[] };

function clean(input: PodcastFormInput): PodcastFormInput {
  return {
    ...input,
    title: input.title.trim(),
    description: input.description.trim(),
    audioKey: input.audioKey.trim(),
    thumbnailKey: input.thumbnailKey.trim(),
    durationLabel: input.durationLabel.trim(),
    industryId: input.industryId.trim(),
    season: Math.max(1, Math.floor(Number(input.season) || 1)),
    episodeOrder: Math.max(0, Math.floor(Number(input.episodeOrder) || 0)),
    durationSeconds: Math.max(0, Math.floor(Number(input.durationSeconds) || 0)),
  };
}

function validate(input: PodcastFormInput): string[] {
  const errors: string[] = [];
  if (!input.title) errors.push("Title is required.");
  if (!input.description) errors.push("Description is required.");
  if (!input.audioKey || !isAllowedKey(input.audioKey))
    errors.push("Audio upload is required.");
  if (!input.thumbnailKey || !isAllowedKey(input.thumbnailKey))
    errors.push("Thumbnail upload is required.");
  if (!input.industryId) errors.push("Industry is required.");
  return errors;
}

export async function savePodcast(input: PodcastFormInput): Promise<Result> {
  await requireAdmin();

  const cleaned = clean(input);
  const errors = validate(cleaned);
  if (errors.length > 0) return { ok: false, errors };

  const data = {
    title: cleaned.title,
    description: cleaned.description,
    audioKey: cleaned.audioKey,
    thumbnailKey: cleaned.thumbnailKey,
    season: cleaned.season,
    episodeOrder: cleaned.episodeOrder,
    durationSeconds: cleaned.durationSeconds,
    durationLabel: cleaned.durationLabel,
    popular: cleaned.popular,
    industryId: cleaned.industryId,
  };

  try {
    const row = cleaned.id
      ? await prisma.podcast.update({
          where: { id: cleaned.id },
          data,
          select: { id: true },
        })
      : await prisma.podcast.create({ data, select: { id: true } });

    revalidatePath("/admin/podcasts");
    return { ok: true, id: row.id };
  } catch (err) {
    console.error("savePodcast error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, errors: [`Could not save podcast: ${message}`] };
  }
}

export async function deletePodcast(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    await prisma.podcast.delete({ where: { id } });
    revalidatePath("/admin/podcasts");
    return { ok: true };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      return { ok: false, error: `Could not delete podcast (${err.code}).` };
    }
    return { ok: false, error: "Could not delete podcast." };
  }
}
