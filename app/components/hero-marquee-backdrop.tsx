import { HeroEasyNav } from "@/app/components/hero-easy-nav";
import { HeroPortraitRail } from "@/app/components/hero-portrait-rail";
import { timesNewRomanMtCondensed } from "@/app/fonts";

export function HeroMarqueeBackdrop() {
  return (
    <section className="relative isolate min-h-[78svh] w-full flex-1 overflow-hidden bg-black">
      {/* Full right side of the viewport — not clipped by content max-width */}
      <div
        className="pointer-events-none absolute inset-y-0 left-[42%] right-0 z-[1] hidden items-center md:flex"
        aria-hidden
      >
        <HeroPortraitRail />
      </div>

      <div className="relative z-30 mx-auto flex min-h-[78svh] w-full max-w-site flex-col justify-center px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="w-full text-left text-white md:w-[48%] lg:w-[44%]">
          <h1
            className={`${timesNewRomanMtCondensed.className} text-[clamp(1.6rem,2.9vw,2.85rem)] font-bold leading-[1.1] tracking-[0.01em] uppercase [text-shadow:0_2px_18px_rgba(0,0,0,0.85)]`}
          >
            <span className="block whitespace-nowrap">
              Get Playbook of Top 1%
            </span>
            <span className="block whitespace-nowrap">in Myanmar</span>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.8)] sm:text-base">
            We will take you to learn the life-changing playbooks of
            Myanmar&apos;s visionary founders, CEOs, Experts, how they define
            their journey, critical decision making, strategy which transformed
            their life and business.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <span
              className="h-[5px] w-10 shrink-0 rounded-full bg-coral sm:h-1.5 sm:w-12"
              aria-hidden
            />
            <h2
              className={`${timesNewRomanMtCondensed.className} text-base font-bold uppercase tracking-[0.01em] text-white sm:text-lg`}
            >
              Choose What You Learn
            </h2>
          </div>

          <HeroEasyNav />
        </div>

        {/* Mobile: below content */}
        <div className="relative z-0 mt-10 w-full md:hidden">
          <HeroPortraitRail />
        </div>
      </div>
    </section>
  );
}
