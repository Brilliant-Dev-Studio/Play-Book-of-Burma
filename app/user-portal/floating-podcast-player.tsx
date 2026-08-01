"use client";

import { usePodcastPlayer } from "./podcast-player-context";

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function FloatingPodcastPlayer() {
  const { current, isPlaying, currentSec, durationSec, toggle, skip, close } =
    usePodcastPlayer();

  if (!current) return null;

  const pct = durationSec > 0 ? Math.min(100, (currentSec / durationSec) * 100) : 0;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-[280px] overflow-hidden rounded-2xl border border-white/15 bg-zinc-950/95 shadow-[0_20px_56px_rgba(0,0,0,0.6)] backdrop-blur-md sm:bottom-6 sm:right-6 sm:w-80"
      role="region"
      aria-label="Podcast mini player"
    >
      <div className="flex items-center gap-3 p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.thumbnailUrl}
          alt=""
          className="h-12 w-12 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{current.title}</p>
          <p className="text-[11px] tabular-nums text-white/55">
            {formatTime(currentSec)} / {current.durationLabel || formatTime(durationSec)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => skip(-15)}
          aria-label="Rewind 15 seconds"
          className="shrink-0 text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5" aria-hidden>
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <path d="M3 3v4h4" />
          </svg>
        </button>

        <button
          type="button"
          onClick={toggle}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coral text-black shadow-lg transition-transform hover:scale-105"
        >
          <span className="text-base leading-none">
            {isPlaying ? "❚❚" : <span className="ml-0.5">▶</span>}
          </span>
        </button>

        <button
          type="button"
          onClick={() => skip(30)}
          aria-label="Forward 30 seconds"
          className="shrink-0 text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5" aria-hidden>
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <path d="M21 3v4h-4" />
          </svg>
        </button>

        <button
          type="button"
          onClick={close}
          aria-label="Close player"
          className="shrink-0 text-white/45 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="h-1 w-full bg-white/10">
        <div className="h-full bg-coral transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
