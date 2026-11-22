"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { toggleBookmark, saveNote, saveWatchProgress } from "./actions";

// No `loading` fallback here on purpose — the player itself (vidstack-player.tsx)
// renders its own buffering spinner once mounted, so a separate app-level
// placeholder would just be a second, redundant loading indicator.
const VidstackPlayer = dynamic(() => import("./vidstack-player"), {
  ssr: false,
});

export type QualityOption = {
  label: string;
  height: number | null;
  url: string;
  isSource: boolean;
};

export type WatchLesson = {
  id: string;
  order: number;
  title: string;
  durationLabel: string;
  durationSeconds: number;
  details: string;
  videoUrl: string;
  /** [] until every rung is confirmed ready — see app/api.../lessons/[lessonId]/route.ts. */
  qualities: QualityOption[];
  bookmarked: boolean;
  note: string;
  progressSeconds: number;
};

export type WatchVideo = {
  id: string;
  title: string;
  description: string;
  /** Watch sidebar heading; falls back to `title` when empty. */
  sidebarTitle: string;
  /** Watch sidebar body; falls back to `description` when empty. */
  sidebarDescription: string;
  guidebookUrl: string | null;
  thumbnailUrl: string;
  totalDurationLabel: string;
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

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  if (s <= 0) return "";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

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

function IconClose({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconLessons({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

/** Small stacked icon + label card used for Guidebook / Bookmark under the player. */
const actionCardClass =
  "inline-flex h-14 w-[4.5rem] flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral disabled:opacity-60 sm:h-16 sm:w-20 sm:text-[11px]";

export function WatchClient({
  video,
  initialLessonIndex = 0,
  initialTab = "All Lessons",
}: {
  video: WatchVideo;
  initialLessonIndex?: number;
  initialTab?: Tab;
}) {
  const [activeIndex, setActiveIndex] = useState(initialLessonIndex);
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [descExpanded, setDescExpanded] = useState(false);
  /** Whole right sidebar — ✕ hides it so the player takes the full width (YouTube-style);
   * the "Lessons" pill on the player's top-right corner brings it back. */
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
  const [progressState, setProgressState] = useState<Record<string, number>>(
    () =>
      Object.fromEntries(
        video.lessons.map((l) => [l.id, l.progressSeconds]),
      ),
  );

  const activeLesson = video.lessons[activeIndex];
  const activeLessonId = activeLesson?.id;
  const isBookmarked = activeLesson ? !!bookmarkState[activeLesson.id] : false;

  const handleTimeUpdate = useCallback(
    (cur: number, dur: number) => {
      if (!activeLessonId) return;
      setProgressState((s) => {
        const prev = s[activeLessonId] ?? 0;
        // Avoid re-render spam for tiny scrub differences (sidebar progress only).
        if (Math.abs(prev - cur) < 2) return s;
        return { ...s, [activeLessonId]: cur };
      });
      void saveWatchProgress(activeLessonId, cur, dur);
    },
    [activeLessonId],
  );

  const lessonBody = useMemo(() => {
    if (!activeLesson) return "";
    return (activeLesson.details?.trim() || video.description || "").trim();
  }, [activeLesson, video.description]);

  const panelTitle = video.sidebarTitle.trim() || video.title;
  const panelDescription =
    video.sidebarDescription.trim() || video.description;
  const courseDescLong = panelDescription.length > 180;

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
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-10 pt-4 sm:px-6 sm:pb-12 sm:pt-5 lg:px-8 lg:pt-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10 xl:gap-12">
          {/* ── Left: player + lesson meta ── */}
          <div className="min-w-0 flex-1">
            <div className="relative overflow-hidden rounded-lg bg-black">
              {!sidebarOpen ? (
                // Pinned to the player's top-right so it's always in view, even when the
                // full-width player pushes everything below it off screen.
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Show lessons sidebar"
                  aria-controls="watch-sidebar"
                  aria-expanded={false}
                  className="absolute right-3 top-3 z-40 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3.5 py-2 text-xs font-semibold text-white shadow-lg ring-1 ring-white/20 backdrop-blur-sm transition-colors hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral sm:right-4 sm:top-4 sm:text-sm"
                >
                  <IconLessons className="h-4 w-4" />
                  Lessons
                </button>
              ) : null}
              {activeLesson ? (
                <VidstackPlayer
                  key={activeLesson.id}
                  title={activeLesson.title}
                  src={activeLesson.videoUrl}
                  qualities={activeLesson.qualities}
                  initialSeconds={progressState[activeLesson.id] ?? 0}
                  onTimeUpdate={handleTimeUpdate}
                />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-zinc-900 text-white/55">
                  No lessons yet.
                </div>
              )}
            </div>

            {activeLesson && (
              <div className="mt-5 flex flex-col gap-4 sm:mt-6 sm:flex-row sm:items-start sm:gap-6">
                <div className="min-w-0 flex-1">
                  <h1 className="text-[1.35rem] font-semibold leading-snug tracking-tight text-white sm:text-2xl lg:text-[1.65rem]">
                    {activeIndex + 1}. {activeLesson.title}
                  </h1>
                  {lessonBody ? (
                    <p className="mt-2.5 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-white/65 sm:mt-3 sm:text-[0.95rem]">
                      {lessonBody}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-row gap-2 pt-0.5 sm:flex-col">
                  {video.guidebookUrl ? (
                    <a
                      href={video.guidebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Download Guidebook"
                      className={`${actionCardClass} bg-white/[0.08] text-white/90 hover:bg-white/[0.14]`}
                    >
                      <IconDownload className="h-4 w-4" />
                      Guidebook
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={onToggleBookmark}
                    disabled={bookmarkPending}
                    aria-pressed={isBookmarked}
                    aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this lesson"}
                    className={`${actionCardClass} ${
                      isBookmarked
                        ? "bg-coral/20 text-coral"
                        : "bg-white/[0.08] text-white/90 hover:bg-white/[0.14]"
                    }`}
                  >
                    <IconBookmark className="h-4 w-4" filled={isBookmarked} />
                    {isBookmarked ? "Saved" : "Bookmark"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: class sidebar ── */}
          <aside
            id="watch-sidebar"
            hidden={!sidebarOpen}
            className="w-full shrink-0 lg:w-[340px] xl:w-[380px]"
          >
            <div className="overflow-hidden rounded-2xl bg-zinc-900/80 ring-1 ring-white/10 lg:sticky lg:top-20">
              {/* Header: thumbnail + course title / description */}
              <div className="relative flex items-start gap-3 border-b border-white/10 p-4 pr-11 sm:gap-4 sm:p-5 sm:pr-12">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close sidebar"
                  aria-controls="watch-sidebar"
                  className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-coral sm:right-4 sm:top-4"
                >
                  <IconClose className="h-4 w-4" />
                </button>
                <Link
                  href={`/user-portal/click-video-detail?video=${video.id}`}
                  aria-label={`View ${video.title} detail`}
                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-800 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 sm:h-16 sm:w-16"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={video.instructor.photoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold leading-snug tracking-tight text-white sm:text-lg">
                    {panelTitle}
                  </h2>
                  <p
                    className={`mt-1.5 whitespace-pre-line text-xs leading-relaxed text-white/70 sm:text-sm ${
                      descExpanded ? "" : "line-clamp-3"
                    }`}
                  >
                    {panelDescription}
                  </p>
                  {courseDescLong ? (
                    <button
                      type="button"
                      onClick={() => setDescExpanded((v) => !v)}
                      className="mt-1 text-xs font-semibold text-coral underline-offset-2 hover:underline sm:text-sm"
                    >
                      {descExpanded ? "Show less" : "Show more"}
                    </button>
                  ) : null}
                  <p className="mt-2 text-xs text-white/40">
                    {video.lessons.length}{" "}
                    {video.lessons.length === 1 ? "lesson" : "lessons"}
                    {video.totalDurationLabel
                      ? ` · ${video.totalDurationLabel}`
                      : null}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div
                role="tablist"
                aria-label="Class details"
                className="flex border-b border-white/10 px-4 sm:px-5"
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
                      className={`relative flex-1 py-3.5 text-sm font-semibold tracking-tight transition-colors sm:text-[0.95rem] ${
                        active ? "text-white" : "text-white/50 hover:text-white/80"
                      }`}
                    >
                      {tab}
                      {active ? (
                        <span
                          className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-coral"
                          aria-hidden
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="max-h-[min(62vh,640px)] overflow-y-auto overscroll-contain p-3 sm:p-4">
                {activeTab === "All Lessons" && (
                  <ul className="flex flex-col gap-1">
                    {video.lessons.map((lesson, index) => {
                      const watched = progressState[lesson.id] ?? lesson.progressSeconds;
                      const dur = lesson.durationSeconds;
                      const pct =
                        dur > 0 ? Math.min(100, Math.round((watched / dur) * 100)) : 0;
                      const clock =
                        formatClock(dur) ||
                        lesson.durationLabel.replace(/\s+/g, " ").trim();
                      const isActive = index === activeIndex;

                      return (
                        <li key={lesson.id}>
                          <button
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            aria-current={isActive ? "true" : undefined}
                            className={`group flex w-full items-center gap-3 rounded-md px-1.5 py-2 text-left transition-colors ${
                              isActive
                                ? "bg-white/[0.06]"
                                : "hover:bg-white/[0.04]"
                            }`}
                          >
                            <span className="relative aspect-video w-[7.25rem] shrink-0 overflow-hidden rounded-md bg-zinc-800 sm:w-32">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={video.thumbnailUrl}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover"
                              />
                              {clock ? (
                                <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1 py-0.5 text-[10px] font-medium tabular-nums text-white">
                                  {clock}
                                </span>
                              ) : null}
                              {pct > 0 ? (
                                <span
                                  className="absolute inset-x-0 bottom-0 h-[3px] bg-black/50"
                                  aria-hidden
                                >
                                  <span
                                    className="block h-full bg-coral"
                                    style={{ width: `${pct}%` }}
                                  />
                                </span>
                              ) : null}
                            </span>
                            <span
                              className={`min-w-0 flex-1 text-sm leading-snug ${
                                isActive
                                  ? "font-medium text-white"
                                  : "font-normal text-white/80 group-hover:text-white"
                              }`}
                            >
                              {index + 1}. {lesson.title}
                            </span>
                          </button>
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
                  <div className="flex flex-col gap-2 px-1 py-2">
                    <textarea
                      value={
                        activeLesson ? noteState[activeLesson.id] ?? "" : ""
                      }
                      onChange={(e) =>
                        activeLesson && onNoteChange(activeLesson.id, e.target.value)
                      }
                      onBlur={() =>
                        activeLesson && void onNoteBlur(activeLesson.id)
                      }
                      placeholder="Type Your Note Here........."
                      aria-label="Your notes"
                      className="block min-h-48 w-full resize-y bg-transparent text-sm leading-relaxed text-white outline-none placeholder:text-white/40"
                    />
                    <div className="flex items-center justify-end text-xs">
                      {noteStatus === "saving" && (
                        <span className="text-white/55">Saving…</span>
                      )}
                      {noteStatus === "saved" && (
                        <span className="text-emerald-400">Saved</span>
                      )}
                      {noteStatus === "error" && (
                        <span className="text-red-300">
                          Couldn&apos;t save — try again
                        </span>
                      )}
                      {noteStatus === "idle" && (
                        <span className="text-white/35">
                          Notes auto-save when you click away
                        </span>
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
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/70"
                          aria-hidden
                        />
                        <p className="whitespace-pre-line text-sm leading-relaxed text-white/80">
                          {item}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
