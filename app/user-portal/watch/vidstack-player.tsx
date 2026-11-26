"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MediaPlayer,
  MediaProvider,
  Menu,
  useMediaRemote,
  useMediaState,
  usePlaybackRateOptions,
  useVideoQualityOptions,
  type MediaPlayerInstance,
} from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";

import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

export type QualitySource = { label: string; height: number | null; url: string; isSource: boolean };

/** One real MP4 source per transcoded rung + the untouched source as "Original". Falls back to
 * a single source when renditions aren't ready yet — Vidstack then disables the Resolution menu
 * entry on its own (useVideoQualityOptions reports `disabled` for a single-candidate list). */
function buildQualitySources(qualities: QualitySource[] | undefined, fallbackSrc: string) {
  if (!qualities?.length) return [{ src: fallbackSrc, type: "video/mp4" as const }];
  return qualities
    .slice()
    .sort((a, b) => (b.height ?? Infinity) - (a.height ?? Infinity))
    .map((q) => ({
      src: q.url,
      type: "video/mp4" as const,
      height: q.height ?? undefined,
      width: q.height ? Math.round((q.height * 16) / 9) : undefined,
    }));
}

// Reuse the default layout's bundled icon — `@vidstack/react/icons` needs the separate
// `media-icons` package, which isn't installed.
const SettingsIcon = defaultLayoutIcons.Menu.Settings;

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

const radioClass =
  "flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-white/85 outline-none transition-colors hover:bg-white/10 focus-visible:bg-white/10 data-[checked]:bg-white/15 data-[checked]:text-white";

/** "1x" button → its own menu with the playback speeds. */
function SpeedMenu() {
  const rate = useMediaState("playbackRate");
  const speed = usePlaybackRateOptions({ rates: RATES, normalLabel: "1x" });

  return (
    <Menu.Root className="vds-menu">
      <Menu.Button
        className="vds-menu-button vds-button text-[13px] font-semibold tabular-nums"
        aria-label={`Playback speed ${rate}x`}
      >
        {rate}x
      </Menu.Button>
      <Menu.Items className="vds-menu-items [--media-menu-min-width:0px]" placement="top end" offset={0}>
        <div className="w-28">
          <p className="px-2.5 pb-1.5 text-[11px] font-medium text-white/50">Playback Speed</p>
          <Menu.RadioGroup value={speed.selectedValue}>
            {speed.map(({ label, value, select }) => (
              <Menu.Radio key={value} value={value} onSelect={select} className={radioClass}>
                {label}
              </Menu.Radio>
            ))}
          </Menu.RadioGroup>
        </div>
      </Menu.Items>
    </Menu.Root>
  );
}

/** Gear button → its own menu with the video quality (resolution) options. */
function SettingsMenu() {
  const quality = useVideoQualityOptions({ auto: true, sort: "ascending" });

  return (
    <Menu.Root className="vds-menu">
      <Menu.Button className="vds-menu-button vds-button" aria-label="Quality">
        <SettingsIcon className="vds-rotate-icon vds-icon" />
      </Menu.Button>
      <Menu.Items className="vds-menu-items [--media-menu-min-width:0px]" placement="top end" offset={0}>
        <div className="w-28">
          <p className="px-2.5 pb-1.5 text-[11px] font-medium text-white/50">Quality</p>
          {quality.disabled ? (
            <p className="px-2.5 py-1.5 text-[13px] text-white/50">Auto</p>
          ) : (
            <Menu.RadioGroup value={quality.selectedValue}>
              {quality.map(({ label, value, quality: q, select }) => (
                <Menu.Radio key={value} value={value} onSelect={select} className={radioClass}>
                  {label}
                  {q && q.height >= 720 ? (
                    <span className="rounded-sm bg-white/20 px-1 text-[9px] font-bold leading-tight">HD</span>
                  ) : null}
                </Menu.Radio>
              ))}
            </Menu.RadioGroup>
          )}
        </div>
      </Menu.Items>
    </Menu.Root>
  );
}

