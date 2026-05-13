import { HeroMarqueeBackdrop } from "@/app/components/hero-marquee-backdrop";
import { HomeFeaturedCarousel } from "@/app/components/home-featured-carousel";
import { HomeBenefitsSection } from "@/app/components/home-benefits-section";
import { HomePodcastSection } from "@/app/components/home-podcast-section";
import { HomeTestimonialsSection } from "@/app/components/home-testimonials-section";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col font-sans">
      <HeroMarqueeBackdrop />
      <HomeFeaturedCarousel />
      <HomeBenefitsSection />
      <HomeTestimonialsSection />
      <HomePodcastSection />
    </main>
  );
}
