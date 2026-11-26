import { HeroEasyNav, type HeroIndustry } from "@/app/components/hero-easy-nav";
import { HeroPortraitRail } from "@/app/components/hero-portrait-rail";
import { timesNewRomanMtCondensed } from "@/app/fonts";

export function HeroMarqueeBackdrop({ industries = [] }: { industries?: HeroIndustry[] }) {
  return (
    <section className="relative isolate w-full flex-1 overflow-hidden bg-black md:min-h-[640px] lg:min-h-[78svh]">
      {/* Desktop: full right side of the viewport — not clipped by content max-width */}
      <div
        className="pointer-events-none absolute inset-y-0 left-[42%] right-0 z-[1] hidden items-center md:flex"
        aria-hidden
      >
        <HeroPortraitRail />
      </div>

      {/* Phone/tablet: the same portraits as a dimmed backdrop behind the copy (instead of a
          separate block below it), so they're visible on the first screen and the hero stays short. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-full md:hidden" aria-hidden>
        <div className="absolute inset-x-0 top-4 flex">
          <HeroPortraitRail />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.35)_28%,rgba(0,0,0,0.8)_58%,#000_78%)]" />
      </div>

      <div className="relative z-30 mx-auto flex w-full max-w-site flex-col justify-start px-4 pb-6 pt-6 sm:px-6 sm:pb-12 sm:pt-12 md:min-h-[640px] md:justify-center md:py-16 lg:min-h-[78svh] lg:px-8 lg:py-20">
        <div className="w-full text-left text-white md:w-[48%] lg:w-[44%]">
          <h1
            className={`${timesNewRomanMtCondensed.className} text-[clamp(1.35rem,6.4vw,2.6rem)] font-normal italic leading-[1.12] tracking-[-0.005em] [text-shadow:0_2px_18px_rgba(0,0,0,0.85)] md:text-[clamp(1.9rem,3.2vw,3.1rem)] md:leading-[1.12]`}
          >
            {/* Times New Roman MT Condensed Italic, title case. Lines may wrap on phones;
                desktop keeps the two fixed lines. */}
            <span className="block md:whitespace-nowrap">Life-Changing Playbooks behind</span>
            <span className="block md:whitespace-nowrap">Founders &amp; CEO in Myanmar</span>
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.8)] sm:mt-5 sm:text-base">
            We will take you to learn the life-changing playbooks of
            Myanmar&apos;s visionary founders, CEOs, experts, how they define
            their journey, critical decision making, strategy which transformed
            their life and business.
          </p>

          <div className="mt-6 flex items-center gap-3 sm:mt-8">
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

          <HeroEasyNav industries={industries} />
        </div>
      </div>
    </section>
  );
}
