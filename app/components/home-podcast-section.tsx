"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { HomePodcastGroup, HomePodcastItem } from "@/lib/server/podcasts";
import { PodcastPlayerRow } from "./user-portal-podcast-section";

const MEMBERSHIP_HREF = "/membership";

function PlayBadge({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      aria-label="Become a member to listen"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-coral text-black shadow-lg transition-transform hover:scale-105 sm:h-12 sm:w-12">
        <span className="ml-0.5 text-2xl leading-none">▶</span>
      </span>
    </Link>
  );
}

function PodcastRow({ item }: { item: HomePodcastItem }) {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    // Temporarily remove clamp to measure true full height vs clamped height
    el.style.webkitLineClamp = "unset";
    const fullH = el.scrollHeight;
    el.style.webkitLineClamp = "";
    setIsClamped(fullH > el.clientHeight + 2);
  }, [item.description]);

  return (
    <article className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
      {/* Thumbnail — fixed size, portal-style gray border frame */}
      <div className="group w-full shrink-0 rounded-2xl border-2 border-white/30 p-1.25 shadow-[0_14px_44px_rgba(0,0,0,0.45)] transition-colors hover:border-white/45 sm:w-[320px] lg:w-90">
        <div className="relative aspect-360/230 w-full overflow-hidden rounded-xl bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.thumbnailUrl}
            alt=""
            className="absolute inset-0 h-full w-full rounded-xl object-cover object-center opacity-90 transition-transform duration-500 ease-out origin-center scale-[1.18] group-hover:scale-[1.26] group-hover:opacity-100 motion-reduce:scale-[1.18] motion-reduce:transition-none motion-reduce:group-hover:scale-[1.18]"
          />
          <PlayBadge href={MEMBERSHIP_HREF} />
        </div>
      </div>

      {/* Content — fills remaining width, clipped so it can't overflow */}
      <div className="min-w-0 flex-1 pt-0 sm:pt-2">
        <h3 className="line-clamp-2 text-xl font-semibold leading-snug tracking-tight text-white">
          {item.title}
        </h3>
        <p
          ref={descRef}
          className={`mt-2 text-base leading-relaxed text-white/75 ${
            expanded ? "" : "line-clamp-3"
          }`}
        >
          {item.description}
        </p>
        {(isClamped || expanded) && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 block text-sm font-semibold text-coral underline decoration-coral/70 underline-offset-4 hover:decoration-coral"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
        <Link
          href={MEMBERSHIP_HREF}
          className="mt-3 flex w-fit items-center gap-1 text-lg font-semibold text-coral underline decoration-coral/70 underline-offset-4 hover:decoration-coral"
        >
          Watch Now
          <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}

export function HomePodcastSection({
  groups,
  variant = "default",
  withPlayer = false,
}: {
  groups: HomePodcastGroup[];
  /** Tighter vertical padding when stacked under another section (e.g. Library). */
  variant?: "default" | "embedded";
  /** Render an inline audio player (portal) instead of the membership-gated "Watch Now" link. */
  withPlayer?: boolean;
}) {
  const labels = useMemo(() => groups.map((g) => g.label), [groups]);
  const [activeTab, setActiveTab] = useState<string>(labels[0] ?? "");

  const activeGroup = groups.find((g) => g.label === activeTab) ?? groups[0];

  const sectionPad =
    variant === "embedded"
      ? "bg-black pt-8 pb-14 sm:pt-10 sm:pb-16 md:pt-12 md:pb-20 lg:pb-24"
      : "bg-black py-5 md:py-7 lg:py-6 xl:py-9";

  return (
    <section className={sectionPad}>
      <div className="mx-auto w-full max-w-[80%] px-4 sm:px-6 lg:px-8">
        <h2 className="text-left text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Listen to Story of Burma Podcast with No Ads
        </h2>

        {groups.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/4 py-12 text-center text-white/55">
            No podcasts published yet.
          </div>
        ) : (
          <>
            <div
              className={
                variant === "embedded"
                  ? "mt-5 flex flex-wrap items-center gap-0 text-sm sm:mt-6 sm:text-[15px]"
                  : "mt-8 flex flex-wrap items-center gap-0 text-sm sm:mt-10 sm:text-[15px]"
              }
            >
              {labels.map((label, i) => (
                <span key={label} className="flex items-center">
                  {i > 0 && (
                    <span
                      className="mx-3 h-4 w-px shrink-0 bg-white/25 sm:mx-4"
                      aria-hidden
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveTab(label)}
                    className={`transition-colors ${
                      activeTab === label
                        ? "font-semibold text-white"
                        : "font-medium text-mist hover:text-white/85"
                    }`}
                  >
                    {label}
                  </button>
                </span>
              ))}
            </div>

            <div
              className={
                variant === "embedded"
                  ? "mt-6 space-y-12 sm:mt-8 sm:space-y-14"
                  : "mt-10 space-y-14"
              }
            >
              {activeGroup?.items.map((item) =>
                withPlayer ? (
                  <PodcastPlayerRow key={item.id} item={item} />
                ) : (
                  <PodcastRow key={item.id} item={item} />
                ),
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
