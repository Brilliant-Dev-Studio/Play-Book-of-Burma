"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";

export type FeaturedItem = {
  id: string;
  titleLine1: string;
  titleLine2: string;
  instructorName: string;
  instructorTitle: string;
  duration: string;
  thumbnailUrl: string;
};

function FeaturedVideoCard({
  item,
  isFirst,
  isNew,
}: {
  item: FeaturedItem;
  isFirst?: boolean;
  isNew?: boolean;
}) {
  return (
    <Link
      href={`/click-video-detail?video=${item.id}`}
      data-card={isFirst ? true : undefined}
      className="group flex w-[314px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border-2 border-white/45 bg-black outline-none transition-colors hover:border-white/65 focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-[354px] md:w-[362px]"
      aria-label={`${item.titleLine1} ${item.titleLine2}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900">
        {isNew ? (
          <span
            className="absolute left-3 top-3 z-20 -rotate-3 rounded-full bg-coral px-3 py-1 text-sm font-bold italic text-white shadow-[0_4px_14px_rgba(236,113,71,0.5)] sm:left-4 sm:top-4"
            aria-label="Newly added"
          >
            New!
          </span>
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.thumbnailUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06] group-focus-within:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-within:scale-100"
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
          <h3 className="overflow-hidden text-ellipsis text-lg font-extrabold leading-snug tracking-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] sm:text-xl">
            {`${item.titleLine1}${item.titleLine2 ? " " + item.titleLine2 : ""}`}
          </h3>
        </div>
      </div>

      {/* Below the card — not over the image */}
      <div className="relative z-10 flex flex-col items-center px-4 pb-4 pt-4 text-center">
        <span className="h-[3px] w-12 shrink-0 bg-coral" aria-hidden />
        <p className="mt-2 text-sm font-semibold leading-snug text-white/90 sm:text-[15px]">
          <span className="block w-full truncate">{item.instructorName},</span>
          <span className="block w-full truncate">{item.instructorTitle}</span>
        </p>
        <p className="mt-1 w-full truncate text-xs font-medium text-white/70 sm:text-sm">
          {item.duration}
        </p>
      </div>
    </Link>
  );
}

type Tab = "popular" | "newlyAdded";

export function HomeFeaturedCarousel({
  items,
  newlyAddedItems,
  heading,
  variant = "default",
  showSeeAll = true,
}: {
  items: FeaturedItem[];
  /** When provided, a “Newly added” tab appears next to “Popular”. */
  newlyAddedItems?: FeaturedItem[];
  /** Page title shown above the tab row (e.g. Library page). */
  heading?: string;
  /** `embedded` = less top padding when not directly under the home hero. */
  variant?: "default" | "embedded";
  /** Hide “See All” when already on the full library view. */
  showSeeAll?: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>("popular");

  const hasTabs = Boolean(newlyAddedItems);
  const visibleItems =
    hasTabs && tab === "newlyAdded" ? newlyAddedItems ?? [] : items;

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
      : "bg-black pb-10 pt-20 md:pb-12 md:pt-24 lg:pb-14 lg:pt-28 xl:pb-16 xl:pt-32";

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
            {hasTabs ? (
              <button
                type="button"
                onClick={() => setTab("popular")}
                className={`font-semibold transition-colors ${
                  tab === "popular" ? "text-white" : "text-mist hover:text-white/90"
                }`}
              >
                Popular
              </button>
            ) : (
              <span className="font-semibold text-white">Popular</span>
            )}

            {hasTabs ? (
              <button
                type="button"
                onClick={() => setTab("newlyAdded")}
                className={`ml-5 font-semibold transition-colors sm:ml-8 ${
                  tab === "newlyAdded"
                    ? "text-white"
                    : "text-mist hover:text-white/90"
                }`}
              >
                Newly added
              </button>
            ) : null}

            {showSeeAll ? (
              <Link
                href="/watch-all"
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

      {visibleItems.length === 0 ? (
        <div className="mx-auto mt-8 w-full max-w-[85%] rounded-2xl border border-white/10 bg-white/[0.04] py-12 text-center text-white/55 sm:mt-10">
          {hasTabs && tab === "newlyAdded"
            ? "No newly added videos yet."
            : "No published videos yet."}
        </div>
      ) : (
        <div
          ref={scrollerRef}
          className={[
            "relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            variant === "embedded" ? "mt-6 md:mt-7" : "mt-8 md:mt-10",
          ].join(" ")}
        >
          <div className="flex w-max snap-x snap-mandatory gap-4 pl-[calc(7.5vw+1rem)] pr-[calc(7.5vw+1rem)] sm:gap-5 sm:pl-[calc(7.5vw+1.5rem)] sm:pr-[calc(7.5vw+1.5rem)] lg:pl-[calc(7.5vw+2rem)] lg:pr-[calc(7.5vw+2rem)]">
            {visibleItems.map((item, i) => (
              <FeaturedVideoCard
                key={item.id}
                item={item}
                isFirst={i === 0}
                isNew={hasTabs && tab === "newlyAdded"}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
