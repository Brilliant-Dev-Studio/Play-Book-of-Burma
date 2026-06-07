"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { toggleBookmark, saveNote, saveWatchProgress } from "./actions";

const VidstackPlayer = dynamic(() => import("./vidstack-player"), {
  ssr: false,
  loading: () => (
    <div className="aspect-video w-full animate-pulse rounded-2xl bg-zinc-900" />
  ),
});

export type WatchLesson = {
  id: string;
  order: number;
  title: string;
  durationLabel: string;
  details: string;
  videoUrl: string;
  bookmarked: boolean;
  note: string;
  progressSeconds: number;
};

export type WatchVideo = {
  id: string;
  title: string;
  description: string;
  guidebookUrl: string | null;
  thumbnailUrl: string;
  instructor: {
    id: string;
    name: string;
    title: string;
    photoUrl: string;
    biographyParagraphs: string[];
  };
  lessons: WatchLesson[];
};

export type Tab = "All Lessons" | "Notes" | "Biography";

function IconDownload({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function IconBookmark({ className, filled = false }: { className?: string; filled?: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  );
}

function IconChevronLeft({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 19.5-7.5-7.5 7.5-7.5" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export function WatchClient({
  video,
  initialLessonIndex = 0,
  initialTab = "All Lessons",
}: {
  video: WatchVideo;
  initialLessonIndex?: number;
  initialTab?: Tab;
}) {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [activeIndex, setActiveIndex] = useState(initialLessonIndex);
  const [bookmarkState, setBookmarkState] = useState<Record<string, boolean>>(
    () => Object.fromEntries(video.lessons.map((l) => [l.id, l.bookmarked])),
  );
  const [bookmarkPending, startBookmarkTransition] = useTransition();
  const [noteState, setNoteState] = useState<Record<string, string>>(
    () => Object.fromEntries(video.lessons.map((l) => [l.id, l.note])),
  );
  const [noteSavedState, setNoteSavedState] = useState<Record<string, string>>(
    () => Object.fromEntries(video.lessons.map((l) => [l.id, l.note])),
  );
  const [noteStatus, setNoteStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  function onNoteChange(lessonId: string, value: string) {
    setNoteState((s) => ({ ...s, [lessonId]: value }));
    if (noteStatus !== "idle") setNoteStatus("idle");
  }

  async function onNoteBlur(lessonId: string) {
    const value = noteState[lessonId] ?? "";
    if (value === (noteSavedState[lessonId] ?? "")) return;
    setNoteStatus("saving");
    const result = await saveNote(lessonId, value);
    if (result.ok) {
      setNoteSavedState((s) => ({ ...s, [lessonId]: value.trim() }));
      setNoteStatus("saved");
      setTimeout(() => setNoteStatus((s) => (s === "saved" ? "idle" : s)), 2000);
    } else {
      setNoteStatus("error");
    }
  }

  const activeLesson = video.lessons[activeIndex];
  const isBookmarked = activeLesson ? !!bookmarkState[activeLesson.id] : false;

  function onToggleBookmark() {
    if (!activeLesson || bookmarkPending) return;
    const id = activeLesson.id;
    const prev = !!bookmarkState[id];
    setBookmarkState((s) => ({ ...s, [id]: !prev }));
    startBookmarkTransition(async () => {
      const result = await toggleBookmark(id);
      if (!result.ok) {
        setBookmarkState((s) => ({ ...s, [id]: prev }));
      }
    });
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-black">
      <div className="w-full px-4 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-5 lg:px-10 lg:pb-12 lg:pt-6">
        <div className="relative flex flex-col gap-8 lg:flex-row lg:gap-8">
          {!isPanelOpen && (
            <button
              type="button"
              onClick={() => setIsPanelOpen(true)}
              aria-expanded={false}
              aria-controls="class-panel"
              title="Show details"
              className="absolute right-0 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-md border border-white/15 bg-white/[0.06] text-white/85 transition-colors hover:bg-white/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
            >
              <IconChevronLeft className="h-4 w-4" />
              <span className="sr-only">Show details</span>
            </button>
          )}
          <div className="min-w-0 flex-1">
            <div className="overflow-hidden rounded-2xl">
              {activeLesson ? (
                <VidstackPlayer
                  key={activeLesson.id}
                  title={activeLesson.title}
                  src={activeLesson.videoUrl}
                  poster={video.thumbnailUrl}
                  initialSeconds={activeLesson.progressSeconds}
                  onTimeUpdate={(cur, dur) => {
                    void saveWatchProgress(activeLesson.id, cur, dur);
                  }}
                />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-zinc-900 text-white/55">
                  No lessons yet.
                </div>
              )}
            </div>

            {activeLesson && (
              <div className="mt-6">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {activeIndex + 1}. {activeLesson.title}
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-white/85 sm:text-base">
                  <span className="font-medium text-white">Description: </span>
                  {[video.description, activeLesson.details]
                    .map((s) => s?.trim())
                    .filter(Boolean)
                    .join(" ")}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3 sm:gap-4">
              {video.guidebookUrl && (
                <a
                  href={video.guidebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-[140px] flex-col items-center justify-center gap-2 rounded-2xl bg-zinc-900/80 px-6 py-4 text-sm font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
                  aria-label="Download Guidebook"
                >
                  <IconDownload className="h-6 w-6" />
                  Guidebook
                </a>
              )}
              <button
                type="button"
                onClick={onToggleBookmark}
                disabled={!activeLesson || bookmarkPending}
                aria-pressed={isBookmarked}
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this lesson"}
                className={`flex min-w-[140px] flex-col items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-semibold ring-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral disabled:opacity-60 ${
                  isBookmarked
                    ? "bg-coral/20 text-coral ring-coral/40 hover:bg-coral/25"
                    : "bg-zinc-900/80 text-white ring-white/10 hover:bg-zinc-900"
                }`}
              >
                <IconBookmark
                  className="h-6 w-6"
                  filled={isBookmarked}
                />
                {isBookmarked ? "Bookmarked" : "Bookmark"}
              </button>
            </div>
          </div>

          {isPanelOpen && (
            <aside
              id="class-panel"
              className="w-full shrink-0 lg:w-[400px] xl:w-[440px]"
            >
              <ClassPanel
                video={video}
                activeIndex={activeIndex}
                initialTab={initialTab}
                onSelect={setActiveIndex}
                onClose={() => setIsPanelOpen(false)}
                noteValue={activeLesson ? noteState[activeLesson.id] ?? "" : ""}
                noteStatus={noteStatus}
                onNoteChange={(v) =>
                  activeLesson && onNoteChange(activeLesson.id, v)
                }
                onNoteBlur={() => activeLesson && onNoteBlur(activeLesson.id)}
              />
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}

function ClassPanel({
  video,
  activeIndex,
  initialTab = "All Lessons",
  onSelect,
  onClose,
  noteValue,
  noteStatus,
  onNoteChange,
  onNoteBlur,
}: {
  video: WatchVideo;
  activeIndex: number;
  initialTab?: Tab;
  onSelect: (i: number) => void;
  onClose: () => void;
  noteValue: string;
  noteStatus: "idle" | "saving" | "saved" | "error";
  onNoteChange: (value: string) => void;
  onNoteBlur: () => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [descExpanded, setDescExpanded] = useState(false);
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set());
  const descLong = video.description.length > 160;

  function toggleLesson(i: number) {
    setExpandedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="rounded-2xl bg-zinc-900/70 ring-1 ring-white/10">
      <div className="flex items-start gap-4 border-b border-white/10 p-5 sm:p-6">
        <Link
          href={`/user-portal/click-video-detail?video=${video.id}`}
          aria-label={`View ${video.title} detail`}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-800 outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:h-20 sm:w-20"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={video.instructor.photoUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold leading-snug tracking-tight text-white sm:text-xl">
            {video.title}
          </h2>
          <p
            className={`mt-1.5 text-xs leading-snug text-white/75 sm:text-sm ${
              descExpanded ? "" : "line-clamp-3"
            }`}
          >
            {video.description}
          </p>
          {descLong && (
            <button
              type="button"
              onClick={() => setDescExpanded((v) => !v)}
              className="mt-1 text-xs font-semibold text-coral underline-offset-2 hover:underline"
            >
              {descExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Hide details"
          className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
        >
          <IconX className="h-4 w-4" />
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Class details"
        className="flex border-b border-white/10"
      >
        {(["All Lessons", "Notes", "Biography"] as const).map((tab) => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab)}
              className={`relative flex-1 py-4 text-sm font-semibold tracking-tight transition-colors sm:text-base ${
                active ? "text-white" : "text-white/55 hover:text-white/85"
              }`}
            >
              {tab}
              {active && (
                <span
                  className="absolute inset-x-4 bottom-0 h-0.75 rounded-full bg-coral"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 sm:p-5">
        {activeTab === "All Lessons" && (
          <ul className="flex flex-col gap-2.5">
            {video.lessons.map((lesson, index) => {
              const isActive = index === activeIndex;
              const isExpanded = expandedLessons.has(index);
              return (
                <li key={index}>
                  <LessonRow
                    index={index}
                    lesson={lesson}
                    posterUrl={video.thumbnailUrl}
                    isActive={isActive}
                    isExpanded={isExpanded}
                    onToggle={() => toggleLesson(index)}
                    onPlay={() => onSelect(index)}
                  />
                </li>
              );
            })}
            {video.lessons.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-white/55">
                No lessons in this course yet.
              </p>
            )}
          </ul>
        )}

        {activeTab === "Notes" && (
          <div className="flex flex-col gap-2">
            <textarea
              value={noteValue}
              onChange={(e) => onNoteChange(e.target.value)}
              onBlur={onNoteBlur}
              placeholder="Type Your Note Here........."
              aria-label="Your notes"
              className="block min-h-105 w-full resize-y bg-transparent text-xs leading-relaxed text-white outline-none placeholder:text-white/85 focus:placeholder:text-white/35 sm:text-sm"
            />
            <div className="flex items-center justify-end text-[11px] sm:text-xs">
              {noteStatus === "saving" && <span className="text-white/55">Saving…</span>}
              {noteStatus === "saved" && <span className="text-emerald-400">Saved</span>}
              {noteStatus === "error" && (
                <span className="text-red-300">Couldn&apos;t save — try again</span>
              )}
              {noteStatus === "idle" && (
                <span className="text-white/35">Notes auto-save when you click away</span>
              )}
            </div>
          </div>
        )}

        {activeTab === "Biography" && (
          <ul className="flex flex-col gap-3 px-1 py-2 sm:gap-4">
            {video.instructor.biographyParagraphs.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-white/55">
                No biography available.
              </p>
            )}
            {video.instructor.biographyParagraphs.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="mt-2 h-2 w-2 shrink-0 bg-white"
                  aria-hidden
                />
                <p className="text-xs leading-relaxed text-white sm:text-sm">
                  {item}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function LessonRow({
  index,
  lesson,
  posterUrl,
  isActive,
  isExpanded,
  onToggle,
  onPlay,
}: {
  index: number;
  lesson: WatchLesson;
  posterUrl: string;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onPlay: () => void;
}) {
  const details = lesson.details ?? "";
  const detailsLong = details.length > 140;

  return (
    <div
      className={`border transition-colors ${
        isActive ? "border-coral/40 bg-coral/10" : "border-white/10 bg-zinc-900/60"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04] sm:px-5"
      >
        <span className="w-5 shrink-0 text-sm font-medium tabular-nums text-white sm:text-base">
          {index + 1}
        </span>
        <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-white">
          {lesson.title}
        </span>
        <span className="shrink-0 text-xs text-white/80 sm:text-sm">
          {lesson.durationLabel}
        </span>
        <span
          className={`shrink-0 text-xs text-white/50 transition-transform duration-200 ease-out ${
            isExpanded ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-white/[0.06] bg-black/30 p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onPlay}
              aria-label={`Play lesson ${index + 1}`}
              className="group relative aspect-video w-full shrink-0 overflow-hidden rounded-md bg-zinc-900 sm:w-40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={posterUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40" aria-hidden />
              <span
                className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-coral text-black shadow-lg transition-transform group-hover:scale-110"
                aria-hidden
              >
                <span className="ml-0.5 text-base leading-none">▶</span>
              </span>
            </button>
            <div className="min-w-0 flex-1">
              {details ? (
                <>
                  <p className="line-clamp-3 text-xs leading-relaxed text-white/80 sm:text-sm">
                    {details}
                  </p>
                  {detailsLong && (
                    <button
                      type="button"
                      onClick={onPlay}
                      className="mt-1 text-xs font-semibold text-coral underline-offset-2 hover:underline"
                    >
                      Show more
                    </button>
                  )}
                </>
              ) : (
                <p className="text-xs italic text-white/45 sm:text-sm">
                  No description for this lesson.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
