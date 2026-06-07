import { HeroMarqueeBackdrop } from "@/app/components/hero-marquee-backdrop";
import { HomeFeaturedCarousel } from "@/app/components/home-featured-carousel";
import { HomeBenefitsSection } from "@/app/components/home-benefits-section";
import { HomePodcastSection } from "@/app/components/home-podcast-section";
import { HomeTestimonialsSection } from "@/app/components/home-testimonials-section";
import {
  getPopularVideos,
  getNewlyAddedVideos,
} from "@/lib/server/popular-videos";
import { getHomePodcastGroups } from "@/lib/server/podcasts";

export default async function Home() {
  const [popularVideos, newlyAddedVideos, podcastGroups] = await Promise.all([
    getPopularVideos(),
    getNewlyAddedVideos(),
    getHomePodcastGroups(),
  ]);

  return (
    <main className="flex flex-1 flex-col font-sans">
      <HeroMarqueeBackdrop />
      <HomeFeaturedCarousel
        items={popularVideos}
        newlyAddedItems={newlyAddedVideos}
      />
      <HomeBenefitsSection />
      <HomeTestimonialsSection />
      <HomePodcastSection groups={podcastGroups} />
    </main>
  );
}
