import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { presignGetUrl, PRESIGN_TTL } from "@/lib/server/s3";
import {
  PodcastUploadForm,
  type PodcastFormInitial,
} from "@/app/admin/components/podcast-upload-form";

export default async function EditPodcastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [podcast, industries] = await Promise.all([
    prisma.podcast.findUnique({ where: { id } }),
    prisma.industry.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);
  if (!podcast) notFound();

  const [thumbnailUrl, audioUrl] = await Promise.all([
    presignGetUrl(podcast.thumbnailKey, PRESIGN_TTL.image),
    presignGetUrl(podcast.audioKey, PRESIGN_TTL.video),
  ]);

  const initial: PodcastFormInitial = {
    id: podcast.id,
    title: podcast.title,
    description: podcast.description,
    audioKey: podcast.audioKey,
    audioUrl,
    thumbnailKey: podcast.thumbnailKey,
    thumbnailUrl,
    season: podcast.season,
    episodeOrder: podcast.episodeOrder,
    durationSeconds: podcast.durationSeconds,
    durationLabel: podcast.durationLabel,
    popular: podcast.popular,
    industryId: podcast.industryId,
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-rwst-stack)] text-3xl font-bold tracking-tight text-white">
          Edit Podcast
        </h1>
        <p className="mt-1 text-sm text-white/55">
          Update audio, metadata, and season placement.
        </p>
      </div>
      <PodcastUploadForm mode="edit" initial={initial} industries={industries} />
    </div>
  );
}
