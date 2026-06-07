import { VideoDetail } from "@/app/click-video-detail/video-detail";

export default async function PortalClickVideoDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ video?: string }>;
}) {
  const { video } = await searchParams;
  return (
    <VideoDetail
      videoId={video}
      variant="portal"
      basePath="/user-portal/click-video-detail"
    />
  );
}
