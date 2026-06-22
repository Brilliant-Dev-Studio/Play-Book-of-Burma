import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { presignGetUrl, PRESIGN_TTL } from "@/lib/server/s3";
import {
  VideoUploadForm,
  type VideoFormInitial,
} from "@/app/admin/components/video-upload-form";

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [video, instructors, industries, skillsets] = await Promise.all([
    prisma.video.findUnique({
      where: { id },
      include: {
        lessons: { orderBy: { order: "asc" } },
        skillsetItems: { orderBy: { order: "asc" } },
      },
    }),
    prisma.instructor.findMany({
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true, title: true },
    }),
    prisma.industry.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.skillset.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  if (!video) notFound();

  const initial: VideoFormInitial = {
    id: video.id,
    type: video.type,
    playbook: video.playbook,
    industryId: video.industryId,
    skillsetId: video.skillsetId,
    titleLine1: video.titleLine1,
    titleLine2: video.titleLine2 ?? undefined,
    description: video.description,
    instructorId: video.instructorId,
    thumbnailKey: video.thumbnailKey,
    thumbnailUrl: await presignGetUrl(video.thumbnailKey, PRESIGN_TTL.image),
    trailerKey: video.trailerKey ?? undefined,
    trailerUrl: video.trailerKey
      ? await presignGetUrl(video.trailerKey, PRESIGN_TTL.video)
      : undefined,
    trailerThumbnailKey: video.trailerThumbnailKey ?? undefined,
    trailerThumbnailUrl: video.trailerThumbnailKey
      ? await presignGetUrl(video.trailerThumbnailKey, PRESIGN_TTL.image)
      : undefined,
    guidebookKey: video.guidebookKey ?? undefined,
    guidebookCoverKey: video.guidebookCoverKey ?? undefined,
    guidebookCoverUrl: video.guidebookCoverKey
      ? await presignGetUrl(video.guidebookCoverKey, PRESIGN_TTL.image)
      : undefined,
    durationSeconds: video.durationSeconds,
    durationLabel: video.durationLabel,
    status: video.status,
    lessons: await Promise.all(
      video.lessons.map(async (l) => ({
        title: l.title,
        videoKey: l.videoKey,
        videoUrl: await presignGetUrl(l.videoKey, PRESIGN_TTL.video),
        durationSeconds: l.durationSeconds,
        durationLabel: l.durationLabel,
        details: l.details,
      })),
    ),
    skillsetItems: video.skillsetItems.map((s) => ({
      title: s.title,
      description: s.description,
      imageKey: s.imageKey,
    })),
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6">
        <h1 className="font-(family-name:--font-rwst-stack) text-3xl font-bold tracking-tight text-white">
          Edit Video
        </h1>
        <p className="mt-1 text-sm text-white/55">
          Update content for the Client Portal.
        </p>
      </div>
      <VideoUploadForm
        mode="edit"
        initial={initial}
        instructors={instructors}
        industries={industries}
        skillsets={skillsets}
      />
    </div>
  );
}
