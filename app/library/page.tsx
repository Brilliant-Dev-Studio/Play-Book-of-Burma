import type { Metadata } from "next";
import { HomeFeaturedCarousel } from "@/app/components/home-featured-carousel";
import { HomeMembershipCta } from "@/app/components/home-membership-cta";
import { HomePodcastSection } from "@/app/components/home-podcast-section";
import {
  getPopularVideos,
  getNewlyAddedVideos,
} from "@/lib/server/popular-videos";
import { getHomePodcastGroups } from "@/lib/server/podcasts";
import { BreadcrumbJsonLd } from "@/app/components/json-ld";

export const revalidate = 3600; // presigned URLs last 4 h; refresh every 1 h

export const metadata: Metadata = {
  title: "Library",
  description:
    "Browse all videos and podcasts on Playbook of Burma. Watch exclusive interviews with Myanmar's top founders, CEOs, and business experts.",
  alternates: { canonical: "https://playbookofburma.com/library" },
  openGraph: {
    title: "Library | Playbook of Burma",
    description:
      "Browse all videos and podcasts on Playbook of Burma. Watch exclusive interviews with Myanmar's top founders, CEOs, and business experts.",
    url: "https://playbookofburma.com/library",
  },
};

export default async function LibraryPage() {
  const [popularVideos, newlyAddedVideos, podcastGroups] = await Promise.all([
    getPopularVideos(),
    getNewlyAddedVideos(),
    getHomePodcastGroups(),
  ]);

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-black font-sans text-white">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Library", href: "/library" },
        ]}
      />
      <HomeFeaturedCarousel
        items={popularVideos}
        newlyAddedItems={newlyAddedVideos}
        heading="Play book of Burma"
        variant="embedded"
        showSeeAll={false}
      />
      <HomePodcastSection groups={podcastGroups} variant="embedded" />
      <HomeMembershipCta variant="embedded" />
    </main>
  );
}
