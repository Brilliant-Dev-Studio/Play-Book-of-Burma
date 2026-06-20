export const revalidate = 3600; // presigned URLs last 4 h; refresh every 1 h

import type { Metadata } from "next";
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
import {
  OrganizationJsonLd,
  WebSiteJsonLd,
  VideoListJsonLd,
  PodcastListJsonLd,
} from "@/app/components/json-ld";

const SITE_URL = "https://playbookofburma.com";

export const metadata: Metadata = {
  title: {
    absolute: "Playbook of Burma — Myanmar Business Insights",
  },
  description:
    "Watch exclusive video interviews and listen to podcasts with Myanmar's top founders, CEOs, and business experts. Join our membership for full access.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Playbook of Burma — Myanmar Business Insights",
    description:
      "Watch exclusive video interviews and listen to podcasts with Myanmar's top founders, CEOs, and business experts.",
    images: [
      {
        url: "/social.png",
        width: 1200,
        height: 630,
        alt: "Playbook of Burma",
      },
    ],
  },
};

export default async function Home() {
  const [popularVideos, newlyAddedVideos, podcastGroups] = await Promise.all([
    getPopularVideos(),
    getNewlyAddedVideos(),
    getHomePodcastGroups(),
  ]);

  const allPodcastItems = podcastGroups.flatMap((g) => g.items);

  return (
    <main className="flex flex-1 flex-col font-sans">
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <VideoListJsonLd items={popularVideos} />
      <PodcastListJsonLd items={allPodcastItems} />
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
