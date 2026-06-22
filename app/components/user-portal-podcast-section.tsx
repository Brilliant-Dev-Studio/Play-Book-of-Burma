"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HomePodcastGroup, UserPortalPodcastItem } from "@/lib/server/podcasts";
import { savePodcastProgress } from "@/app/user-portal/podcast-actions";

const SAVE_INTERVAL_SEC = 10;

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return "0:00";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h} Hr ${m} min`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PodcastPlayerRow({ item }: { item: UserPortalPodcastItem }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);
  const [durationSec, setDurationSec] = useState(item.durationSeconds || 0);
  const [expanded, setExpanded] = useState(false);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  // Throttled progress saving — fires at most once per SAVE_INTERVAL_SEC
  const lastSavedSecRef = useRef<number>(-SAVE_INTERVAL_SEC);
  function saveProgress(currentTime: number, duration: number) {
    if (currentTime - lastSavedSecRef.current < SAVE_INTERVAL_SEC) return;
    lastSavedSecRef.current = currentTime;
    void savePodcastProgress(item.id, currentTime, duration);
  }

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      setIsPlaying(false);
      // Always save on pause/end regardless of throttle
      lastSavedSecRef.current = -SAVE_INTERVAL_SEC;
      void savePodcastProgress(item.id, el.currentTime, el.duration || durationSec);
    };
    const onTime = () => {
      setCurrentSec(el.currentTime);
      saveProgress(el.currentTime, el.duration || durationSec);
    };
    const onMeta = () => {
      if (Number.isFinite(el.duration) && el.duration > 0) {
        setDurationSec(el.duration);
      }
    };
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onPause);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onPause);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, durationSec]);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
    } else {
      el.pause();
    }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const el = audioRef.current;
    if (!el || !durationSec) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    el.currentTime = ratio * durationSec;
    setCurrentSec(el.currentTime);
  }

  function skip(delta: number) {
    const el = audioRef.current;
    if (!el) return;
    const max = durationSec || el.duration || 0;
    el.currentTime = Math.min(max, Math.max(0, el.currentTime + delta));
    setCurrentSec(el.currentTime);
  }

  const SPEEDS = [1, 1.25, 1.5, 1.75, 2];
  function cycleRate() {
    setRate((r) => {
      const next = SPEEDS[(SPEEDS.indexOf(r) + 1) % SPEEDS.length];
      if (audioRef.current) audioRef.current.playbackRate = next;
      return next;
    });
  }

  function changeVolume(v: number) {
    setVolume(v);
    setMuted(v === 0);
    const el = audioRef.current;
    if (el) {
      el.volume = v;
      el.muted = v === 0;
    }
  }

  function toggleMute() {
    setMuted((m) => {
      const next = !m;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  }

  const pct = durationSec > 0 ? Math.min(100, (currentSec / durationSec) * 100) : 0;
  const timeLabel = isPlaying || currentSec > 0
    ? `${formatTime(currentSec)} / ${item.durationLabel || formatTime(durationSec)}`
    : item.durationLabel || formatTime(durationSec);

  return (
    <article className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
      <div className="group w-full max-w-87.5 shrink-0 rounded-2xl border-2 border-white/30 p-1.25 shadow-[0_14px_44px_rgba(0,0,0,0.45)] transition-colors hover:border-white/45 sm:w-87.5">
        <div className="relative aspect-360/230 w-full overflow-hidden rounded-xl bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.thumbnailUrl}
            alt=""
            className="absolute inset-0 h-full w-full rounded-xl object-cover object-center opacity-90 transition-transform duration-500 ease-out origin-center scale-[1.18] group-hover:scale-[1.26] group-hover:opacity-100 motion-reduce:scale-[1.18] motion-reduce:transition-none motion-reduce:group-hover:scale-[1.18]"
          />
          <button
            type="button"
            onClick={toggle}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-coral text-black shadow-lg transition-transform hover:scale-105 sm:h-12 sm:w-12">
              <span className="text-2xl leading-none">
                {isPlaying ? "❚❚" : <span className="ml-0.5">▶</span>}
              </span>
            </span>
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col pt-0 sm:pt-2">
        <h3 className="text-xl font-semibold tracking-tight text-white">
          {item.title}
        </h3>
        <p
          className={`mt-2 max-w-[80ch] text-base leading-relaxed text-white/85 ${
            expanded ? "" : "line-clamp-5"
          }`}
        >
          {item.description}
        </p>
        {item.description && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 self-start text-sm font-semibold text-coral underline decoration-coral/70 underline-offset-4 hover:decoration-coral"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}

        <audio ref={audioRef} src={item.audioUrl} preload="metadata" onError={() => {}} />

        <div className="mt-5 flex w-full max-w-130 items-center gap-2.5 rounded-2xl bg-zinc-900 px-3.5 py-2.5 ring-1 ring-white/10 sm:gap-3">
          {/* Playback speed */}
          <button
            type="button"
            onClick={cycleRate}
            aria-label="Playback speed"
            className="shrink-0 text-xs font-semibold tabular-nums text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
          >
            {rate}&times;
          </button>

          {/* Skip back 15s */}
          <button
            type="button"
            onClick={() => skip(-15)}
            aria-label="Rewind 15 seconds"
            className="relative shrink-0 text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
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
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 3v4h4" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center pt-0.5 text-[7px] font-bold tabular-nums">
              15
            </span>
          </button>

          {/* Play / pause */}
          <button
            type="button"
            onClick={toggle}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="shrink-0 text-white transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
              className="h-6 w-6"
              aria-hidden
            >
              {isPlaying ? (
                <path d="M8 5.5h2.5v13H8zM13.5 5.5H16v13h-2.5z" fill="currentColor" />
              ) : (
                <path d="M8 5.5v13l11-6.5z" />
              )}
            </svg>
          </button>

          {/* Skip forward 30s */}
          <button
            type="button"
            onClick={() => skip(30)}
            aria-label="Forward 30 seconds"
            className="relative shrink-0 text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
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
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 3v4h-4" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center pt-0.5 text-[7px] font-bold tabular-nums">
              30
            </span>
          </button>

          {/* Progress */}
          <div
            onClick={seek}
            className="relative h-1.5 flex-1 cursor-pointer overflow-hidden rounded-full bg-white/25"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pct)}
          >
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Time */}
          <span className="shrink-0 text-[11px] font-medium tabular-nums text-white/85">
            {timeLabel}
          </span>

          {/* Volume */}
          <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
              className="shrink-0 text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
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
                <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" stroke="none" />
                {muted ? (
                  <path d="M16 9l5 6M21 9l-5 6" />
                ) : (
                  <>
                    <path d="M16 9a4 4 0 0 1 0 6" />
                    <path d="M18.5 6.5a8 8 0 0 1 0 11" />
                  </>
                )}
              </svg>
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              aria-label="Volume"
              className="h-1 w-14 cursor-pointer accent-coral"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

const PODCAST_LIMIT = 5;

export function UserPortalPodcastSection({
  groups,
}: {
  groups: HomePodcastGroup[];
}) {
  const labels = useMemo(() => groups.map((g) => g.label), [groups]);
  const [activeTab, setActiveTab] = useState<string>(labels[0] ?? "");
  const [showAll, setShowAll] = useState(false);

  const activeGroup = groups.find((g) => g.label === activeTab) ?? groups[0];
  const allItems = activeGroup?.items ?? [];
  const visibleItems = showAll ? allItems : allItems.slice(0, PODCAST_LIMIT);
  const hiddenCount = allItems.length - PODCAST_LIMIT;

  if (groups.length === 0) {
    return (
      <section className="mt-12 sm:mt-14 md:mt-16">
        <h2 className="text-left text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Listen to Story of Burma Podcast with No Ads
        </h2>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/4 py-12 text-center text-white/55">
          No podcasts published yet.
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12 sm:mt-14 md:mt-16">
      <h2 className="text-left text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Listen to Story of Burma Podcast with No Ads
      </h2>

      <div className="mt-5 flex flex-wrap items-center gap-0 text-sm sm:mt-6 sm:text-[15px]">
        {labels.map((label, i) => (
          <span key={label} className="flex items-center">
            {i > 0 && (
              <span className="mx-3 h-4 w-px shrink-0 bg-white/25 sm:mx-4" aria-hidden />
            )}
            <button
              type="button"
              onClick={() => { setActiveTab(label); setShowAll(false); }}
              className={`transition-colors ${
                activeTab === label
                  ? "font-semibold text-white"
                  : "font-medium text-mist hover:text-white/85"
              }`}
            >
              {label}
            </button>
          </span>
        ))}
      </div>

      <div className="mt-6 space-y-10 sm:mt-8 sm:space-y-12">
        {visibleItems.map((item) => (
          <PodcastPlayerRow key={item.id} item={item} />
        ))}
      </div>

      {!showAll && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-8 text-sm font-semibold text-coral transition-opacity hover:opacity-75"
        >
          See All ({allItems.length})
        </button>
      )}
    </section>
  );
}
