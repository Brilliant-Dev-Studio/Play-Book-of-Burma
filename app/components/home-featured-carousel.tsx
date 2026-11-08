"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
} from "@/app/components/carousel-chevrons";
const LOOP_COPIES = 3;

export type FeaturedItem = {
  id: string;
  titleLine1: string;
  titleLine2: string;
  instructorName: string;
  instructorTitle: string;
  duration: string;
  thumbnailUrl: string;
};

function videoDetailHref(videoId: string, detailBasePath: string) {
  return `${detailBasePath}?video=${videoId}`;
}

function FeaturedVideoCard({
  item,
  isNew,
  detailBasePath,
}: {
  item: FeaturedItem;
  isNew?: boolean;
  detailBasePath: string;
}) {
  return (
    <Link
      href={videoDetailHref(item.id, detailBasePath)}
      data-card
      draggable={false}
      className="group flex w-[314px] shrink-0 flex-col overflow-hidden rounded-2xl border-2 border-white/30 bg-black outline-none transition-colors hover:border-white/45 focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-[354px] md:w-[362px]"
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
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06] group-focus-within:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-within:scale-100"
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
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center opacity-0 scale-50 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-100 group-hover:opacity-50 group-focus-within:scale-100 group-focus-within:opacity-50 motion-reduce:scale-100 motion-reduce:opacity-50 motion-reduce:transition-none"
          aria-hidden
        >
          <span className="absolute h-11 w-11 rounded-full bg-coral/60 opacity-0 transition-opacity duration-500 group-hover:animate-ping group-hover:opacity-100 group-focus-within:animate-ping group-focus-within:opacity-100 motion-reduce:hidden sm:h-12 sm:w-12" />
          <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-coral text-black shadow-lg transition-transform duration-300 ease-out group-hover:scale-110 sm:h-12 sm:w-12">
            <span className="ml-0.5 text-2xl leading-none">▶</span>
          </span>
        </span>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-2 text-center sm:px-5 sm:pb-3">
          <h3 className="overflow-hidden text-ellipsis text-lg font-extrabold leading-snug tracking-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] sm:text-xl">
            {`${item.titleLine1}${item.titleLine2 ?? ""}`}
          </h3>
        </div>
      </div>

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

/**
 * Landing featured carousel.
 * - Left/Right buttons → scroll one card
 * - Cursor drag / trackpad / touch → native horizontal scroll
 * - Tripled track for seamless infinite loop
 */
export function HomeFeaturedCarousel({
  items,
  newlyAddedItems,
  heading,
  variant = "default",
  showSeeAll = true,
  newlyAddedViewAllHref,
  detailBasePath = "/click-video-detail",
}: {
  items: FeaturedItem[];
  newlyAddedItems?: FeaturedItem[];
  heading?: string;
  variant?: "default" | "embedded";
  showSeeAll?: boolean;
  newlyAddedViewAllHref?: string;
  /** Base path for card links — e.g. `/user-portal/click-video-detail`. */
  detailBasePath?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const ignoreScrollRef = useRef(false);
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startScroll: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);

  const [tab, setTab] = useState<Tab>("popular");

  const hasTabs = Boolean(newlyAddedItems);
  const visibleItems =
    hasTabs && tab === "newlyAdded" ? newlyAddedItems ?? [] : items;

  const getSetWidth = () => {
    const root = scrollerRef.current;
    if (!root) return 0;
    const sets = root.querySelectorAll<HTMLElement>("[data-loop-set]");
    if (sets.length < 2) return sets[0]?.offsetWidth ?? 0;
    return sets[1]!.offsetLeft - sets[0]!.offsetLeft;
  };

  const getStep = () => {
    const root = scrollerRef.current;
    if (!root) return 360;
    const card = root.querySelector<HTMLElement>("[data-card]");
    if (!card) return 360;
    const parent = card.parentElement;
    const gap = parent
      ? Number.parseFloat(getComputedStyle(parent).gap || "12") || 12
      : 12;
    return card.offsetWidth + gap;
  };

  const jump = (left: number) => {
    const root = scrollerRef.current;
    if (!root) return;
    ignoreScrollRef.current = true;
    root.scrollLeft = left;
    requestAnimationFrame(() => {
      ignoreScrollRef.current = false;
    });
  };

  const parkMiddle = () => {
    const w = getSetWidth();
    if (w > 0) jump(w);
  };

  useLayoutEffect(() => {
    parkMiddle();
    const a = window.setTimeout(parkMiddle, 80);
    const b = window.setTimeout(parkMiddle, 250);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, visibleItems.length]);

  // Infinite loop wrap (only when not dragging / jumping)
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || visibleItems.length === 0) return;

    const onScroll = () => {
      if (ignoreScrollRef.current || dragRef.current?.active) return;
      const w = getSetWidth();
      if (w <= 0) return;
      if (root.scrollLeft >= w * 2 - 2) jump(root.scrollLeft - w);
      else if (root.scrollLeft <= 2) jump(root.scrollLeft + w);
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, visibleItems.length]);

  /** Button: move one card left/right */
  const scrollByDir = (dir: -1 | 1) => {
    const root = scrollerRef.current;
    if (!root) return;
    const w = getSetWidth();
    if (w > 0 && root.scrollLeft < 4) jump(w);
    const step = getStep();
    root.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  /** Cursor drag swipe */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("a[data-card]")) return;
    const root = scrollerRef.current;
    if (!root) return;
    suppressClickRef.current = false;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startScroll: root.scrollLeft,
      moved: false,
    };
    root.setPointerCapture(e.pointerId);
    root.style.scrollBehavior = "auto";
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const root = scrollerRef.current;
    if (!drag?.active || !root) return;
    const dx = e.clientX - drag.startX;
    if (Math.abs(dx) > 6) {
      drag.moved = true;
      suppressClickRef.current = true;
    }
    root.scrollLeft = drag.startScroll - dx;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const root = scrollerRef.current;
    if (!drag?.active || !root) return;
    const didMove = drag.moved;
    dragRef.current = null;
    try {
      root.releasePointerCapture(e.pointerId);
    } catch {
      /* ok */
    }
    root.style.scrollBehavior = "";
    const w = getSetWidth();
    if (w > 0) {
      if (root.scrollLeft >= w * 2 - 2) jump(root.scrollLeft - w);
      else if (root.scrollLeft <= 2) jump(root.scrollLeft + w);
    }
    if (didMove) {
      // Keep suppress until after the click that follows pointerup
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (suppressClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const sectionPad =
    variant === "embedded"
      ? "bg-black pb-12 pt-4 sm:pb-14 sm:pt-5 md:pb-16 md:pt-6 lg:pb-20 lg:pt-8"
      : "bg-black pb-10 pt-20 md:pb-12 md:pt-24 lg:pb-14 lg:pt-28 xl:pb-16 xl:pt-32";

  const edgePad =
    "pl-[calc(10%+25px+1rem)] pr-[calc(10%+25px+1rem)] sm:pl-[calc(10%+25px+1.5rem)] sm:pr-[calc(10%+25px+1.5rem)] lg:pl-[calc(10%+25px+2rem)] lg:pr-[calc(10%+25px+2rem)]";

  return (
    <section className={sectionPad}>
      <div className="mx-auto w-full max-w-site px-4 sm:px-6 lg:px-8">
        {heading ? (
          <h1
            className={[
              "text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl",
              variant === "embedded" ? "mb-4 sm:mb-5" : "mb-6 sm:mb-8",
            ].join(" ")}
          >
            {heading}
          </h1>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-0 text-[15px] sm:text-base">
            {hasTabs ? (
              <button
                type="button"
                onClick={() => setTab("popular")}
                className={`transition-[color,font-weight] ${
                  tab === "popular"
                    ? "font-black text-white"
                    : "font-normal text-mist hover:text-white/90"
                }`}
              >
                Popular
              </button>
            ) : (
              <span className="font-black text-white">Popular</span>
            )}

            {hasTabs ? (
              <>
                <button
                  type="button"
                  onClick={() => setTab("newlyAdded")}
                  className={`ml-5 transition-[color,font-weight] sm:ml-8 ${
                    tab === "newlyAdded"
                      ? "font-black text-white"
                      : "font-normal text-mist hover:text-white/90"
                  }`}
                >
                  Newly added
                </button>
                {newlyAddedViewAllHref ? (
                  <Link
                    href={newlyAddedViewAllHref}
                    className="ml-3 font-medium text-coral transition-opacity hover:opacity-75 sm:ml-4"
                  >
                    View All
                  </Link>
                ) : null}
              </>
            ) : null}

            {showSeeAll ? (
              <Link
                href="/watch-all"
                className="ml-5 font-normal text-mist transition-colors hover:text-white/90 sm:ml-8"
              >
                See All
              </Link>
            ) : null}
          </div>

          {visibleItems.length > 0 ? (
            <div className="relative z-30 flex shrink-0 gap-2">
              <button
                type="button"
                aria-label="Previous"
                onClick={() => scrollByDir(-1)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/90 transition-colors hover:bg-white/[0.12] active:scale-95 sm:h-11 sm:w-11"
              >
                <IconChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => scrollByDir(1)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.1] text-white transition-colors hover:bg-white/[0.16] active:scale-95 sm:h-11 sm:w-11"
              >
                <IconChevronRight className="h-5 w-5" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {visibleItems.length === 0 ? (
        <div className="mx-auto mt-8 w-full max-w-site rounded-2xl border border-white/10 bg-white/[0.04] py-12 text-center text-white/55 sm:mt-10">
          {hasTabs && tab === "newlyAdded"
            ? "No newly added videos yet."
            : "No published videos yet."}
        </div>
      ) : (
        <div
          className={[
            "relative left-1/2 z-0 w-screen max-w-[100vw] -translate-x-1/2",
            variant === "embedded" ? "mt-6 md:mt-7" : "mt-8 md:mt-10",
          ].join(" ")}
        >
          <div
            ref={scrollerRef}
            className="w-full min-w-0 cursor-grab overflow-x-auto overscroll-x-contain active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: "touch" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onClickCapture={onClickCapture}
          >
            <div className={`flex w-max gap-3 pb-2 ${edgePad}`}>
              {Array.from({ length: LOOP_COPIES }, (_, copy) => (
                <div key={copy} data-loop-set className="flex gap-3">
                  {visibleItems.map((item) => (
                    <FeaturedVideoCard
                      key={`${copy}-${item.id}`}
                      item={item}
                      isNew={hasTabs && tab === "newlyAdded"}
                      detailBasePath={detailBasePath}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-[linear-gradient(90deg,#000_0%,rgba(0,0,0,0.92)_35%,rgba(0,0,0,0.45)_70%,transparent_100%)] sm:w-36 md:w-48 lg:w-56"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-[linear-gradient(270deg,#000_0%,rgba(0,0,0,0.92)_35%,rgba(0,0,0,0.45)_70%,transparent_100%)] sm:w-36 md:w-48 lg:w-56"
            aria-hidden
          />
        </div>
      )}
    </section>
  );
}
