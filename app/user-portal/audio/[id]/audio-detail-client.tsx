"use client";

import { PlayCircle } from "@/app/components/play-circle";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatPlayerClock } from "@/lib/format-duration";
import type { PodcastDetail } from "@/lib/server/podcasts";
import { splitMyanmarParagraphs } from "@/lib/myanmar-text";
import { usePodcastPlayer } from "@/app/user-portal/podcast-player-context";

type Tab = "About" | "Biography" | "Note";
const TABS: Tab[] = ["About", "Biography", "Note"];

type NoteStatus = "loading" | "idle" | "saving" | "saved" | "error";

function formatChapterTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function SkipButton({
  direction,
  seconds,
  onClick,
  disabled,
}: {
  direction: "back" | "forward";
  seconds: number;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={
        direction === "back"
          ? `Rewind ${seconds} seconds`
          : `Forward ${seconds} seconds`
      }
      className="relative flex h-11 w-11 shrink-0 items-center justify-center text-white/90 transition-colors hover:text-white disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-10 w-10"
        aria-hidden
      >
        {direction === "back" ? (
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
      <span className="absolute inset-0 flex items-center justify-center pt-0.5 text-[11px] font-bold tabular-nums">
        {seconds}
      </span>
    </button>
  );
}

function Paragraphs({ lines, empty }: { lines: string[]; empty: string }) {
  if (lines.length === 0)
    return <p className="text-sm text-white/55">{empty}</p>;
  return (
    <div className="space-y-3">
      {lines.map((line, index) => (
        <p
          key={index}
          className="font-yati text-[15px] leading-relaxed text-white/90 sm:text-base"
        >
          {line}
        </p>
      ))}
    </div>
  );
}

export function AudioDetailClient({
  podcast,
  resumeSeconds,
}: {
  podcast: PodcastDetail;
  resumeSeconds: number | null;
}) {
  const player = usePodcastPlayer();
  const [activeTab, setActiveTab] = useState<Tab>("About");
  const resumeAppliedRef = useRef(false);

  // Note tab — loaded lazily the first time the tab opens, saved on blur.
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [noteStatus, setNoteStatus] = useState<NoteStatus>("loading");
  const noteLoadedRef = useRef(false);

  const isCurrent = player.current?.id === podcast.id;
  const isPlaying = isCurrent && player.isPlaying;
  const durationSec =
    isCurrent && player.durationSec
      ? player.durationSec
      : podcast.durationSeconds;
  const elapsedSec = isCurrent ? player.currentSec : 0;
  const pct =
    durationSec > 0 ? Math.min(100, (elapsedSec / durationSec) * 100) : 0;

  const aboutLines = useMemo(() => {
    const split = splitMyanmarParagraphs(podcast.description);
    return split.length > 0
      ? split
      : podcast.description.trim()
        ? [podcast.description.trim()]
        : [];
  }, [podcast.description]);

  const biographyLines = podcast.biographyParagraphs ?? [];

  useEffect(() => {
    resumeAppliedRef.current = false;
    player.loadEpisode(podcast);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when podcast id changes
  }, [podcast.id]);

  useEffect(() => {
    if (resumeSeconds == null || resumeAppliedRef.current) return;
    if (player.current?.id !== podcast.id) return;
    if (durationSec <= 0) return;
    player.seekTo(resumeSeconds);
    resumeAppliedRef.current = true;
  }, [
    resumeSeconds,
    player,
    podcast.id,
    durationSec,
    player.current?.id,
    player.durationSec,
  ]);

  useEffect(() => {
    if (activeTab !== "Note" || noteLoadedRef.current) return;
    noteLoadedRef.current = true;
    fetch(`/api/notes/podcast/${podcast.id}`)
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then((d: { content: string | null }) => {
        setNote(d.content ?? "");
        setSavedNote(d.content ?? "");
        setNoteStatus("idle");
      })
      .catch(() => {
        noteLoadedRef.current = false; // allow a retry on next tab open
        setNoteStatus("error");
      });
  }, [activeTab, podcast.id]);

  async function saveNote() {
    if (noteStatus === "loading" || note === savedNote) return;
    setNoteStatus("saving");
    try {
      const res = await fetch(`/api/notes/podcast/${podcast.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: note }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSavedNote(note);
      setNoteStatus("saved");
      setTimeout(
        () => setNoteStatus((s) => (s === "saved" ? "idle" : s)),
        2000,
      );
    } catch {
      setNoteStatus("error");
    }
  }

  function seekFromBar(e: React.MouseEvent<HTMLDivElement>) {
    if (!isCurrent || !durationSec) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(0, (e.clientX - rect.left) / rect.width),
    );
    player.seekTo(ratio * durationSec);
  }

  const remainingSec = Math.max(0, durationSec - elapsedSec);

  const tabBody =
    activeTab === "Note" ? (
      <div className="flex flex-col gap-2">
        <textarea
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            if (noteStatus === "saved" || noteStatus === "error")
              setNoteStatus("idle");
          }}
          onBlur={() => void saveNote()}
          disabled={noteStatus === "loading"}
          placeholder={
            noteStatus === "loading"
              ? "Loading…"
              : "Type Your Note Here........."
          }
          aria-label="Your notes"
          className="block min-h-48 w-full resize-y bg-transparent font-yati text-[15px] leading-relaxed text-white outline-none placeholder:text-white/40 disabled:opacity-60"
        />
        <div className="flex items-center justify-end text-xs">
          {noteStatus === "saving" && (
            <span className="text-white/55">Saving…</span>
          )}
          {noteStatus === "saved" && (
            <span className="text-emerald-400">Saved</span>
          )}
          {noteStatus === "error" && (
            <span className="text-red-300">Couldn&apos;t save — try again</span>
          )}
          {noteStatus === "idle" && (
            <span className="text-white/35">
              Notes auto-save when you click away
            </span>
          )}
        </div>
      </div>
    ) : activeTab === "Biography" ? (
      <Paragraphs lines={biographyLines} empty="No biography yet." />
    ) : (
      <>
        <Paragraphs lines={aboutLines} empty="No description yet." />
        {podcast.chapters.length > 0 ? (
          <ul className="mt-6 grid gap-1 border-t border-white/10 pt-5">
            {podcast.chapters.map((chapter, index) => (
              <li key={`${chapter.seconds}-${index}`}>
                <button
                  type="button"
                  onClick={() => player.seekTo(chapter.seconds)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/5"
                >
                  <PlayCircle size="sm" className="ring-1 ring-white/15" />
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-white/70">
                    {formatChapterTime(chapter.seconds)}
                  </span>
                  <span className="min-w-0 text-sm font-medium text-white sm:text-[15px]">
                    {chapter.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </>
    );

  return (
    <div className="w-full pb-8 sm:pb-10">
      {/* Same horizontal padding as PortalHeader so the link sits directly under the logo. */}
      <div className="px-4 pt-4 sm:px-6 lg:px-10">
        <Link
          href="/user-portal/library"
          className="inline-flex items-center gap-1 text-sm font-semibold text-white/85 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
        >
          <span aria-hidden>←</span> Back to Library
        </Link>
      </div>

      <div className="mx-auto w-full max-w-[820px] px-4 sm:px-6">
        {/* Player block — cover, title, progress, controls */}
        <div className="mx-auto mt-6 w-full max-w-[600px]">
          <div className="mx-auto aspect-square w-full max-w-[440px] overflow-hidden rounded-3xl bg-white/5 shadow-[0_20px_56px_rgba(0,0,0,0.55)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={podcast.thumbnailUrl}
              alt=""
              className="h-full w-full object-cover object-center"
            />
          </div>

          <div className="mt-5 border-l-4 border-coral pl-4">
            <h1 className="text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl">
              {podcast.title}
            </h1>
            {podcast.durationLabel ? (
              <p className="mt-1 text-sm font-medium text-white/70 sm:text-base">
                {podcast.durationLabel}
              </p>
            ) : null}
          </div>

          <div className="mt-6">
            <div
              role="slider"
              tabIndex={0}
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(durationSec)}
              aria-valuenow={Math.round(elapsedSec)}
              aria-valuetext={`${formatPlayerClock(elapsedSec)} of ${formatPlayerClock(durationSec)}`}
              onClick={seekFromBar}
              onKeyDown={(e) => {
                if (!isCurrent) return;
                if (e.key === "ArrowRight") player.skip(5);
                if (e.key === "ArrowLeft") player.skip(-5);
              }}
              className="relative h-3 w-full cursor-pointer overflow-hidden rounded-full bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
            >
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-xs font-medium tabular-nums text-white/85">
              <span>{formatPlayerClock(elapsedSec)}</span>
              <span>-{formatPlayerClock(remainingSec)}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between px-1">
            <button
              type="button"
              onClick={player.cycleRate}
              aria-label="Playback speed"
              className="w-11 shrink-0 text-left text-lg font-semibold tabular-nums text-white/90 hover:text-white"
            >
              {player.rate}x
            </button>

            <SkipButton
              direction="back"
              seconds={15}
              disabled={!isCurrent}
              onClick={() => player.skip(-15)}
            />

            <button
              type="button"
              onClick={player.toggle}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="flex h-14 w-14 shrink-0 items-center justify-center text-white transition-transform hover:scale-105"
            >
              <svg viewBox="0 0 24 24" className="h-12 w-12" aria-hidden>
                {isPlaying ? (
                  <path
                    d="M7 4.5h3.5v15H7zM13.5 4.5H17v15h-3.5z"
                    fill="currentColor"
                  />
                ) : (
                  <path
                    d="M7 4.5v15l12.5-7.5z"
                    fill="currentColor"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            </button>

            <SkipButton
              direction="forward"
              seconds={30}
              disabled={!isCurrent}
              onClick={() => player.skip(30)}
            />

            <button
              type="button"
              onClick={player.toggleMute}
              aria-label={player.muted ? "Unmute" : "Mute"}
              className="flex w-11 shrink-0 justify-end text-white/90 transition-colors hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
                <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" />
                {player.muted ? (
                  <path
                    d="M16 9l5 6M21 9l-5 6"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                ) : (
                  <>
                    <path
                      d="M15.5 9a4 4 0 0 1 0 6"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      fill="none"
                    />
                    <path
                      d="M18 6.5a8 8 0 0 1 0 11"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      fill="none"
                    />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="mt-8 flex gap-10 rounded-xl bg-zinc-900 px-5 pt-3 sm:gap-24 sm:px-6"
          role="tablist"
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-4 pb-2.5 text-base font-semibold transition-colors sm:text-[17px] ${
                activeTab === tab
                  ? "border-coral font-bold text-white"
                  : "border-transparent text-white/80 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div
          className="mt-4 min-h-[260px] rounded-xl bg-zinc-900 px-5 py-6 sm:px-6"
          role="tabpanel"
        >
          {tabBody}
        </div>
      </div>
    </div>
  );
}
