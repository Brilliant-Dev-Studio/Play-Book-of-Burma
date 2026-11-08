"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatPlayerClock } from "@/lib/format-duration";
import { usePodcastPlayer } from "./podcast-player-context";

function SkipIcon({ direction }: { direction: "back" | "forward" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
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
  );
}

export function FloatingPodcastPlayer() {
  const pathname = usePathname();
  const {
    current,
    isPlaying,
    currentSec,
    durationSec,
    toggle,
    skip,
    seekTo,
    close,
  } = usePodcastPlayer();

  if (!current) return null;
  if (pathname?.startsWith("/user-portal/audio/")) return null;

  const totalSec = durationSec > 0 ? durationSec : current.durationSeconds || 0;
  const pct = totalSec > 0 ? Math.min(100, (currentSec / totalSec) * 100) : 0;

  function seekFromBar(e: React.MouseEvent<HTMLDivElement>) {
    if (!totalSec) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    seekTo(ratio * totalSec);
  }

  return (
    <div
      className="pointer-events-none fixed bottom-5 left-4 right-4 z-50 flex justify-center sm:left-auto sm:right-6 sm:justify-end"
      role="region"
      aria-label="Now playing"
    >
      <div className="pointer-events-auto w-full max-w-[380px] overflow-hidden rounded-2xl border border-white/15 bg-zinc-950/95 shadow-[0_20px_56px_rgba(0,0,0,0.55)] backdrop-blur-md sm:max-w-[400px]">
        <div className="flex items-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.thumbnailUrl}
            alt=""
            className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-white/10"
          />
          <div className="min-w-0 flex-1">
            <Link
              href={`/user-portal/audio/${current.id}`}
              className="block truncate text-[13px] font-semibold text-white hover:text-coral sm:text-sm"
            >
              {current.title}
            </Link>
            <p className="truncate text-[10px] tabular-nums text-white/55 sm:text-[11px]">
              {formatPlayerClock(currentSec)} / {formatPlayerClock(totalSec)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => skip(-15)}
            aria-label="Rewind 15 seconds"
            className="relative hidden shrink-0 text-white/70 hover:text-white sm:block"
          >
            <SkipIcon direction="back" />
            <span className="absolute inset-0 flex items-center justify-center pt-0.5 text-[6px] font-bold">
              15
            </span>
          </button>

          <button
            type="button"
            onClick={toggle}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coral text-black shadow-md"
          >
            <span className="text-sm leading-none">
              {isPlaying ? "❚❚" : <span className="ml-0.5">▶</span>}
            </span>
          </button>

          <button
            type="button"
            onClick={() => skip(30)}
            aria-label="Forward 30 seconds"
            className="relative hidden shrink-0 text-white/70 hover:text-white sm:block"
          >
            <SkipIcon direction="forward" />
            <span className="absolute inset-0 flex items-center justify-center pt-0.5 text-[6px] font-bold">
              30
            </span>
          </button>

          <button
            type="button"
            onClick={close}
            aria-label="Close player"
            className="shrink-0 p-1 text-white/45 hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          onClick={seekFromBar}
          className="h-1 cursor-pointer bg-white/10"
        >
          <div className="h-full bg-coral transition-[width]" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
