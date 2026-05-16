"use client";

import Image from "next/image";
import { useState } from "react";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import instructorThumb from "@/app/assets/home/Ko Jason Myint.png";

type Lesson = {
  title: string;
  duration: string;
  details: string;
};

const LESSON_DETAIL =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry.";

const LESSONS: Lesson[] = [
  { title: "Introduction of Modern Finance", duration: "10 mins", details: LESSON_DETAIL },
  { title: "Lorem Ipsum is simply dummy text of the printing", duration: "10 mins", details: LESSON_DETAIL },
  { title: "Lorem Ipsum is simply dummy text of the printing", duration: "10 mins", details: LESSON_DETAIL },
  { title: "Lorem Ipsum is simply dummy text of the printing", duration: "10 mins", details: LESSON_DETAIL },
  { title: "Lorem Ipsum is simply dummy text of the printing", duration: "10 mins", details: LESSON_DETAIL },
];

const VIDEO_DESCRIPTION =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,";

const BIOGRAPHY_DESCRIPTION =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,";

const BIOGRAPHY: string[] = Array.from({ length: 4 }, () => BIOGRAPHY_DESCRIPTION);

type Tab = "All Lessons" | "Notes" | "Biography";

function IconDownload({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  );
}

function IconBookmark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
      />
    </svg>
  );
}

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export default function VideoDetailPage() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-black">
      <div className="mx-auto w-full max-w-[85%] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Panel toggle */}
        <div className="mb-4 flex justify-end sm:mb-6">
          <button
            type="button"
            onClick={() => setIsPanelOpen((o) => !o)}
            aria-expanded={isPanelOpen}
            aria-controls="class-panel"
            className="flex items-center gap-2 rounded-md border border-white/15 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
          >
            <IconChevronRight
              className={`h-4 w-4 transition-transform duration-200 ${isPanelOpen ? "" : "rotate-180"}`}
            />
            <span>{isPanelOpen ? "Hide details" : "Show details"}</span>
          </button>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-8">
          {/* Left column — player + meta + actions */}
          <div className="min-w-0 flex-1">
            <div className="overflow-hidden rounded-2xl">
              <MediaPlayer
                title="Introduction of Modern Finance"
                src="https://files.vidstack.io/sprite-fight/720p.mp4"
                poster={instructorThumb.src}
                aspectRatio="16/9"
                playsInline
              >
                <MediaProvider />
                <DefaultVideoLayout
                  icons={defaultLayoutIcons}
                  thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt"
                />
              </MediaPlayer>
            </div>

            {/* Lesson title + description */}
            <div className="mt-6">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                1. Introduction
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-white/85 sm:text-base">
                <span className="font-medium text-white">Description: </span>
                {VIDEO_DESCRIPTION}
              </p>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-wrap gap-3 sm:gap-4">
              <button
                type="button"
                className="flex min-w-[140px] flex-col items-center justify-center gap-2 rounded-2xl bg-zinc-900/80 px-6 py-4 text-sm font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
                aria-label="Download Guidebook"
              >
                <IconDownload className="h-6 w-6" />
                Guidebook
              </button>
              <button
                type="button"
                className="flex min-w-[140px] flex-col items-center justify-center gap-2 rounded-2xl bg-zinc-900/80 px-6 py-4 text-sm font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
                aria-label="Bookmark this lesson"
              >
                <IconBookmark className="h-6 w-6" />
                Bookmark
              </button>
            </div>
          </div>

          {/* Right column — instructor card + tabs + lessons */}
          {isPanelOpen && (
            <aside
              id="class-panel"
              className="w-full shrink-0 lg:w-[400px] xl:w-[440px]"
            >
              <ClassPanel onClose={() => setIsPanelOpen(false)} />
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}

function ClassPanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("All Lessons");
  const [noteText, setNoteText] = useState("");

  return (
    <div className="rounded-2xl bg-zinc-900/70 ring-1 ring-white/10">
      {/* Header */}
      <div className="flex items-start gap-4 border-b border-white/10 p-5 sm:p-6">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-800 sm:h-20 sm:w-20">
          <Image
            src={instructorThumb}
            alt=""
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold leading-snug tracking-tight text-white sm:text-xl">
            Title of the Classes
          </h2>
          <p className="mt-1.5 text-xs leading-snug text-white/75 sm:text-sm">
            Objective of the Classes Lorem Ipsum is simply dummy text of the
            printing and typesetting industry
          </p>
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

      {/* Tabs */}
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

      {/* Tab content */}
      <div className="p-4 sm:p-5">
        {activeTab === "All Lessons" && (
          <ul className="flex flex-col gap-2.5">
            {LESSONS.map((lesson, index) => (
              <li key={index}>
                <details className="group border border-white/10 bg-zinc-900/60">
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04] sm:px-5 [&::-webkit-details-marker]:hidden">
                    <span className="w-5 shrink-0 text-sm font-medium tabular-nums text-white sm:text-base">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-white">
                      {lesson.title}
                    </span>
                    <span className="shrink-0 text-xs text-white/80 sm:text-sm">
                      {lesson.duration}
                    </span>
                    <span
                      className="shrink-0 text-xs text-white/50 transition-transform duration-200 ease-out group-open:rotate-180"
                      aria-hidden
                    >
                      ▼
                    </span>
                  </summary>
                  <div className="border-t border-white/[0.06] bg-black/25 px-4 py-3 pl-[3rem] text-sm leading-relaxed text-white/80 sm:px-5 sm:pl-12">
                    {lesson.details}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}

        {activeTab === "Notes" && (
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Type Your Note Here........."
            aria-label="Your notes"
            className="block min-h-105 w-full resize-y bg-transparent text-xs leading-relaxed text-white outline-none placeholder:text-white/85 focus:placeholder:text-white/35 sm:text-sm"
          />
        )}

        {activeTab === "Biography" && (
          <ul className="flex flex-col gap-3 px-1 py-2 sm:gap-4">
            {BIOGRAPHY.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="mt-2 h-2 w-2 shrink-0 bg-white"
                  aria-hidden
                />
                <p className="text-xs leading-relaxed text-white sm:text-sm">
                  <span className="font-medium">Description: </span>
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
