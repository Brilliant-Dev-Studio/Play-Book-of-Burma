import { BackButton } from "@/app/components/back-button";
import { HomeFeaturedCarousel } from "@/app/components/home-featured-carousel";
import { HomeMembershipCta } from "@/app/components/home-membership-cta";
import { getNewlyAddedVideos } from "@/lib/server/popular-videos";

export default async function WatchAllPage() {
  const latestVideos = await getNewlyAddedVideos();

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-black font-sans text-white">
      <div className="mx-auto w-full max-w-[85%] px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <BackButton fallbackHref="/" />
      </div>
      <HomeFeaturedCarousel
        items={latestVideos}
        heading="Watch All Playbook of Burma"
        variant="embedded"
        showSeeAll={false}
      />
      <HomeMembershipCta variant="embedded" tightTop />
    </main>
  );
}
