"use client";

import Image from "next/image";
import Link from "next/link";
import podcastThumb from "@/app/assets/podcast/woman-speaking.png";

type PodcastItem = {
  title: string;
  description: string;
  duration: string;
  progressPct: number;
  href?: string;
};

const PODCASTS: PodcastItem[] = [
  {
    title: "Ko Jeremy Kyaw – Co Founder of Burma Capital",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    duration: "1 Hr 11 mins",
    progressPct: 6,
    href: "#",
  },
  {
    title: "Ko Jeremy Kyaw – Co Founder of Burma Capital",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    duration: "1 Hr 11 mins",
    progressPct: 6,
    href: "#",
  },
  {
    title: "Ko Jeremy Kyaw – Co Founder of Burma Capital",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    duration: "1 Hr 11 mins",
    progressPct: 6,
    href: "#",
  },
  {
    title: "Ko Jeremy Kyaw – Co Founder of Burma Capital",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    duration: "1 Hr 11 mins",
    progressPct: 6,
    href: "#",
  },
];

const TOTAL_EPISODES = 10;

function PlayBadge({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      aria-label="Play"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-coral text-black shadow-lg transition-transform hover:scale-105 sm:h-12 sm:w-12">
        <span className="ml-0.5 text-2xl leading-none">▶</span>
      </span>
    </Link>
  );
}

function PodcastRow({ item }: { item: PodcastItem }) {
  return (
    <article className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
      <div className="group relative aspect-[360/190] w-full max-w-[360px] shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-[0_14px_44px_rgba(0,0,0,0.45)] sm:w-[360px]">
        <Image
          src={podcastThumb}
          alt=""
          fill
          className="rounded-2xl object-cover object-center opacity-90 transition-transform duration-500 ease-out [transform-origin:center] scale-[1.18] group-hover:scale-[1.26] group-hover:opacity-100 motion-reduce:scale-[1.18] motion-reduce:transition-none motion-reduce:group-hover:scale-[1.18]"
          sizes="(max-width: 640px) 100vw, 360px"
        />
        <PlayBadge href={item.href ?? "#"} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col pt-0 sm:pt-2">
        <h3 className="text-xl font-semibold tracking-tight text-white">
          {item.title}
        </h3>
        <p className="mt-2 max-w-[62ch] text-base leading-relaxed text-white/85">
          {item.description}
        </p>

        {/* Audio player */}
        <div className="mt-4 flex w-full max-w-sm items-center gap-2.5 rounded-full bg-zinc-900 px-3 py-1.5 ring-1 ring-white/10 sm:mt-5">
          <button
            type="button"
            aria-label="Play"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
          >
            <span className="ml-0.5 text-sm leading-none">▶</span>
          </button>
          <div
            className="relative h-0.75 flex-1 overflow-hidden rounded-full bg-white/20"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={item.progressPct}
          >
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${item.progressPct}%` }}
            />
          </div>
          <span className="shrink-0 text-[11px] font-medium text-white/85">
            {item.duration}
          </span>
        </div>
      </div>
    </article>
  );
}

export function UserPortalPodcastSection() {
  return (
    <section className="mt-12 sm:mt-14 md:mt-16">
      <h2 className="text-left text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Listen to Story of Burma Podcast with No Ads
      </h2>

      <div className="mt-6 space-y-10 sm:mt-8 sm:space-y-12">
        {PODCASTS.map((item, idx) => (
          <PodcastRow key={`${item.title}-${idx}`} item={item} />
        ))}
      </div>

      <div className="mt-8 sm:mt-10">
        <a
          href="#"
          className="text-base font-bold text-white transition-colors hover:text-coral"
        >
          See All ({TOTAL_EPISODES})
        </a>
      </div>
    </section>
  );
}
