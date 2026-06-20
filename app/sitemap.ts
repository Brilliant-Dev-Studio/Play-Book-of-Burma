import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

const BASE_URL = "https://playbookofburma.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [latestVideo, latestPodcast] = await Promise.all([
    prisma.video.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: { publishedAt: true, createdAt: true },
    }),
    prisma.podcast.findFirst({
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  const videoDate = latestVideo?.publishedAt ?? latestVideo?.createdAt ?? new Date();
  const podcastDate = latestPodcast?.createdAt ?? new Date();
  const contentDate = videoDate > podcastDate ? videoDate : podcastDate;

  return [
    {
      url: BASE_URL,
      lastModified: contentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/library`,
      lastModified: contentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/membership`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/watch-all`,
      lastModified: videoDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}
