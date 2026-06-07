import { VideoDetail } from "./video-detail";

export default async function ClickVideoDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ video?: string }>;
}) {
  const { video } = await searchParams;
  return (
    <VideoDetail videoId={video} variant="landing" basePath="/click-video-detail" />
  );
}
