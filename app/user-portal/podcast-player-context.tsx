"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { UserPortalPodcastItem } from "@/lib/server/podcasts";
import { savePodcastProgress } from "@/app/user-portal/podcast-actions";

const SAVE_INTERVAL_SEC = 10;

type PodcastPlayerState = {
  current: UserPortalPodcastItem | null;
  isPlaying: boolean;
  currentSec: number;
  durationSec: number;
  rate: number;
  volume: number;
  muted: boolean;
  playItem: (item: UserPortalPodcastItem) => void;
  toggle: () => void;
  seekTo: (sec: number) => void;
  skip: (delta: number) => void;
  cycleRate: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  close: () => void;
};

const PodcastPlayerContext = createContext<PodcastPlayerState | null>(null);

const SPEEDS = [1, 1.25, 1.5, 1.75, 2];

export function PodcastPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState<UserPortalPodcastItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [rate, setRate] = useState(1);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);

  const lastSavedSecRef = useRef<number>(-SAVE_INTERVAL_SEC);
  const currentIdRef = useRef<string | null>(null);

  const saveProgress = useCallback((id: string, currentTime: number, duration: number, force = false) => {
    if (!force && currentTime - lastSavedSecRef.current < SAVE_INTERVAL_SEC) return;
    lastSavedSecRef.current = currentTime;
    void savePodcastProgress(id, currentTime, duration);
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      setIsPlaying(false);
      const id = currentIdRef.current;
      if (id) saveProgress(id, el.currentTime, el.duration || durationSec, true);
    };
    const onTime = () => {
      setCurrentSec(el.currentTime);
      const id = currentIdRef.current;
      if (id) saveProgress(id, el.currentTime, el.duration || durationSec);
    };
    const onMeta = () => {
      if (Number.isFinite(el.duration) && el.duration > 0) setDurationSec(el.duration);
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
  }, [durationSec, saveProgress]);

  const playItem = useCallback((item: UserPortalPodcastItem) => {
    const el = audioRef.current;
    if (!el) return;
    if (currentIdRef.current === item.id) {
      if (el.paused) void el.play();
      else el.pause();
      return;
    }
    currentIdRef.current = item.id;
    lastSavedSecRef.current = -SAVE_INTERVAL_SEC;
    setCurrent(item);
    setCurrentSec(0);
    setDurationSec(item.durationSeconds || 0);
    el.src = item.audioUrl;
    el.playbackRate = rate;
    el.volume = muted ? 0 : volume;
    void el.play();
  }, [rate, volume, muted]);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el || !current) return;
    if (el.paused) void el.play();
    else el.pause();
  }, [current]);

  const seekTo = useCallback((sec: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Math.min(durationSec || el.duration || 0, Math.max(0, sec));
    setCurrentSec(el.currentTime);
  }, [durationSec]);

  const skip = useCallback((delta: number) => {
    const el = audioRef.current;
    if (!el) return;
    seekTo(el.currentTime + delta);
  }, [seekTo]);

  const cycleRate = useCallback(() => {
    setRate((r) => {
      const next = SPEEDS[(SPEEDS.indexOf(r) + 1) % SPEEDS.length];
      if (audioRef.current) audioRef.current.playbackRate = next;
      return next;
    });
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    setMuted(v === 0);
    const el = audioRef.current;
    if (el) {
      el.volume = v;
      el.muted = v === 0;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  }, []);

  const close = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      if (currentIdRef.current) {
        saveProgress(currentIdRef.current, el.currentTime, el.duration || durationSec, true);
      }
      el.removeAttribute("src");
      el.load();
    }
    currentIdRef.current = null;
    setCurrent(null);
    setIsPlaying(false);
    setCurrentSec(0);
  }, [durationSec, saveProgress]);

  return (
    <PodcastPlayerContext.Provider
      value={{
        current,
        isPlaying,
        currentSec,
        durationSec,
        rate,
        volume,
        muted,
        playItem,
        toggle,
        seekTo,
        skip,
        cycleRate,
        setVolume,
        toggleMute,
        close,
      }}
    >
      <audio ref={audioRef} preload="metadata" onError={() => {}} />
      {children}
    </PodcastPlayerContext.Provider>
  );
}

export function usePodcastPlayer(): PodcastPlayerState {
  const ctx = useContext(PodcastPlayerContext);
  if (!ctx) throw new Error("usePodcastPlayer must be used within PodcastPlayerProvider");
  return ctx;
}
