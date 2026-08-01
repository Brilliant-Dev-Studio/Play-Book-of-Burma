"use client";

import { PodcastPlayerProvider } from "@/app/user-portal/podcast-player-context";
import { FloatingPodcastPlayer } from "@/app/user-portal/floating-podcast-player";

export function PodcastPlayerShell({ children }: { children: React.ReactNode }) {
  return (
    <PodcastPlayerProvider>
      {children}
      <FloatingPodcastPlayer />
    </PodcastPlayerProvider>
  );
}
