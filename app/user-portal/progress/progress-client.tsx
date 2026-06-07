"use client";

import { useCallback, useRef } from "react";

export type BookmarkItem = {
  videoId: string;
  lessonId: string;
  thumbnailUrl: string;
  durationLabel: string;
  instructorName: string;
  videoTitle: string;
  lessonOrder: number;
  totalLessons: number;
};

export type NoteItemData = {
  videoId: string;
  lessonId: string;
  instructorPhotoUrl: string;
  instructorName: string;
  videoTitle: string;
  lessonOrder: number;
  totalLessons: number;
  preview: string;
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

export type PlaybookAchievedItem = {
  videoId: string;
  thumbnailUrl: string;
  titleLine1: string;
  titleLine2: string;
  metaLine1: string;
  metaLine2: string;
  duration: string;
};

export function ProgressClient({
  bookmarks,
  notes,
  continueWatching,
  achieved,
}: {
  bookmarks: BookmarkItem[];
  notes: NoteItemData[];
  continueWatching: ContinueWatchingItem[];
  achieved: PlaybookAchievedItem[];
}) {
  return (
    <main className="min-h-0 flex-1 bg-black">
      <div className="mx-auto w-full max-w-[85%] px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <ContinuesWatchingSection items={continueWatching} />
        <YourNotesSection items={notes} />
        <YourBookmarksSection items={bookmarks} />
        <PlaybookAchievedSection items={achieved} />
      </div>
    </main>
  );
}

function ContinuesWatchingSection({ items }: { items: ContinueWatchingItem[] }) {
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
      data-card
      className="group flex w-80 shrink-0 snap-start flex-col outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-95 md:w-105"
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

function YourBookmarksSection({ items }: { items: BookmarkItem[] }) {
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
    <section className="mt-12 sm:mt-14 md:mt-16">
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
          Your Bookmarks
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
          You haven&apos;t bookmarked any lessons yet.
        </div>
      ) : (
        <div
          ref={scrollerRef}
          className="overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex w-max snap-x snap-mandatory gap-4 pr-4 sm:gap-5 sm:pr-6 lg:pr-10">
            {items.map((item) => (
              <BookmarkCard key={item.lessonId} {...item} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function BookmarkCard({
  videoId,
  lessonId,
  thumbnailUrl,
  durationLabel,
  instructorName,
  videoTitle,
  lessonOrder,
  totalLessons,
}: BookmarkItem) {
  return (
    <a
      href={`/user-portal/watch?video=${videoId}&lesson=${lessonId}`}
      data-card
      className="group flex w-80 shrink-0 snap-start flex-col outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-95 md:w-105"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-zinc-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
        />
        <span
          className="absolute right-3 top-0 z-10 text-coral drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:right-4"
          aria-label="Bookmarked"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-8 w-8 sm:h-9 sm:w-9"
            aria-hidden
          >
            <path d="M6 3.75c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125V21l-6-3.75L6 21V3.75z" />
          </svg>
        </span>
        <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/75 px-2 py-1 text-xs font-medium text-white">
          {durationLabel}
        </span>
      </div>
      <div className="mt-3">
        <p className="text-base font-bold tracking-tight text-white">{instructorName}</p>
        <p className="mt-1 text-sm text-white/70">
          {videoTitle} | Lesson {lessonOrder} of {totalLessons}
        </p>
      </div>
    </a>
  );
}

function YourNotesSection({ items }: { items: NoteItemData[] }) {
  return (
    <section className="mt-12 sm:mt-14 md:mt-16">
      <h2 className="mb-5 text-xl font-bold tracking-tight text-white sm:mb-6 sm:text-2xl md:text-3xl">
        Your Notes
      </h2>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] py-12 text-center text-white/55">
          You haven&apos;t taken any notes yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <NoteCard key={item.lessonId} {...item} />
          ))}
        </div>
      )}
    </section>
  );
}

function NoteCard({
  videoId,
  lessonId,
  instructorPhotoUrl,
  instructorName,
  videoTitle,
  lessonOrder,
  totalLessons,
  preview,
}: NoteItemData) {
  return (
    <article className="flex min-h-72 flex-col bg-zinc-900/70 px-3 py-6 ring-1 ring-white/10 sm:min-h-80 sm:px-4 sm:py-8">
      <div className="mx-auto mt-3 h-20 w-20 overflow-hidden rounded-full bg-zinc-800 sm:mt-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={instructorPhotoUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div className="mt-5 mb-5 flex flex-col items-center text-center sm:mt-6 sm:mb-6">
        <h3 className="text-sm font-bold tracking-tight text-white sm:text-base">
          {videoTitle}
        </h3>
        <p className="mt-1 text-xs text-white/85 sm:text-sm">
          With {instructorName}
        </p>
        <p className="mt-1 text-[11px] text-white/55 sm:text-xs">
          Lesson {lessonOrder} of {totalLessons}
        </p>
        <p className="mt-3 line-clamp-3 text-[11px] leading-relaxed text-white/65 sm:text-xs">
          {preview}
        </p>
      </div>
      <a
        href={`/user-portal/watch?video=${videoId}&lesson=${lessonId}&tab=notes`}
        className="mt-auto inline-flex items-center justify-center rounded-lg bg-zinc-800 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral sm:py-2.5 sm:text-sm"
      >
        View Notes
      </a>
    </article>
  );
}

function PlaybookAchievedSection({ items }: { items: PlaybookAchievedItem[] }) {
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
    <section className="mt-12 sm:mt-14 md:mt-16">
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
          Playbook you have achieved
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
          You haven&apos;t completed any playbooks yet.
        </div>
      ) : (
        <div
          ref={scrollerRef}
          className="overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex w-max snap-x snap-mandatory gap-4 pr-4 sm:gap-5 sm:pr-6 lg:pr-10">
            {items.map((item) => (
              <PlaybookCard key={item.videoId} {...item} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function PlaybookCard({
  videoId,
  thumbnailUrl,
  titleLine1,
  titleLine2,
  metaLine1,
  metaLine2,
  duration,
}: PlaybookAchievedItem) {
  return (
    <a
      href={`/user-portal/click-video-detail?video=${videoId}`}
      data-card
      className="group flex w-[260px] shrink-0 snap-start flex-col outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-[300px] md:w-[320px]"
      aria-label={`${titleLine1} ${titleLine2}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-2xl bg-zinc-900 shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt=""
          className="absolute inset-0 h-full w-full rounded-t-2xl object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06] motion-reduce:group-hover:scale-100"
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
