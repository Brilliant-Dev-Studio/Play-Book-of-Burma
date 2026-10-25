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

/** Distinct fragment per rung so Vidstack registers multiple qualities (same MP4 until multi-rendition). */
function buildQualitySources(src: string) {
  return [
    { src: `${src}#pob=1080`, type: "video/mp4" as const, width: 1920, height: 1080 },
    { src: `${src}#pob=720`, type: "video/mp4" as const, width: 1280, height: 720 },
    { src: `${src}#pob=480`, type: "video/mp4" as const, width: 854, height: 480 },
  ];
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
        className="vds-menu-button"
        disabled={options.disabled}
        aria-label="Resolution"
      >
        <span className="vds-menu-button-label">Resolution</span>
        <span className="vds-menu-button-hint" data-part="hint">
          {hint}
        </span>
        <MenuIcons.ArrowRight className="vds-menu-button-icon" />
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
  poster: _poster,
  title,
  initialSeconds,
  onTimeUpdate,
  autoPlay = true,
}: {
  src: string;
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

  const sources = useMemo(() => buildQualitySources(src), [src]);

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
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black"
          aria-hidden
        >
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-coral" />
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
