import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { presignGetUrl, PRESIGN_TTL } from "@/lib/server/s3";
import { PodcastsTable } from "@/app/admin/components/podcasts-table";

export default async function AdminPodcastsPage() {
  const podcasts = await prisma.podcast.findMany({
    orderBy: [{ season: "asc" }, { episodeOrder: "asc" }],
    select: {
      id: true,
      title: true,
      season: true,
      episodeOrder: true,
      durationLabel: true,
      popular: true,
      thumbnailKey: true,
      updatedAt: true,
    },
  });

  const rows = await Promise.all(
    podcasts.map(async (p) => ({
      id: p.id,
      title: p.title,
      season: p.season,
      episodeOrder: p.episodeOrder,
      durationLabel: p.durationLabel,
      popular: p.popular,
      thumbnailUrl: await presignGetUrl(p.thumbnailKey, PRESIGN_TTL.image),
      updatedAt: p.updatedAt.toISOString(),
    })),
  );

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-rwst-stack)] text-3xl font-bold tracking-tight text-white">
            Podcasts
          </h1>
          <p className="mt-1 text-sm text-white/55">
            Audio episodes organized by season.
          </p>
        </div>
        <Link
          href="/admin/podcasts/new"
          className="rounded-md bg-coral px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-coral/90"
        >
          + Upload Podcast
        </Link>
      </div>

      <PodcastsTable podcasts={rows} />
    </div>
  );
}
