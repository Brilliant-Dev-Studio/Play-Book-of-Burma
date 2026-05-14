"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type PodcastItem = {
  title: string;
  description: string;
  image: string;
  href?: string;
};

const PODCASTS: PodcastItem[] = [
  {
    title: "Title",
    description:
      "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    image:
      "https://i.pinimg.com/736x/77/44/21/77442191acfd4d72e0da454c6dc5eb4d.jpg",
    href: "#",
  },
  {
    title: "Title",
    description:
      "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    image:
      "https://i.pinimg.com/736x/fd/8f/e7/fd8fe7ee4918c5055ee7939d889432df.jpg",
    href: "#",
  },
  {
    title: "Title",
    description:
      "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    image:
      "https://i.pinimg.com/736x/77/44/21/77442191acfd4d72e0da454c6dc5eb4d.jpg",
    href: "#",
  },
  {
    title: "Title",
    description:
      "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    image:
      "https://i.pinimg.com/736x/fd/8f/e7/fd8fe7ee4918c5055ee7939d889432df.jpg",
    href: "#",
  },
];

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
      <div className="group relative block w-full max-w-[360px] overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-[0_14px_44px_rgba(0,0,0,0.45)] sm:w-[360px]">
        <Image
          src={item.image}
          alt=""
          width={360}
          height={190}
          className="h-[190px] w-full rounded-2xl object-cover opacity-90 transition-transform duration-500 ease-out group-hover:scale-[1.06] group-hover:opacity-100 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          priority={false}
        />
        <PlayBadge href={item.href ?? "#"} />
      </div>

      <div className="min-w-0 pt-0 sm:pt-2">
        <h3 className="text-xl font-semibold tracking-tight text-white">
          {item.title}
        </h3>
        <p className="mt-2 max-w-[62ch] text-base leading-relaxed text-white/85">
          {item.description}
        </p>
        <a
          href={item.href ?? "#"}
          className="mt-3 inline-flex items-center gap-1 text-lg font-semibold text-coral underline decoration-coral/70 underline-offset-4 hover:decoration-coral"
        >
          Watch Now
          <span aria-hidden>→</span>
        </a>
      </div>
    </article>
  );
}

export function HomePodcastSection({
  variant = "default",
}: {
  /** Tighter vertical padding when stacked under another section (e.g. Library). */
  variant?: "default" | "embedded";
} = {}) {
  const [activeTab, setActiveTab] = useState<
    "Popular" | "Season 2" | "Season 1"
  >("Popular");

  const sectionPad =
    variant === "embedded"
      ? "bg-black pt-8 pb-14 sm:pt-10 sm:pb-16 md:pt-12 md:pb-20 lg:pb-24"
      : "bg-black py-16 md:py-20 lg:py-24 xl:py-28";

  return (
    <section className={sectionPad}>
      <div className="mx-auto w-full max-w-[95%] px-4 sm:px-6 lg:px-8">
        <h2 className="text-left text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Listen to Story of Burma Podcast with No Ads
        </h2>

        <div
          className={
            variant === "embedded"
              ? "mt-5 flex flex-wrap items-center gap-0 text-sm sm:mt-6 sm:text-[15px]"
              : "mt-8 flex flex-wrap items-center gap-0 text-sm sm:mt-10 sm:text-[15px]"
          }
        >
          <button
            type="button"
            onClick={() => setActiveTab("Popular")}
            className={`font-semibold transition-colors ${
              activeTab === "Popular"
                ? "text-white"
                : "font-medium text-mist hover:text-white/85"
            }`}
          >
            Popular
          </button>
          <span
            className="mx-3 h-4 w-px shrink-0 bg-white/25 sm:mx-4"
            aria-hidden
          />
          <button
            type="button"
            onClick={() => setActiveTab("Season 2")}
            className={`transition-colors ${
              activeTab === "Season 2"
                ? "font-semibold text-white"
                : "font-medium text-mist hover:text-white/85"
            }`}
          >
            Season 2
          </button>
          <span
            className="mx-3 h-4 w-px shrink-0 bg-white/25 sm:mx-4"
            aria-hidden
          />
          <button
            type="button"
            onClick={() => setActiveTab("Season 1")}
            className={`transition-colors ${
              activeTab === "Season 1"
                ? "font-semibold text-white"
                : "font-medium text-mist hover:text-white/85"
            }`}
          >
            Season 1
          </button>
        </div>

        <div
          className={
            variant === "embedded"
              ? "mt-6 space-y-12 sm:mt-8 sm:space-y-14"
              : "mt-10 space-y-14"
          }
        >
          {PODCASTS.map((item, idx) => (
            <PodcastRow key={`${item.title}-${idx}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

