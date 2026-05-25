"use client";

import { MediaPlayer, MediaProvider, Poster } from "@vidstack/react";
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
}: {
  src: string;
  poster: string;
  title: string;
}) {
  return (
    <MediaPlayer
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
