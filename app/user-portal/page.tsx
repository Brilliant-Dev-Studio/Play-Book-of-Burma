import { prisma } from "@/lib/prisma";
import { presignGetUrl, PRESIGN_TTL } from "@/lib/server/s3";
import { UserPortalClient, type NewlyAddedItem } from "./user-portal-client";

export default async function UserPortalPage() {
  const videos = await prisma.video.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 15,
    select: {
      id: true,
      titleLine1: true,
      titleLine2: true,
      thumbnailKey: true,
      durationLabel: true,
      instructor: { select: { name: true, title: true } },
    },
  });

  const newlyAdded: NewlyAddedItem[] = await Promise.all(
    videos.map(async (v) => ({
      id: v.id,
      titleLine1: v.titleLine1,
      titleLine2: v.titleLine2 ?? "",
      instructorName: v.instructor.name,
      instructorTitle: v.instructor.title,
      duration: v.durationLabel,
      thumbnailUrl: await presignGetUrl(v.thumbnailKey, PRESIGN_TTL.image),
    })),
  );

  return <UserPortalClient newlyAdded={newlyAdded} />;
}
