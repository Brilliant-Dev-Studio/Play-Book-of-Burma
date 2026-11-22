"use client";

import { PlayCircle } from "@/app/components/play-circle";
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

/** Compact "1x" text button next to the gear — cycles through RATES on each click. */
function SpeedButton() {
  const rate = useMediaState("playbackRate");
  const remote = useMediaRemote();
  return (
    <button
      type="button"
      className="vds-button w-auto! px-2 text-sm font-semibold tabular-nums"
      aria-label={`Playback speed ${rate}x`}
      onClick={(e) => {
        const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length] ?? 1;
        remote.changePlaybackRate(next, e.nativeEvent);
      }}
    >
      {rate}x
    </button>
  );
}

/** Gear menu: Playback Speed and Quality side by side as two columns, icon-only trigger. */
function SettingsMenu() {
  const speed = usePlaybackRateOptions({ rates: RATES, normalLabel: "1" });
  const quality = useVideoQualityOptions({ auto: true, sort: "ascending" });

  return (
    <Menu.Root className="vds-menu">
      <Menu.Button className="vds-menu-button vds-button" aria-label="Settings">
        <SettingsIcon className="vds-rotate-icon vds-icon" />
      </Menu.Button>
      <Menu.Items className="vds-menu-items" placement="top end" offset={0}>
        <div className="grid grid-cols-2 gap-2 p-1">
          <div className="min-w-24">
            <p className="px-2.5 pb-1.5 text-[11px] font-medium text-white/50">Playback Speed</p>
            <Menu.RadioGroup value={speed.selectedValue}>
              {speed.map(({ label, value, select }) => (
                <Menu.Radio key={value} value={value} onSelect={select} className={radioClass}>
                  {label}
                </Menu.Radio>
              ))}
            </Menu.RadioGroup>
          </div>
          <div className="min-w-24 border-l border-white/10 pl-2">
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
        </div>
      </Menu.Items>
    </Menu.Root>
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
}) {
  const playerRef = useRef<MediaPlayerInstance | null>(null);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const initialSecondsRef = useRef(initialSeconds ?? 0);
  const seekDoneRef = useRef(false);
  const [needsGesture, setNeedsGesture] = useState(false);

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
            beforeSettingsMenu: <SpeedButton />,
            settingsMenu: <SettingsMenu />,
          }}
        />
      </MediaPlayer>

      {needsGesture ? (
        <button
          type="button"
          className="absolute inset-0 z-30 flex items-center justify-center bg-black"
          aria-label="Play video"
          onClick={() => {
            void playerRef.current?.play().catch(() => {});
            setNeedsGesture(false);
          }}
        >
          <PlayCircle size="lg" className="ring-1 ring-white/20" />
        </button>
      ) : null}
    </div>
  );
}
