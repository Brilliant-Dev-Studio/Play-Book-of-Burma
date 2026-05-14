"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import popularCardThumb from "@/app/assets/benefits/Ray Dalio - 1.png";

const CARD = {
  titleLine1: "Learn Finance in 21 Day,",
  titleLine2: "Become Master at it",
  metaLine1: "Ko Jason Myint, CEO of",
  metaLine2: "BYD By Essentials",
  duration: "1 hour 15 minutes",
} as const;

const CARD_COUNT = 6;

function FeaturedVideoCard({ isFirst }: { isFirst?: boolean }) {
  return (
    <Link
      href="/click-video-detail"
      data-card={isFirst ? true : undefined}
      className="group flex w-[284px] shrink-0 snap-start flex-col outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-[324px] md:w-[332px]"
      aria-label={`${CARD.titleLine1} ${CARD.titleLine2}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-2xl bg-zinc-900 shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
        <Image
          src={popularCardThumb}
          alt=""
          fill
          className="rounded-t-2xl object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06] group-focus-within:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-within:scale-100"
          sizes="(max-width: 640px) 288px, 320px"
        />

        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.72)_22%,rgba(0,0,0,0.35)_45%,rgba(0,0,0,0.12)_62%,transparent_78%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] backdrop-blur-[1.5px]"
          style={{
            maskImage:
              "linear-gradient(to top, black 0%, black 35%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, black 35%, transparent 100%)",
          }}
          aria-hidden
        />

        <span
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
          aria-hidden
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-coral text-black shadow-lg transition-transform group-hover:scale-105 sm:h-12 sm:w-12">
            <span className="ml-0.5 text-2xl leading-none">▶</span>
          </span>
        </span>

        {/* Title only — on the card / over the fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-2 text-center sm:px-5 sm:pb-3">
          <h3 className="overflow-hidden text-ellipsis text-base font-bold leading-snug tracking-tight text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] sm:text-lg">
            {`${CARD.titleLine1} ${CARD.titleLine2}`}
          </h3>
        </div>
      </div>

      {/* Below the card — not over the image */}
      <div className="-mt-0.5 relative z-10 flex flex-col items-center px-1 text-center">
        <span className="h-[3px] w-12 shrink-0 bg-coral" aria-hidden />
        <p className="mt-1.5 text-sm leading-snug text-white/90">
          <span className="block w-full truncate">{CARD.metaLine1}</span>
          <span className="block w-full truncate">{CARD.metaLine2}</span>
        </p>
        <p className="mt-1 w-full truncate text-xs text-white/70 sm:text-sm">
          {CARD.duration}
        </p>
      </div>
    </Link>
  );
}

export function HomeFeaturedCarousel({
  heading,
  variant = "default",
  showSeeAll = true,
}: {
  /** Page title shown above the tab row (e.g. Library page). */
  heading?: string;
  /** `embedded` = less top padding when not directly under the home hero. */
  variant?: "default" | "embedded";
  /** Hide “See All” when already on the full library view. */
  showSeeAll?: boolean;
} = {}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"Popular" | "Coming Soon">(
    "Popular",
  );

  const scrollByDir = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>("[data-card]");
    const gap = Number.parseFloat(getComputedStyle(el).gap || "0");
    const step = firstCard
      ? firstCard.offsetWidth + gap
      : Math.min(360, el.clientWidth * 0.85);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  const sectionPad =
    variant === "embedded"
      ? "bg-black pb-12 pt-4 sm:pb-14 sm:pt-5 md:pb-16 md:pt-6 lg:pb-20 lg:pt-8"
      : "bg-black pb-16 pt-32 md:pb-20 md:pt-40 lg:pb-24 lg:pt-48 xl:pb-28 xl:pt-56";

  return (
    <section className={sectionPad}>
      <div className="mx-auto w-full max-w-[85%] px-4 sm:px-6 lg:px-8">
        {heading ? (
          <h1
            className={[
              "text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl",
              variant === "embedded"
                ? "mb-4 sm:mb-5"
                : "mb-6 sm:mb-8",
            ].join(" ")}
          >
            {heading}
          </h1>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-0 text-sm sm:text-[15px]">
            <button
              type="button"
              onClick={() => setActiveTab("Popular")}
              className={`font-semibold transition-colors ${
                activeTab === "Popular"
                  ? "text-white"
                  : "font-medium text-mist hover:text-white/85"
              }`}
            >
              Popular
            </button>
            <span
              className="mx-3 h-4 w-px shrink-0 bg-white/25 sm:mx-4"
              aria-hidden
            />
            <button
              type="button"
              onClick={() => setActiveTab("Coming Soon")}
              className={`transition-colors ${
                activeTab === "Coming Soon"
                  ? "font-semibold text-white"
                  : "font-medium text-mist hover:text-white/85"
              }`}
            >
              Coming Soon
            </button>
            {showSeeAll ? (
              <Link
                href="/library"
                className="ml-5 font-medium text-mist transition-colors hover:text-white/90 sm:ml-8"
              >
                See All
              </Link>
            ) : null}
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scrollByDir(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-lg text-white/90 transition-colors hover:bg-white/[0.12] sm:h-11 sm:w-11"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scrollByDir(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.1] text-lg text-white transition-colors hover:bg-white/[0.16] sm:h-11 sm:w-11"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Full-bleed track: cards scroll into viewport edges; insets align row 0 with max-w-[85%] + page padding */}
      <div
        ref={scrollerRef}
        className={[
          "relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          variant === "embedded" ? "mt-6 md:mt-7" : "mt-8 md:mt-10",
        ].join(" ")}
      >
        <div className="flex w-max snap-x snap-mandatory gap-4 pl-[calc(7.5vw+1rem)] pr-[calc(7.5vw+1rem)] sm:gap-5 sm:pl-[calc(7.5vw+1.5rem)] sm:pr-[calc(7.5vw+1.5rem)] lg:pl-[calc(7.5vw+2rem)] lg:pr-[calc(7.5vw+2rem)]">
          {Array.from({ length: CARD_COUNT }, (_, i) => (
            <FeaturedVideoCard key={i} isFirst={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
