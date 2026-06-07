"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const seekTo = initialSeconds ?? 0;
    const trySeek = () => {
      if (seekTo > 0 && Number.isFinite(player.duration) && player.duration > 0) {
        player.currentTime = Math.min(seekTo, player.duration - 1);
      }
    };

    const unsubLoaded = player.subscribe(({ duration }) => {
      if (duration > 0) {
        trySeek();
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
      ref={playerRef}
      title={title}
      src={{ src, type: "video/mp4" }}
      playsInline
      crossOrigin
      className="aspect-video w-full overflow-hidden rounded-2xl bg-black"
    >
      <MediaProvider />
      <Poster src={poster} alt={title} className="vds-poster" />
      <DefaultVideoLayout icons={defaultLayoutIcons} />
    </MediaPlayer>
  );
}
