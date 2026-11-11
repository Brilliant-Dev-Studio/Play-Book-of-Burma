"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MediaPlayer,
  MediaProvider,
  Menu,
  useVideoQualityOptions,
  type MediaPlayerInstance,
} from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";

import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

const MenuIcons = defaultLayoutIcons.Menu;

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

function ResolutionMenu() {
  const options = useVideoQualityOptions({ auto: true, sort: "descending" });
  const current = options.selectedQuality;
  const hint =
    options.selectedValue === "auto"
      ? current?.height
        ? `Auto (${current.height}p)`
        : "Auto"
      : current?.height
        ? `${current.height}p`
        : "—";

  return (
    <Menu.Root className="vds-menu">
      <Menu.Button
        className="vds-menu-item"
        disabled={options.disabled}
        aria-label="Resolution"
      >
        <MenuIcons.ArrowLeft className="vds-menu-close-icon vds-icon" />
        <span className="vds-menu-item-label">Resolution</span>
        <span className="vds-menu-item-hint" data-part="hint">
          {hint}
        </span>
        <MenuIcons.ArrowRight className="vds-menu-open-icon vds-icon" />
      </Menu.Button>
      <Menu.Content className="vds-menu-items">
        <Menu.RadioGroup className="vds-radio-group" value={options.selectedValue}>
          {options.map(({ label, value, select }) => (
            <Menu.Radio
              className="vds-radio"
              value={value}
              onSelect={select}
              key={value}
            >
              <MenuIcons.RadioCheck className="vds-icon" />
              <span className="vds-radio-label">{label}</span>
            </Menu.Radio>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
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
  const [buffering, setBuffering] = useState(true);
  const [needsGesture, setNeedsGesture] = useState(false);

  onTimeUpdateRef.current = onTimeUpdate;
  initialSecondsRef.current = initialSeconds ?? 0;

  const sources = useMemo(() => buildQualitySources(qualities, src), [qualities, src]);

  useEffect(() => {
    setBuffering(true);
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
          setBuffering(false);
          const player = playerRef.current;
          if (!player || seekDoneRef.current) return;
          const seekTo = initialSecondsRef.current;
          if (seekTo > 0 && Number.isFinite(player.duration) && player.duration > 0) {
            player.currentTime = Math.min(seekTo, Math.max(player.duration - 1, 0));
            seekDoneRef.current = true;
          }
        }}
        onPlaying={() => {
          setBuffering(false);
          setNeedsGesture(false);
        }}
        onWaiting={() => setBuffering(true)}
        onAutoPlayFail={() => {
          setBuffering(false);
          setNeedsGesture(true);
        }}
      >
        <MediaProvider />
        <DefaultVideoLayout
          icons={defaultLayoutIcons}
          slots={{
            settingsMenuItemsEnd: <ResolutionMenu />,
          }}
        />
      </MediaPlayer>

      {buffering && !needsGesture ? (
        // No background fill here on purpose — covering the whole player in solid
        // black during buffering hides the controls bar underneath (play/pause,
        // settings, timeline), leaving the viewer with nothing to interact with
        // if buffering takes a while or gets stuck. The frame and controls stay
        // visible; only a small spinner floats on top.
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          aria-hidden
        >
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-coral drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]" />
        </div>
      ) : null}

      {needsGesture ? (
        <button
          type="button"
          className="absolute inset-0 z-30 flex items-center justify-center bg-black"
          aria-label="Play video"
          onClick={() => {
            void playerRef.current?.play().catch(() => {});
            setNeedsGesture(false);
            setBuffering(true);
          }}
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-coral text-black shadow-lg">
            <span className="ml-1 text-2xl leading-none">▶</span>
          </span>
        </button>
      ) : null}
    </div>
  );
}
