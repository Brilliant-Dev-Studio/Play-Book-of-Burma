"use client";

import { PlayCircle } from "@/app/components/play-circle";
import { useState } from "react";
import dynamic from "next/dynamic";

const VidstackPlayer = dynamic(
  () => import("@/app/user-portal/watch/vidstack-player"),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-video w-full animate-pulse rounded-2xl bg-zinc-900 md:rounded-3xl" />
    ),
  },
);

export function TrailerSection({
  trailerUrl,
  posterUrl,
  title,
}: {
  trailerUrl: string;
  posterUrl: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="overflow-hidden rounded-2xl shadow-[0_20px_56px_rgba(0,0,0,0.55)] ring-1 ring-white/10 md:rounded-3xl">
        <VidstackPlayer src={trailerUrl} poster={posterUrl} title={title} />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative aspect-video w-full cursor-pointer overflow-hidden rounded-2xl shadow-[0_20px_56px_rgba(0,0,0,0.55)] ring-1 ring-white/10 outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-transparent md:rounded-3xl"
      aria-label="Play trailer"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.55)_0%,transparent_38%,transparent_65%,rgba(0,0,0,0.35)_100%)]"
        aria-hidden
      />
      <p className="absolute left-4 top-4 z-10 text-lg font-bold tracking-tight text-white sm:left-6 sm:top-5 sm:text-xl">
        Watch Trailer
      </p>
      <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <PlayCircle size="lg" />
      </span>
    </button>
  );
}
