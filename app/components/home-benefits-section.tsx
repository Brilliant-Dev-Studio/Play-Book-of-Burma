"use client";

import Image from "next/image";
import Link from "next/link";

const BENEFITS = [
  {
    title: "Deliver experiential insights",
    body:
      "through 5–10 years of building, tested in both success and failure that shape life and business decisions",
    imageUrl: "https://i.pinimg.com/736x/60/f1/59/60f159cfbcedcdf2fa54ece838fb0724.jpg",
  },
  {
    title: "Learn today, execute tomorrow.",
    body:
      "Learning material is designed to easier to understand through step-by-step guidelines, checklists, and action items",
    imageUrl: "https://i.pinimg.com/736x/18/1e/71/181e71ab5d84db0b7f10565ab7d0b329.jpg",
  },
  {
    title: "Learn anytime, anywhere.",
    body:
      "Even someone living outside of Yangon City can have the chance to learn closely from CEOs and industry experts",
    imageUrl: "https://i.pinimg.com/736x/fe/06/19/fe06191450ab4f05b69090a67224152c.jpg",
  },
] as const;

export function HomeBenefitsSection() {
  return (
    <section className="bg-black py-16 md:py-20 lg:py-24 xl:py-28">
      <div className="mx-auto w-full max-w-[95%] px-4 sm:px-6 lg:px-8">
        <h2 className="text-left text-lg font-semibold tracking-tight text-white sm:text-xl">
          Benefits
        </h2>

        <div className="mt-7 grid gap-8 md:grid-cols-3 md:gap-10">
          {BENEFITS.map((b) => (
            <div key={b.title} className="min-w-0">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 bg-black">
                <Image
                  src={b.imageUrl}
                  alt=""
                  fill
                  className="object-cover opacity-90"
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
              <p className="mt-2 text-sm leading-relaxed text-white/85">
                {b.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center text-center">
          <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Become Our Membership Today
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            Choose 6–12 months plan, only costs 1,000 MMK per day,
            <br />
            Learn 24/7 at anytime, anywhere
          </p>
          <Link
            href="/membership"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-coral px-6 py-2.5 text-sm font-semibold tracking-tight text-white transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
          >
            Get Playbook Now
          </Link>
        </div>

        
      </div>
    </section>
  );
}

