"use client";

import Image from "next/image";
import clientAvatar from "@/app/assets/client.png";

const TESTIMONIALS = [
  {
    name: "Ko Leon Oo,",
    role: "Yangon University’s Student",
    quote:
      "Playbook of Burma changed how I think about business. Listening to real founders talk through their mistakes taught me more than any textbook did.",
    avatarUrl: clientAvatar,
  },
  {
    name: "Ma Thandar Win,",
    role: "Startup Founder",
    quote:
      "Every episode feels like sitting down with a mentor. I picked up frameworks I use in my own company every single week.",
    avatarUrl: clientAvatar,
  },
  {
    name: "Ko Zayar Htet,",
    role: "Marketing Manager",
    quote:
      "The interviews are honest and practical, not the usual polished corporate talk. It's rare to find Myanmar business content this real.",
    avatarUrl: clientAvatar,
  },
  {
    name: "Ma Su Myat,",
    role: "MBA Student",
    quote:
      "I recommend Playbook of Burma to every classmate. The stories from local CEOs connect directly to what we study, but with real context.",
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
      <div className="absolute left-[36%] top-[-20%] z-20 h-[100px] w-[100px] overflow-hidden rounded-[100%] border border-white/15 bg-black shadow-[0_12px_28px_rgba(0,0,0,0.55)]">
        <Image
          src={t.avatarUrl}
          alt=""
          width={100}
          height={100}
          className="h-full w-full rounded-[100%] object-cover shadow-[0_16px_32px_rgba(0,0,0,0.65)]"
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
    <section className="bg-black py-5 md:py-7 lg:py-6 xl:py-9">
      <div className="mx-auto w-full max-w-[80%] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-left text-lg font-semibold tracking-tight text-white sm:text-xl">
            Feedback of the Audiences
          </h2>
        </div>

        <div className="relative z-0 mt-8 overflow-x-clip overflow-y-visible pb-2 pt-20 md:mt-10 md:pt-24">
          <div className="group relative z-0 flex w-max gap-6 [animation:hero-marquee-left_45s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:[animation-play-state:paused]">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <TestimonialCard
                key={`${t.name}-${i}`}
                t={t}
                isFirst={i === 0}
              />
            ))}
          </div>

          {/* Soft edge feather — light vignette so the rail doesn’t feel boxed in */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.22)_42%,rgba(0,0,0,0.06)_78%,transparent_100%)] sm:w-14 md:w-16"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-[linear-gradient(to_left,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.22)_42%,rgba(0,0,0,0.06)_78%,transparent_100%)] sm:w-14 md:w-16"
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}

