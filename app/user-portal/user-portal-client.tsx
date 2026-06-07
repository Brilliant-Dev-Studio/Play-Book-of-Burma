"use client";

import { useCallback, useRef, useState } from "react";
import {
  UserPortalSidebar,
  type FilterGroup,
} from "@/app/components/user-portal-sidebar";
import { UserPortalPodcastSection } from "@/app/components/user-portal-podcast-section";
import type { UserPortalPodcastItem } from "@/lib/server/podcasts";

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

export type NewlyAddedItem = {
  id: string;
  thumbnailUrl: string;
  titleLine1: string;
  titleLine2: string;
  instructorName: string;
  instructorTitle: string;
  duration: string;
  playbook: string;
  industry: string;
  skillset: string;
};

export type ContinueWatchingItem = {
  videoId: string;
  lessonId: string;
  thumbnailUrl: string;
  durationLabel: string;
  progressPct: number;
  author: string;
  subtitle: string;
};

const PLAYBOOKS_INITIAL_VISIBLE = 3;
const PLAYBOOKS_LOAD_MORE_STEP = 6;

function filterPlaybooks(
  items: NewlyAddedItem[],
  selected: Set<string>,
  filterGroups: FilterGroup[],
): NewlyAddedItem[] {
  if (selected.size === 0) return items;
  const optionsByGroup = new Map<string, Set<string>>();
  for (const g of filterGroups) {
    const sel = g.options.filter((o) => selected.has(o));
    if (sel.length > 0) optionsByGroup.set(g.heading, new Set(sel));
  }
  if (optionsByGroup.size === 0) return items;
  return items.filter((v) => {
    for (const [heading, opts] of optionsByGroup) {
      const value =
        heading === "Industry"
          ? v.industry
          : heading === "Skillsets"
            ? v.skillset
            : heading === "Playbook"
              ? v.playbook
              : "";
      if (!opts.has(value)) return false;
    }
    return true;
  });
}

