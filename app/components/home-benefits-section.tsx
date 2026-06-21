"use client";

import Image, { type StaticImageData } from "next/image";
import { HomeMembershipCta } from "@/app/components/home-membership-cta";
import mockup1 from "@/app/assets/benefits/Mockup - 1.png";
import mockup2 from "@/app/assets/benefits/Mockup - 2.png";
import mockup3 from "@/app/assets/benefits/Mockup - 3.png";

const BENEFITS: readonly {
  title: string;
  body: string;
  image: StaticImageData;
}[] = [
  {
    title: "Deliver experiential insights",
    body:
      "through 5–10 years of building, tested in both success and failure that shape life and business decisions",
    image: mockup1,
  },
  {
    title: "Learn today, execute tomorrow.",
    body:
      "Learning material is designed to easier to understand through step-by-step guidelines, checklists, and action items",
    image: mockup2,
  },
  {
    title: "Learn anytime, anywhere.",
    body:
      "Even someone living outside of Yangon City can have the chance to learn closely from CEOs and industry experts",
    image: mockup3,
  },
];

export function HomeBenefitsSection() {
  return (
    <section className="bg-black py-5 md:py-7 lg:py-6 xl:py-9">
      <div className="mx-auto w-full max-w-[80%] px-4 sm:px-6 lg:px-8">
        <h2 className="text-left text-lg font-semibold tracking-tight text-white sm:text-xl">
          Benefits
        </h2>

        <div className="mt-7 grid gap-8 md:grid-cols-3 md:gap-10">
          {BENEFITS.map((b) => (
            <div key={b.title} className="mx-auto w-full min-w-0 md:w-[88%]">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border-2 border-white/30 bg-black">
                <Image
                  src={b.image}
                  alt=""
                  fill
                  className="rounded-2xl object-contain object-center opacity-95"
                  sizes="(max-width: 768px) 95vw, 33vw"
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

