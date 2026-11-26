"use client";

import Image, { type StaticImageData } from "next/image";
import { HomeMembershipCta } from "@/app/components/home-membership-cta";
import benefit1 from "@/app/assets/benefits/benefit-1.jpg";
import benefit2 from "@/app/assets/benefits/benefit-2.jpg";
import benefit3 from "@/app/assets/benefits/benefit-3.jpg";

const BENEFITS: readonly {
  title: string;
  body: string;
  image: StaticImageData;
}[] = [
  {
    title: "Learn Directly from Leading CEOs and Experts",
    body:
      "Life lesson, success, and failure behind the business they built. Insights that changed their life and business in Myanmar.",
    image: benefit1,
  },
  {
    title: "Learn Today, Execute Tomorrow",
    body:
      "Learning material is designed easier to understand through step-by-step guidelines, checklists, and action items.",
    image: benefit2,
  },
  {
    title: "Learn Anytime, Anywhere.",
    body:
      "Even if you live far from Yangon, you can learn closely from CEOs and founders 24/7, anytime, anywhere with no limitation.",
    image: benefit3,
  },
];

export function HomeBenefitsSection() {
  return (
    <section className="bg-black py-5 md:py-7 lg:py-6 xl:py-9">
      <div className="mx-auto w-full max-w-site px-4 sm:px-6 lg:px-8">
        <h2 className="text-left text-lg font-semibold tracking-tight text-white sm:text-xl">
          Benefits
        </h2>

        <div className="mt-7 grid gap-8 md:grid-cols-3 md:gap-10">
          {BENEFITS.map((b) => (
            <div key={b.title} className="mx-auto w-full min-w-0 md:w-[88%]">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/12 bg-black">
                <Image
                  src={b.image}
                  alt=""
                  fill
                  className="rounded-2xl object-cover object-center opacity-95"
                  sizes="(max-width: 768px) 95vw, 33vw"
                  placeholder="blur"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.65)_100%)]"
                  aria-hidden
                />
              </div>

              <h3 className="mt-5 text-base font-semibold leading-snug tracking-tight text-coral">
                {b.title}
              </h3>
              <p className="mt-2 text-[15px] font-medium leading-relaxed text-white/90 sm:text-base">
                {b.body}
              </p>
            </div>
          ))}
        </div>

        <HomeMembershipCta />
      </div>
    </section>
  );
}

