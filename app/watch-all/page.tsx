import type { Metadata } from "next";
import { BackButton } from "@/app/components/back-button";
import { HomeFeaturedCarousel } from "@/app/components/home-featured-carousel";
import { HomeMembershipCta } from "@/app/components/home-membership-cta";
import { getNewlyAddedVideos } from "@/lib/server/popular-videos";
import { BreadcrumbJsonLd, VideoListJsonLd } from "@/app/components/json-ld";

export const revalidate = 3600; // presigned URLs last 4 h; refresh every 1 h

export const metadata: Metadata = {
  title: "Watch All",
  description:
    "Watch all video interviews from Playbook of Burma. Discover the latest business insights from Myanmar's most influential leaders.",
  alternates: { canonical: "https://playbookofburma.com/watch-all" },
  openGraph: {
    title: "Watch All | Playbook of Burma",
    description:
      "Watch all video interviews from Playbook of Burma. Discover the latest business insights from Myanmar's most influential leaders.",
    url: "https://playbookofburma.com/watch-all",
  },
};

export default async function WatchAllPage() {
  const latestVideos = await getNewlyAddedVideos();

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-black font-sans text-white">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Watch All", href: "/watch-all" },
        ]}
      />
      <VideoListJsonLd items={latestVideos} />
      <div className="mx-auto w-full max-w-[80%] px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
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
