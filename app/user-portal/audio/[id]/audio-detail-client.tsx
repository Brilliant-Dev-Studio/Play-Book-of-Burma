"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PodcastDetail } from "@/lib/server/podcasts";
import { splitMyanmarParagraphs } from "@/lib/myanmar-text";
import { usePodcastPlayer } from "@/app/user-portal/podcast-player-context";

type Tab = "About" | "Biography";
const TABS: Tab[] = ["About", "Biography"];

function formatChapterTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function SkipButton({
  direction,
  seconds,
  onClick,
  disabled,
}: {
  direction: "back" | "forward";
  seconds: number;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={direction === "back" ? `Rewind ${seconds} seconds` : `Forward ${seconds} seconds`}
      className="relative shrink-0 text-white/80 transition-colors hover:text-white disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden
      >
        {direction === "back" ? (
          <>
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <path d="M3 3v4h4" />
          </>
        ) : (
          <>
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <path d="M21 3v4h-4" />
          </>
        )}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center pt-0.5 text-[7px] font-bold tabular-nums">
        {seconds}
      </span>
    </button>
  );
}

export function AudioDetailClient({
  podcast,
  resumeSeconds,
}: {
  podcast: PodcastDetail;
  resumeSeconds: number | null;
}) {
  const player = usePodcastPlayer();
  const [activeTab, setActiveTab] = useState<Tab>("About");
  const resumeAppliedRef = useRef(false);

  const isCurrent = player.current?.id === podcast.id;
  const isPlaying = isCurrent && player.isPlaying;
  const durationSec = isCurrent && player.durationSec ? player.durationSec : podcast.durationSeconds;
  const pct = durationSec > 0 ? Math.min(100, (player.currentSec / durationSec) * 100) : 0;

  const aboutLines = useMemo(() => {
    const split = splitMyanmarParagraphs(podcast.description);
    return split.length > 0 ? split : podcast.description.trim() ? [podcast.description.trim()] : [];
  }, [podcast.description]);

  const biographyLines = podcast.biographyParagraphs ?? [];

  useEffect(() => {
    if (player.current?.id !== podcast.id) {
      resumeAppliedRef.current = false;
      player.playItem(podcast);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when podcast id changes
  }, [podcast.id]);

  useEffect(() => {
    if (resumeSeconds == null || resumeAppliedRef.current) return;
    if (player.current?.id !== podcast.id) return;
    if (durationSec <= 0) return;
    player.seekTo(resumeSeconds);
    resumeAppliedRef.current = true;
  }, [resumeSeconds, player, podcast.id, durationSec, player.current?.id]);

  function seekFromBar(e: React.MouseEvent<HTMLDivElement>) {
    if (!isCurrent || !durationSec) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    player.seekTo(ratio * durationSec);
  }

  function formatListeningTime(sec: number) {
    if (!Number.isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const timeLabel =
    isCurrent && (isPlaying || player.currentSec > 0)
      ? `${formatListeningTime(player.currentSec)} / ${podcast.durationLabel}`
      : podcast.durationLabel;

  const tabBody =
    activeTab === "Biography" ? (
      biographyLines.length === 0 ? (
        <p className="text-sm text-white/55">No biography yet.</p>
      ) : (
        <ul className="space-y-3">
          {biographyLines.map((line, index) => (
            <li key={index} className="flex gap-2.5 font-yati text-base leading-relaxed text-white/90 sm:text-[17px]">
              <span className="mt-1 shrink-0 text-coral" aria-hidden>
                ▪
              </span>
              <span className="max-w-3xl">{line}</span>
            </li>
          ))}
        </ul>
      )
    ) : aboutLines.length === 0 ? (
      <p className="text-sm text-white/55">No description yet.</p>
    ) : (
      <>
        <ul className="space-y-3">
          {aboutLines.map((line, index) => (
            <li key={index} className="flex gap-2.5 font-yati text-base leading-relaxed text-white/90 sm:text-[17px]">
              <span className="mt-1 shrink-0 text-coral" aria-hidden>
                ▪
              </span>
              <span className="max-w-3xl">{line}</span>
            </li>
          ))}
        </ul>
        {podcast.chapters.length > 0 ? (
          <ul className="mt-6 grid gap-2 border-t border-white/10 pt-6 sm:grid-cols-2 xl:grid-cols-1">
            {podcast.chapters.map((chapter, index) => (
              <li key={`${chapter.seconds}-${index}`}>
                <button
                  type="button"
                  onClick={() => player.seekTo(chapter.seconds)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-coral text-black">
                    <span className="ml-0.5 text-[11px]">▶</span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-white/70">
                    {formatChapterTime(chapter.seconds)}
                  </span>
                  <span className="min-w-0 text-sm font-medium text-white sm:text-[15px]">
                    {chapter.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </>
    );

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <Link
        href="/user-portal/library"
        className="inline-flex items-center gap-1 text-sm font-semibold text-white/85 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
      >
        <span aria-hidden>←</span> Back to Library
      </Link>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10 xl:gap-14">
        <div className="w-full shrink-0 lg:max-w-[420px] xl:max-w-[480px]">
          <div className="rounded-2xl border border-white/25 p-1.5 shadow-[0_14px_44px_rgba(0,0,0,0.45)]">
            <div className="relative aspect-360/230 w-full overflow-hidden rounded-xl bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={podcast.thumbnailUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </div>
          </div>
          <p className="mt-4 text-sm font-medium tabular-nums text-white/55 lg:hidden">
            {podcast.durationLabel}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl lg:text-[2rem]">
            {podcast.title}
          </h1>

          <div className="mt-6 flex w-full max-w-3xl items-center gap-2.5 rounded-2xl bg-zinc-900 px-3.5 py-3 ring-1 ring-white/10 sm:gap-3 sm:px-4 lg:max-w-none">
        <button
          type="button"
          onClick={player.cycleRate}
          className="shrink-0 text-xs font-semibold tabular-nums text-white/85 hover:text-white"
        >
          {player.rate}&times;
        </button>

        <SkipButton
          direction="back"
          seconds={15}
          disabled={!isCurrent}
          onClick={() => player.skip(-15)}
        />

        <button
          type="button"
          onClick={player.toggle}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="shrink-0 text-white hover:scale-105"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
            {isPlaying ? (
              <path
                d="M8 5.5h2.5v13H8zM13.5 5.5H16v13h-2.5z"
                fill="currentColor"
              />
            ) : (
              <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
            )}
          </svg>
        </button>

        <SkipButton
          direction="forward"
          seconds={30}
          disabled={!isCurrent}
          onClick={() => player.skip(30)}
        />

        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          onClick={seekFromBar}
          className="relative h-1.5 min-w-0 flex-1 cursor-pointer overflow-hidden rounded-full bg-white/25"
        >
          <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
        </div>

        <span className="hidden shrink-0 text-xs font-medium tabular-nums text-white/85 sm:inline">
          {timeLabel}
        </span>

        <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
          <button
            type="button"
            onClick={player.toggleMute}
            aria-label={player.muted ? "Unmute" : "Mute"}
            className="shrink-0 text-white/80 transition-colors hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" />
              {player.muted ? (
                <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="1.7" />
              ) : (
                <>
                  <path d="M16 9a4 4 0 0 1 0 6" stroke="currentColor" strokeWidth="1.7" fill="none" />
                  <path d="M18.5 6.5a8 8 0 0 1 0 11" stroke="currentColor" strokeWidth="1.7" fill="none" />
                </>
              )}
            </svg>
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={player.muted ? 0 : player.volume}
            onChange={(e) => player.setVolume(Number(e.target.value))}
            aria-label="Volume"
            className="h-1 w-24 cursor-pointer accent-coral"
          />
        </div>
          </div>

          <div className="mt-8 rounded-2xl bg-zinc-900/90 ring-1 ring-white/10">
            <div className="flex gap-8 border-b border-white/10 px-5 py-4 sm:px-6">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`border-b-2 pb-1 text-base font-semibold transition-colors sm:text-[17px] ${
                    activeTab === tab
                      ? "border-coral font-bold text-white"
                      : "border-transparent text-white/55 hover:text-white/80"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="px-5 py-5 sm:px-6 sm:py-6">{tabBody}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
