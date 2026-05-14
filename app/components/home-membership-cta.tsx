"use client";

import Link from "next/link";

export function HomeMembershipCta({
  variant = "default",
}: {
  /** `embedded` = own section + max-width shell for Library (below podcast). */
  variant?: "default" | "embedded";
} = {}) {
  const inner = (
    <div className="flex flex-col items-center text-center">
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
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-coral px-7 py-3 text-sm font-bold tracking-wide text-white shadow-[0_8px_28px_rgba(236,113,71,0.35)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(236,113,71,0.42)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral motion-reduce:hover:translate-y-0"
      >
        Get Playbook Now
      </Link>
    </div>
  );

  if (variant === "embedded") {
    return (
      <section className="bg-black pb-14 pt-10 sm:pb-16 sm:pt-12 md:pb-20 md:pt-14">
        <div className="mx-auto w-full max-w-[95%] px-4 sm:px-6 lg:px-8">
          {inner}
        </div>
      </section>
    );
  }

  return <div className="mt-12">{inner}</div>;
}