export function UserPortalClient({
  newlyAdded,
  allPlaybooks,
  filterGroups,
  continueWatching,
  podcasts,
}: {
  newlyAdded: NewlyAddedItem[];
  allPlaybooks: NewlyAddedItem[];
  filterGroups: FilterGroup[];
  continueWatching: ContinueWatchingItem[];
  podcasts: UserPortalPodcastItem[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(true);

  const hasActiveFilter = selected.size > 0;
  const filteredPlaybooks = filterPlaybooks(allPlaybooks, selected, filterGroups);

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
          filterGroups={filterGroups}
        />
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        {/* Filter toolbar — sticky on scroll; border spans full main width, content aligned with header container */}
        <div className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/85 backdrop-blur-md">
          <div className="flex w-full flex-wrap items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4 lg:px-10">
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
        <div className="flex min-h-0 w-full flex-1 flex-col px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
          {hasActiveFilter ? (
            <FilteredPlaybooksSection items={filteredPlaybooks} />
          ) : (
            <>
              <NewlyAddedSection items={newlyAdded} />
              <WatchAllPlaybooksSection items={allPlaybooks} />
              <ContinuesWatchingSection items={continueWatching} />
              <UserPortalPodcastSection items={podcasts} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function NewlyAddedSection({ items }: { items: NewlyAddedItem[] }) {
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
          <h2 className="font-roman-wood-slide-title text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
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

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] py-16 text-center text-white/55">
          No published videos yet.
        </div>
      ) : (
        <div
          ref={scrollerRef}
          className="overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex w-max snap-x snap-mandatory gap-4 pr-4 sm:gap-5 sm:pr-6 lg:pr-10">
            {items.map((item) => (
              <PlaybookVideoCard
                key={item.id}
                {...item}
                showNewBadge
                layout="carousel"
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function WatchAllPlaybooksSection({ items }: { items: NewlyAddedItem[] }) {
  const [visibleCount, setVisibleCount] = useState(PLAYBOOKS_INITIAL_VISIBLE);
  const visible = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return (
    <section className="mt-12 sm:mt-14 md:mt-16">
      <h2 className="mb-6 text-xl font-bold tracking-tight text-white sm:mb-8 sm:text-2xl md:text-3xl">
        Watch All the Playbooks
      </h2>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] py-16 text-center text-white/55">
          No published videos yet.
        </div>
      ) : (
        <>
          <PlaybookVideoGrid items={visible} />
          {hasMore && (
            <div className="mt-8 flex justify-center sm:mt-10">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((n) =>
                    Math.min(n + PLAYBOOKS_LOAD_MORE_STEP, items.length),
                  )
                }
                className="rounded-full border border-white/20 bg-white/[0.06] px-8 py-3 text-sm font-semibold text-white transition-colors hover:border-coral/40 hover:bg-coral/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function FilteredPlaybooksSection({ items }: { items: NewlyAddedItem[] }) {
  return (
    <section>
      <h2 className="mb-6 text-xl font-bold tracking-tight text-white sm:mb-8 sm:text-2xl md:text-3xl">
        Filtered Playbooks
      </h2>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] py-16 text-center text-white/55">
          No videos match your filters.
        </div>
      ) : (
        <PlaybookVideoGrid items={items} />
      )}
    </section>
  );
}

function PlaybookVideoGrid({ items }: { items: NewlyAddedItem[] }) {
  return (
    <div className="flex flex-wrap gap-4 sm:gap-5">
      {items.map((item) => (
        <PlaybookVideoCard key={item.id} {...item} layout="grid" />
      ))}
    </div>
  );
}

function PlaybookVideoCard({
  id,
  thumbnailUrl,
  titleLine1,
  titleLine2,
  instructorName,
  instructorTitle,
  duration,
  showNewBadge = false,
  layout = "carousel",
}: NewlyAddedItem & {
  showNewBadge?: boolean;
  layout?: "carousel" | "grid";
}) {
  const layoutClass =
    layout === "carousel"
      ? "w-[314px] shrink-0 snap-start sm:w-[354px] md:w-[362px]"
      : "w-[314px] sm:w-[354px] md:w-[362px]";

  return (
    <a
      href={`/user-portal/click-video-detail?video=${id}`}
      data-card
      className={`group flex flex-col overflow-hidden rounded-2xl border-2 border-white/45 bg-black outline-none transition-colors hover:border-white/65 focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-black ${layoutClass}`}
      aria-label={`${titleLine1} ${titleLine2}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06] motion-reduce:group-hover:scale-100"
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

        {showNewBadge && (
          <span
            className="absolute left-3 top-3 z-20 -rotate-3 rounded-full bg-coral px-3 py-1 text-sm font-bold italic text-white shadow-[0_4px_14px_rgba(236,113,71,0.5)] sm:left-4 sm:top-4"
            aria-label="Newly added"
          >
            New!
          </span>
        )}

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
            {`${titleLine1}${titleLine2 ? " " + titleLine2 : ""}`}
          </h3>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 pb-4 pt-4 text-center">
        <span className="h-[3px] w-12 shrink-0 bg-coral" aria-hidden />
        <p className="mt-2 text-sm font-semibold leading-snug text-white/90 sm:text-[15px]">
          <span className="block w-full truncate">{instructorName},</span>
          <span className="block w-full truncate">{instructorTitle}</span>
        </p>
        <p className="mt-1 w-full truncate text-xs font-medium text-white/70 sm:text-sm">
          {duration}
        </p>
      </div>
    </a>
  );
}

function ContinuesWatchingSection({
  items,
}: {
  items: ContinueWatchingItem[];
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

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] py-12 text-center text-white/55">
          Nothing in progress yet — start a lesson to see it here.
        </div>
      ) : (
        <div
          ref={scrollerRef}
          className="overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex w-max snap-x snap-mandatory gap-4 pr-4 sm:gap-5 sm:pr-6 lg:pr-10">
            {items.map((item) => (
              <ContinuesWatchingCard key={item.lessonId} {...item} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ContinuesWatchingCard({
  videoId,
  lessonId,
  thumbnailUrl,
  durationLabel,
  progressPct,
  author,
  subtitle,
}: ContinueWatchingItem) {
  return (
    <a
      href={`/user-portal/watch?video=${videoId}&lesson=${lessonId}`}
      data-cw-card
      className="group flex w-72 shrink-0 snap-start flex-col outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-80 md:w-88"
    >
      <div className="rounded-2xl border-2 border-white/45 p-[5px] transition-colors group-hover:border-white/65">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
          />
          <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/75 px-2 py-1 text-xs font-medium text-white">
            {durationLabel}
          </span>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-black/40">
            <div className="h-full bg-coral" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-base font-bold tracking-tight text-white">{author}</p>
        <p className="mt-1 text-sm text-white/70">{subtitle}</p>
      </div>
    </a>
  );
}
