"use client";

import Image from "next/image";
import clientAvatar from "@/app/assets/client.png";

const TESTIMONIALS = [
  {
    name: "Ko Leon Oo,",
    role: "Yangon University’s Student",
    quote:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley.",
    avatarUrl: clientAvatar,
  },
  {
    name: "Ko Leon Oo,",
    role: "Yangon University’s Student",
    quote:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley.",
    avatarUrl: clientAvatar,
  },
  {
    name: "Ko Leon Oo,",
    role: "Yangon University’s Student",
    quote:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley.",
    avatarUrl: clientAvatar,
  },
  {
    name: "Ko Leon Oo,",
    role: "Yangon University’s Student",
    quote:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley.",
    avatarUrl: clientAvatar,
  },
] as const;

function TestimonialCard({
  t,
  isFirst,
}: {
  t: (typeof TESTIMONIALS)[number];
  isFirst?: boolean;
}) {
  return (
    <article
      data-card={isFirst ? true : undefined}
      className="relative w-[280px] shrink-0 snap-start overflow-visible rounded-2xl bg-[#232428] px-6 pb-7 pt-14 text-center text-white shadow-[0_14px_44px_rgba(0,0,0,0.45)] sm:w-[320px] md:w-[340px]"
    >
      <div className="absolute left-[36%] top-[-20%] z-20   rounded-none border border-white/15 bg-black shadow-[0_12px_28px_rgba(0,0,0,0.55)] ">
        <Image
          src={t.avatarUrl}
          alt=""
          width={100}
          height={100}
          className="object-cover shadow-[0_16px_32px_rgba(0,0,0,0.65)]"
        />
      </div>

      <p className="text-sm leading-relaxed mt-2 text-white/85 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:5] overflow-hidden">
        {t.quote}
      </p>

      <div className="mt-5 text-sm font-semibold text-white/95">{t.name}</div>
      <div className="mt-1 text-sm text-white/75">{t.role}</div>
    </article>
  );
}

export function HomeTestimonialsSection() {
  return (
    <section className="bg-black py-16 md:py-20 lg:py-24 xl:py-28">
      <div className="mx-auto w-full max-w-[95%] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-left text-lg font-semibold tracking-tight text-white sm:text-xl">
            Feedback of the Audiences
          </h2>
        </div>

        <div className="relative mt-8 overflow-hidden pb-2 pt-10 md:mt-10 md:pt-12">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-[linear-gradient(to_right,rgba(0,0,0,1),rgba(0,0,0,0))] sm:w-16"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-[linear-gradient(to_left,rgba(0,0,0,1),rgba(0,0,0,0))] sm:w-16"
            aria-hidden
          />

          <div className="group flex w-max gap-6 [animation:hero-marquee-left_45s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:[animation-play-state:paused]">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <TestimonialCard
                key={`${t.name}-${i}`}
                t={t}
                isFirst={i === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

