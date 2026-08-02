"use client";

import { useEffect, useRef, useState } from "react";
import {
  MediaPlayer,
  MediaProvider,
  Poster,
  type MediaPlayerInstance,
} from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";

import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

export default function VidstackPlayer({
  src,
  poster,
  title,
  initialSeconds,
  onTimeUpdate,
}: {
  src: string;
  poster: string;
  title: string;
  initialSeconds?: number;
  onTimeUpdate?: (currentSeconds: number, durationSeconds: number) => void;
}) {
  const playerRef = useRef<MediaPlayerInstance | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string | null>(null);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const seekTo = initialSeconds ?? 0;
    const trySeek = () => {
      if (seekTo > 0 && Number.isFinite(player.duration) && player.duration > 0) {
        player.currentTime = Math.min(seekTo, player.duration - 1);
      }
    };

    // Source videos aren't always 16:9 — once metadata is loaded (so the
    // real <video> element is guaranteed to exist and have dimensions),
    // size the box to match so nothing gets cropped/letterboxed away.
    const applyRatio = () => {
      const videoEl = player.el?.querySelector("video");
      if (videoEl && videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
        setAspectRatio(`${videoEl.videoWidth} / ${videoEl.videoHeight}`);
      }
    };

    const unsubLoaded = player.subscribe(({ duration }) => {
      if (duration > 0) {
        trySeek();
        applyRatio();
      }
    });

    let lastFire = 0;
    const unsubTime = player.subscribe(({ currentTime, duration }) => {
      if (!onTimeUpdate) return;
      const now = Date.now();
      if (now - lastFire < 5000) return; // throttle to every 5s
      if (currentTime <= 0 || duration <= 0) return;
      lastFire = now;
      onTimeUpdate(currentTime, duration);
    });

    return () => {
      unsubLoaded();
      unsubTime();
      // Best-effort final flush on unmount/page leave.
      if (onTimeUpdate && player.currentTime > 0 && player.duration > 0) {
        onTimeUpdate(player.currentTime, player.duration);
      }
    };
  }, [initialSeconds, onTimeUpdate]);

  return (
    <MediaPlayer
      key={src}
      ref={playerRef}
      title={title}
      src={{ src, type: "video/mp4" }}
      playsInline
      crossOrigin
      className={`w-full overflow-hidden rounded-2xl bg-black ${aspectRatio ? "" : "aspect-video"}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <MediaProvider />
      <Poster src={poster} alt={title} className="vds-poster" />
      <DefaultVideoLayout icons={defaultLayoutIcons} />
    </MediaPlayer>
  );
}
