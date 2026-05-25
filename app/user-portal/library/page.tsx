import { HomeFeaturedCarousel } from "@/app/components/home-featured-carousel";
import { HomePodcastSection } from "@/app/components/home-podcast-section";

export default function UserPortalLibraryPage() {
  return (
    <main className="flex min-h-0 flex-1 flex-col bg-black font-sans text-white">
      <HomeFeaturedCarousel
        heading="Play book of Burma"
        variant="embedded"
      />
      <HomePodcastSection variant="embedded" />
    </main>
  );
}