function SeekIcon({ dir }: { dir: -1 | 1 }) {
  return (
    <span className="relative flex h-9 w-9 items-center justify-center sm:h-11 sm:w-11">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        {dir < 0 ? (
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
      <span className="pt-0.5 text-[10px] font-bold tabular-nums sm:text-xs">10</span>
    </span>
  );
}

/**
 * App-style centre transport: previous lesson · back 10s · play/pause · forward 10s · next lesson.
 * Follows the default layout's control visibility (shown on hover/tap and while paused).
 */
function CenterControls({
  onPrev,
  onNext,
  lessonNav,
}: {
  onPrev?: () => void;
  onNext?: () => void;
  /** Show the previous/next lesson buttons (watch page) — off for single clips like trailers. */
  lessonNav: boolean;
}) {
  const remote = useMediaRemote();
  const paused = useMediaState("paused");
  const visible = useMediaState("controlsVisible");
  const currentTime = useMediaState("currentTime");
  const duration = useMediaState("duration");

  const seek = (dx: number, e: React.MouseEvent) =>
    remote.seek(Math.min(Math.max(0, currentTime + dx), Math.max(0, duration - 0.5)), e.nativeEvent);

  const btn =
    "pointer-events-auto flex items-center justify-center rounded-full text-white transition-[transform,opacity] hover:scale-105 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80";

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-[5] flex items-center justify-center gap-5 bg-black/25 transition-opacity duration-200 sm:gap-9 ${
        visible || paused ? "opacity-100" : "opacity-0"
      }`}
    >
      {lessonNav ? (
      <button type="button" className={btn} onClick={onPrev} disabled={!onPrev} aria-label="Previous lesson">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 sm:h-9 sm:w-9" aria-hidden>
          <path d="M6 5h2v14H6zM20 5.5v13L9.5 12z" />
        </svg>
      </button>
      ) : null}
      <button type="button" className={btn} onClick={(e) => seek(-10, e)} aria-label="Back 10 seconds">
        <SeekIcon dir={-1} />
      </button>
      <button
        type="button"
        className={`${btn} h-14 w-14 bg-white/15 backdrop-blur-sm sm:h-16 sm:w-16`}
        onClick={(e) => (paused ? remote.play(e.nativeEvent) : remote.pause(e.nativeEvent))}
        aria-label={paused ? "Play" : "Pause"}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden>
          {paused ? (
            <path d="M8.5 5.3v13.4a.8.8 0 0 0 1.2.7l10.6-6.7a.8.8 0 0 0 0-1.4L9.7 4.6a.8.8 0 0 0-1.2.7z" />
          ) : (
            <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
          )}
        </svg>
      </button>
      <button type="button" className={btn} onClick={(e) => seek(10, e)} aria-label="Forward 10 seconds">
        <SeekIcon dir={1} />
      </button>
      {lessonNav ? (
      <button type="button" className={btn} onClick={onNext} disabled={!onNext} aria-label="Next lesson">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 sm:h-9 sm:w-9" aria-hidden>
          <path d="M16 5h2v14h-2zM4 5.5v13L14.5 12z" />
        </svg>
      </button>
      ) : null}
    </div>
  );
}

export default function VidstackPlayer({
  src,
  qualities,
  poster: _poster,
  title,
  initialSeconds,
  onTimeUpdate,
  autoPlay = true,
  onPrev,
  onNext,
  lessonNav = false,
}: {
  src: string;
  /** Real per-rendition sources; omit/empty while transcoding is still in progress. */
  qualities?: QualitySource[];
  /** Kept for call-site compat — preview poster is intentionally unused. */
  poster?: string;
  title: string;
  initialSeconds?: number;
  onTimeUpdate?: (currentSeconds: number, durationSeconds: number) => void;
  /** Watch page starts playback immediately (no poster preview). */
  autoPlay?: boolean;
  /** Centre-control lesson navigation; omit to disable that button. */
  onPrev?: () => void;
  onNext?: () => void;
  /** Show previous/next lesson buttons in the centre controls. */
  lessonNav?: boolean;
}) {
  const playerRef = useRef<MediaPlayerInstance | null>(null);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const initialSecondsRef = useRef(initialSeconds ?? 0);
  const seekDoneRef = useRef(false);
  // Autoplay blocked: CenterControls already shows a play button while paused, so no extra overlay.
  const [, setNeedsGesture] = useState(false);

  onTimeUpdateRef.current = onTimeUpdate;
  initialSecondsRef.current = initialSeconds ?? 0;

  const sources = useMemo(() => buildQualitySources(qualities, src), [qualities, src]);

  useEffect(() => {
    setNeedsGesture(false);
    seekDoneRef.current = false;
  }, [src]);

  // Stable subscription — never depends on inline callbacks (avoids remount loops
  // that trigger Vidstack's `$state[prop] is not a function` under Next.js 16).
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const trySeek = () => {
      if (seekDoneRef.current) return;
      const seekTo = initialSecondsRef.current;
      if (seekTo > 0 && Number.isFinite(player.duration) && player.duration > 0) {
        player.currentTime = Math.min(seekTo, Math.max(player.duration - 1, 0));
        seekDoneRef.current = true;
      }
    };

    const unsubLoaded = player.subscribe(({ duration }) => {
      if (duration > 0) trySeek();
    });

    let lastFire = 0;
    const unsubTime = player.subscribe(({ currentTime, duration }) => {
      const cb = onTimeUpdateRef.current;
      if (!cb) return;
      const now = Date.now();
      if (now - lastFire < 5000) return;
      if (currentTime <= 0 || duration <= 0) return;
      lastFire = now;
      cb(currentTime, duration);
    });

    return () => {
      unsubLoaded();
      unsubTime();
      const cb = onTimeUpdateRef.current;
      if (cb && player.currentTime > 0 && player.duration > 0) {
        cb(player.currentTime, player.duration);
      }
    };
  }, [src]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      <MediaPlayer
        ref={playerRef}
        title={title}
        src={sources}
        playsInline
        autoPlay={autoPlay}
        crossOrigin
        logLevel="silent"
        className="h-full w-full [&_video]:object-contain"
        onCanPlay={() => {
          const player = playerRef.current;
          if (!player) return;
          // In "Auto", Vidstack re-picks the rendition on *every* player resize (closest
          // width/height to the player box) and reloads the video when it changes — so
          // toggling the sidebar made the video reload and show the buffering spinner.
          // Pin whatever Auto picked once playback is ready: re-selecting the already
          // selected quality only turns auto (and its resize watcher) off — no reload.
          const picked = player.qualities.selected;
          if (player.qualities.auto && picked && !player.qualities.readonly) {
            picked.selected = true;
          }
          if (seekDoneRef.current) return;
          const seekTo = initialSecondsRef.current;
          if (seekTo > 0 && Number.isFinite(player.duration) && player.duration > 0) {
            player.currentTime = Math.min(seekTo, Math.max(player.duration - 1, 0));
            seekDoneRef.current = true;
          }
        }}
        onPlaying={() => setNeedsGesture(false)}
        onAutoPlayFail={() => setNeedsGesture(true)}
      >
        <MediaProvider />
        {/* Right side of the controls bar is icon-only: 1x · settings · fullscreen.
            Buffering uses Vidstack's own built-in indicator (no second custom spinner). */}
        <DefaultVideoLayout
          icons={defaultLayoutIcons}
          slots={{
            captionButton: null,
            pipButton: null,
            airPlayButton: null,
            googleCastButton: null,
            chaptersMenu: null,
            beforeSettingsMenu: <SpeedMenu />,
            settingsMenu: <SettingsMenu />,
            // Phones: CenterControls replaces the small layout's own centre play / seek buttons.
            smallLayout: { playButton: null, seekBackwardButton: null, seekForwardButton: null },
          }}
        />
        <CenterControls onPrev={onPrev} onNext={onNext} lessonNav={lessonNav} />
      </MediaPlayer>

    </div>
  );
}
