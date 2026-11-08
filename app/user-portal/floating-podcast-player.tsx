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
  const timeLine = `${formatPlayerClock(currentSec)} / ${formatPlayerClock(totalSec)}`;

  function seekFromBar(e: React.MouseEvent<HTMLDivElement>) {
    if (!totalSec) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    seekTo(ratio * totalSec);
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-zinc-950/95 shadow-[0_-12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md"
      role="region"
      aria-label="Now playing"
    >
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-3.5 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-[min(100%,320px)] lg:max-w-[380px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.thumbnailUrl}
            alt=""
            className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-white/10 sm:h-16 sm:w-16"
          />
          <div className="min-w-0 flex-1">
            <Link
              href={`/user-portal/audio/${current.id}`}
              className="line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors hover:text-coral sm:text-[15px]"
            >
              {current.title}
            </Link>
            <p className="mt-0.5 truncate text-xs tabular-nums text-white/55">{timeLine}</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => skip(-15)}
            aria-label="Rewind 15 seconds"
            className="relative shrink-0 text-white/75 transition-colors hover:text-white"
          >
            <SkipIcon direction="back" />
            <span className="absolute inset-0 flex items-center justify-center pt-0.5 text-[7px] font-bold">
              15
            </span>
          </button>

          <button
            type="button"
            onClick={toggle}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral text-black shadow-lg transition-transform hover:scale-105 sm:h-11 sm:w-11"
          >
            <span className="text-lg leading-none">
              {isPlaying ? "❚❚" : <span className="ml-0.5">▶</span>}
            </span>
          </button>

          <button
            type="button"
            onClick={() => skip(30)}
            aria-label="Forward 30 seconds"
            className="relative shrink-0 text-white/75 transition-colors hover:text-white"
          >
            <SkipIcon direction="forward" />
            <span className="absolute inset-0 flex items-center justify-center pt-0.5 text-[7px] font-bold">
              30
            </span>
          </button>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-md">
          <span className="hidden shrink-0 text-[11px] tabular-nums text-white/50 sm:inline">
            {formatPlayerClock(currentSec)}
          </span>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pct)}
            onClick={seekFromBar}
            className="h-1.5 min-w-0 flex-1 cursor-pointer overflow-hidden rounded-full bg-white/15"
          >
            <div
              className="h-full rounded-full bg-coral transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="hidden shrink-0 text-[11px] tabular-nums text-white/50 sm:inline">
            {formatPlayerClock(totalSec)}
          </span>

          <button
            type="button"
            onClick={close}
            aria-label="Close player"
            className="ml-auto shrink-0 rounded-md p-1.5 text-white/45 transition-colors hover:bg-white/10 hover:text-white sm:ml-0"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
