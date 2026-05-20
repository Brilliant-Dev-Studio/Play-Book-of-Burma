"use client";

import Image, { type StaticImageData } from "next/image";
import { useCallback, useRef, useState } from "react";
import { UserPortalSidebar } from "@/app/components/user-portal-sidebar";
import courseThumb from "@/app/assets/benefits/Ray Dalio - 1.png";
import { UserPortalPodcastSection } from "@/app/components/user-portal-podcast-section";

function IconFilter({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 6h18M6 12h12M10 18h4" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

type NewlyAddedItem = {
  image: StaticImageData;
  titleLine1: string;
  titleLine2: string;
  metaLine1: string;
  metaLine2: string;
  duration: string;
};

const NEWLY_ADDED: NewlyAddedItem[] = Array.from({ length: 8 }, () => ({
  image: courseThumb,
  titleLine1: "Learn Finance in 21 Day,",
  titleLine2: "Become Master at it",
  metaLine1: "Ko Jason Myint,",
  metaLine2: "CEO of BYD By Essentials",
  duration: "1 hour 15 minutes",
}));

type ContinuesWatchingItem = {
  image: StaticImageData;
  duration: string;
  progressPct: number;
  author: string;
  subtitle: string;
};

const CONTINUE_WATCHING: ContinuesWatchingItem[] = Array.from({ length: 6 }, () => ({
  image: courseThumb,
  duration: "16:36",
  progressPct: 35,
  author: "Ko Jason Myint",
  subtitle: "Financial Management | Lesson 2 of 10",
}));

export default function UserPortalPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(true);

  function toggle(option: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(option)) next.delete(option);
      else next.add(option);
      return next;
    });
  }

  function clearAll() {
    setSelected(new Set());
  }

  const selectedArray = Array.from(selected);
  const totalSelected = selected.size;

  return (
    <div className="flex min-h-0 flex-1 overflow-x-clip bg-black">
      {isOpen && (
        <UserPortalSidebar
          selected={selected}
          onToggle={toggle}
          onClearAll={clearAll}
          onClose={() => setIsOpen(false)}
        />
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        {/* Filter toolbar — sticky on scroll; border spans full main width, content aligned with header container */}
        <div className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/85 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-[85%] flex-wrap items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4 lg:px-8">
            <button
              type="button"
              onClick={() => setIsOpen((o) => !o)}
              aria-expanded={isOpen}
              className="hidden items-center gap-2 rounded-md border border-white/15 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral lg:inline-flex"
            >
              <IconFilter className="h-4 w-4 text-coral" />
              <span>{isOpen ? "Hide Filters" : "Show Filters"}</span>
              {totalSelected > 0 && (
                <span className="ml-1 rounded-full bg-coral/20 px-2 py-0.5 text-[10px] font-bold text-coral">
                  {totalSelected}
                </span>
              )}
            </button>

            {totalSelected === 0 ? (
              <span className="text-sm text-white/50">No filters applied</span>
            ) : (
              <>
                <ul className="flex flex-wrap items-center gap-2">
                  {selectedArray.map((option) => (
                    <li key={option}>
                      <button
                        type="button"
                        onClick={() => toggle(option)}
                        className="group/chip flex items-center gap-1.5 rounded-full border border-coral/30 bg-coral/10 py-1 pl-3 pr-1.5 text-xs font-semibold text-white transition-colors hover:border-coral/50 hover:bg-coral/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
                        aria-label={`Remove ${option} filter`}
                      >
                        <span>{option}</span>
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-coral/30 text-coral group-hover/chip:bg-coral/50">
                          <IconX className="h-2.5 w-2.5" />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                {totalSelected > 1 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="ml-1 text-xs font-medium text-white/60 underline decoration-white/30 underline-offset-2 transition-colors hover:text-coral hover:decoration-coral/50"
                  >
                    Clear all
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Page body — aligned with header container */}
        <div className="mx-auto flex min-h-0 w-full max-w-[85%] flex-1 flex-col px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <NewlyAddedSection sidebarOpen={isOpen} />
          <ContinuesWatchingSection sidebarOpen={isOpen} />
          <UserPortalPodcastSection />
        </div>
      </main>
    </div>
  );
}

function NewlyAddedSection({
  sidebarOpen = false,
}: {
  sidebarOpen?: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByDir = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>("[data-card]");
    const gapSource = firstCard?.parentElement ?? el;
    const gap = Number.parseFloat(getComputedStyle(gapSource).gap || "0");
    const step = firstCard ? firstCard.offsetWidth + gap : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl">
            If you Dream Big, Will you give us 15 mins a day to change your life?
          </h2>
          <p className="mt-2 text-base font-bold text-white sm:text-lg">
            Newly Added to your playbooks
          </p>
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

      <div
        ref={scrollerRef}
        className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div
          className={`flex w-max snap-x snap-mandatory gap-4 pl-[calc(7.5vw+1rem)] pr-[calc(7.5vw+1rem)] sm:gap-5 sm:pl-[calc(7.5vw+1.5rem)] sm:pr-[calc(7.5vw+1.5rem)] ${
            sidebarOpen
              ? "lg:pl-[calc(7.65rem+7.5vw+2rem)] lg:pr-[calc(7.65rem+7.5vw+2rem)]"
              : "lg:pl-[calc(7.5vw+2rem)] lg:pr-[calc(7.5vw+2rem)]"
          }`}
        >
          {NEWLY_ADDED.map((item, i) => (
            <NewlyAddedCard key={i} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function NewlyAddedCard({
  image,
  titleLine1,
  titleLine2,
  metaLine1,
  metaLine2,
  duration,
}: NewlyAddedItem) {
  return (
    <a
      href="/user-portal/watch"
      data-card
      className="group flex w-[260px] shrink-0 snap-start flex-col outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-[300px] md:w-[320px]"
      aria-label={`${titleLine1} ${titleLine2}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-2xl bg-zinc-900 shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
        <Image
          src={image}
          alt=""
          fill
          className="rounded-t-2xl object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06] motion-reduce:group-hover:scale-100"
          sizes="(max-width: 640px) 260px, (max-width: 1024px) 300px, 320px"
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

        {/* "New!" stamp — top-left */}
        <span
          className="absolute left-3 top-3 z-20 -rotate-3 rounded-full bg-coral px-3 py-1 text-sm font-bold italic text-white shadow-[0_4px_14px_rgba(236,113,71,0.5)] sm:left-4 sm:top-4"
          aria-label="Newly added"
        >
          New!
        </span>

        <span
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
          aria-hidden
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-coral text-black shadow-lg transition-transform group-hover:scale-105 sm:h-12 sm:w-12">
            <span className="ml-0.5 text-2xl leading-none">▶</span>
          </span>
        </span>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-2 text-center sm:px-5 sm:pb-3">
          <h3 className="overflow-hidden text-ellipsis text-base font-bold leading-snug tracking-tight text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] sm:text-lg">
            {`${titleLine1} ${titleLine2}`}
          </h3>
        </div>
      </div>

      <div className="-mt-0.5 relative z-10 flex flex-col items-center px-1 text-center">
        <span className="h-[3px] w-12 shrink-0 bg-coral" aria-hidden />
        <p className="mt-1.5 text-sm leading-snug text-white/90">
          <span className="block w-full truncate">{metaLine1}</span>
          <span className="block w-full truncate">{metaLine2}</span>
        </p>
        <p className="mt-1 w-full truncate text-xs text-white/70 sm:text-sm">
          {duration}
        </p>
      </div>
    </a>
  );
}

function ContinuesWatchingSection({
  sidebarOpen = false,
}: {
  sidebarOpen?: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByDir = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>("[data-cw-card]");
    const gapSource = firstCard?.parentElement ?? el;
    const gap = Number.parseFloat(getComputedStyle(gapSource).gap || "0");
    const step = firstCard ? firstCard.offsetWidth + gap : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  return (
    <section className="mt-12 sm:mt-14 md:mt-16">
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
          Continues Watching
        </h2>
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

      <div
        ref={scrollerRef}
        className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div
          className={`flex w-max snap-x snap-mandatory gap-4 pl-[calc(7.5vw+1rem)] pr-[calc(7.5vw+1rem)] sm:gap-5 sm:pl-[calc(7.5vw+1.5rem)] sm:pr-[calc(7.5vw+1.5rem)] ${
            sidebarOpen
              ? "lg:pl-[calc(7.65rem+7.5vw+2rem)] lg:pr-[calc(7.65rem+7.5vw+2rem)]"
              : "lg:pl-[calc(7.5vw+2rem)] lg:pr-[calc(7.5vw+2rem)]"
          }`}
        >
          {CONTINUE_WATCHING.map((item, i) => (
            <ContinuesWatchingCard key={i} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ContinuesWatchingCard({
  image,
  duration,
  progressPct,
  author,
  subtitle,
}: ContinuesWatchingItem) {
  return (
    <a
      href="/user-portal/watch"
      data-cw-card
      className="group flex w-72 shrink-0 snap-start flex-col outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-80 md:w-88"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-zinc-900">
        <Image
          src={image}
          alt=""
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
          sizes="(max-width: 640px) 288px, (max-width: 1024px) 320px, 352px"
        />
        <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/75 px-2 py-1 text-xs font-medium text-white">
          {duration}
        </span>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/40">
          <div className="h-full bg-coral" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-base font-bold tracking-tight text-white">{author}</p>
        <p className="mt-1 text-sm text-white/70">{subtitle}</p>
      </div>
    </a>
  );
}

