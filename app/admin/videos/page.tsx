import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { presignGetUrl, PRESIGN_TTL } from "@/lib/server/s3";
import { VideosTable } from "@/app/admin/components/videos-table";

export default async function AdminVideosPage() {
  const videos = await prisma.video.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      type: true,
      industry: { select: { name: true } },
      skillset: { select: { name: true } },
      titleLine1: true,
      titleLine2: true,
      thumbnailKey: true,
      durationLabel: true,
      status: true,
      updatedAt: true,
    },
  });

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-rwst-stack)] text-3xl font-bold tracking-tight text-white">
            Videos
          </h1>
          <p className="mt-1 text-sm text-white/55">
            Manage published content for the Client Portal.
          </p>
        </div>
        <Link
          href="/admin/videos/new"
          className="rounded-md bg-coral px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-coral/90"
        >
          + Upload Video
        </Link>
      </div>

      <VideosTable
        videos={await Promise.all(
          videos.map(async (v) => ({
            id: v.id,
            type: v.type,
            industry: v.industry.name,
            skillset: v.skillset.name,
            titleLine1: v.titleLine1,
            titleLine2: v.titleLine2,
            durationLabel: v.durationLabel,
            status: v.status,
            updatedAt: v.updatedAt.toISOString(),
            thumbnailUrl: await presignGetUrl(v.thumbnailKey, PRESIGN_TTL.image),
          })),
        )}
      />
    </div>
  );
}
