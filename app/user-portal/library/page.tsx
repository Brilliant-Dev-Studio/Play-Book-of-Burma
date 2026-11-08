import { HomeFeaturedCarousel } from "@/app/components/home-featured-carousel";
import { HomePodcastSection } from "@/app/components/home-podcast-section";
import { UserPortalShell } from "@/app/components/user-portal-shell";
import {
  getPopularVideos,
  getNewlyAddedVideos,
} from "@/lib/server/popular-videos";
import { getHomePodcastGroups } from "@/lib/server/podcasts";
import { getUserPortalFilterGroups } from "@/lib/server/user-portal-filters";

export default async function UserPortalLibraryPage() {
  const [popularVideos, newlyAddedVideos, podcastGroups, filterGroups] =
    await Promise.all([
      getPopularVideos(),
      getNewlyAddedVideos(),
      getHomePodcastGroups(),
      getUserPortalFilterGroups(),
    ]);

  return (
    <UserPortalShell filterGroups={filterGroups}>
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
    </UserPortalShell>
  );
}
