import { HomeFeaturedCarousel } from "@/app/components/home-featured-carousel";
import { HomePodcastSection } from "@/app/components/home-podcast-section";
import {
  getPopularVideos,
  getNewlyAddedVideos,
} from "@/lib/server/popular-videos";
import { getHomePodcastGroups } from "@/lib/server/podcasts";

export default async function UserPortalLibraryPage() {
  const [popularVideos, newlyAddedVideos, podcastGroups] = await Promise.all([
    getPopularVideos(),
    getNewlyAddedVideos(),
    getHomePodcastGroups(),
  ]);

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-black font-sans text-white">
      <HomeFeaturedCarousel
        items={popularVideos}
        newlyAddedItems={newlyAddedVideos}
        heading="Play book of Burma"
        variant="embedded"
        showSeeAll={false}
      />
      <HomePodcastSection groups={podcastGroups} variant="embedded" withPlayer />
    </main>
  );
}
