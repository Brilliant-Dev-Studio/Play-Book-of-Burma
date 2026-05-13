import Image from "next/image";
import { unstable_noStore as noStore } from "next/cache";
import { HeroEasyNav } from "@/app/components/hero-easy-nav";

/** Pinterest (pinimg) — marquee tiles pick one URL at random when rendered. */
export const HERO_MARQUEE_IMAGES = [
  "https://i.pinimg.com/736x/a5/45/57/a5455734ddffef0ce71183fc807fac14.jpg",
  "https://i.pinimg.com/736x/06/39/eb/0639eb70eb4a2571f1cb56b1e15c9c07.jpg",
  "https://i.pinimg.com/736x/02/9f/6b/029f6b2693be385f65dcbb045b325ba2.jpg",
  "https://i.pinimg.com/736x/60/f1/59/60f159cfbcedcdf2fa54ece838fb0724.jpg",
  "https://i.pinimg.com/736x/be/4b/89/be4b89add5ab7c60fa60811887119954.jpg",
  "https://i.pinimg.com/736x/01/b3/48/01b3484bdd53feedc26159ba39c0584c.jpg",
  "https://i.pinimg.com/736x/18/1e/71/181e71ab5d84db0b7f10565ab7d0b329.jpg",
  "https://i.pinimg.com/736x/fe/06/19/fe06191450ab4f05b69090a67224152c.jpg",
  "https://i.pinimg.com/736x/64/ef/3a/64ef3a877b93c32f52bf2ceab5a6baaa.jpg",
  "https://i.pinimg.com/736x/4c/a0/ef/4ca0ef7b93ece30dddbbe947e587b664.jpg",
] as const;

function randomHeroImageUrl(): (typeof HERO_MARQUEE_IMAGES)[number] {
  return HERO_MARQUEE_IMAGES[
    Math.floor(Math.random() * HERO_MARQUEE_IMAGES.length)
  ]!;
}

const SLIDE_COUNT = 10;

type SlideVariant = "wide" | "tall" | "medium";

/** Center row: same height as former `tall` row; widths cycle narrow → wide. */
const MIDDLE_ROW_WIDTH_PRESETS: { frame: string; imageSizes: string }[] = [
  {
    frame:
      "h-[min(36vh,320px)] w-[128px] sm:h-[min(40vh,400px)] sm:w-[156px] md:w-[176px]",
    imageSizes: "(max-width: 768px) 128px, 176px",
  },
  {
    frame:
      "h-[min(36vh,320px)] w-[168px] sm:h-[min(40vh,400px)] sm:w-[198px] md:w-[224px]",
    imageSizes: "(max-width: 768px) 168px, 224px",
  },
  {
    frame:
      "h-[min(36vh,320px)] w-[220px] sm:h-[min(40vh,400px)] sm:w-[252px] md:w-[280px]",
    imageSizes: "(max-width: 768px) 220px, 280px",
  },
  {
    frame:
      "h-[min(36vh,320px)] w-[188px] sm:h-[min(40vh,400px)] sm:w-[220px] md:w-[248px]",
    imageSizes: "(max-width: 768px) 188px, 248px",
  },
  {
    frame:
      "h-[min(36vh,320px)] w-[248px] sm:h-[min(40vh,400px)] sm:w-[288px] md:w-[320px]",
    imageSizes: "(max-width: 768px) 248px, 320px",
  },
];

const MIDDLE_ROW_SLIDE_FRAMES: { frame: string; imageSizes: string }[] =
  Array.from({ length: SLIDE_COUNT }, (_, i) => {
    const preset = MIDDLE_ROW_WIDTH_PRESETS[i % MIDDLE_ROW_WIDTH_PRESETS.length]!;
    return preset;
  });

const slideFrameClass: Record<
  SlideVariant,
  { frame: string; imageSizes: string }
> = {
  wide: {
    frame:
      "h-[min(20vh,180px)] w-[min(78vw,280px)] sm:h-[min(22vh,200px)] sm:w-[320px] md:h-[min(24vh,220px)] md:w-[380px]",
    imageSizes: "(max-width: 768px) 78vw, 380px",
  },
  tall: {
    frame:
      "h-[min(36vh,320px)] w-[180px] sm:h-[min(40vh,400px)] sm:w-[220px] md:w-[260px]",
    imageSizes: "(max-width: 768px) 180px, 260px",
  },
  medium: {
    frame:
      "h-[min(26vh,240px)] w-[220px] sm:h-[min(28vh,260px)] sm:w-[260px] md:w-[300px]",
    imageSizes: "(max-width: 768px) 220px, 300px",
  },
};

function MarqueeSlide({
  src,
  variant = "tall",
  slideFrame,
}: {
  src: string;
  variant?: SlideVariant;
  slideFrame?: { frame: string; imageSizes: string };
}) {
  const { frame, imageSizes } = slideFrame ?? slideFrameClass[variant];
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.55)] md:rounded-3xl ${frame}`}
    >
      <Image
        src={src}
        alt=""
        fill
        className="object-cover"
        sizes={imageSizes}
        draggable={false}
      />
    </div>
  );
}

/** Full class strings so Tailwind can see `animate-[...]` at build time. */
const MARQUEE_TRACK_BASE =
  "flex w-max will-change-transform motion-reduce:translate-x-0 motion-reduce:animate-none";

const MARQUEE_MOTION = {
  /** ~1.65× slower than original 88s / 102s / 118s */
  topRow: `${MARQUEE_TRACK_BASE} animate-[hero-marquee-left_145s_linear_infinite]`,
  bottomRow: `${MARQUEE_TRACK_BASE} animate-[hero-marquee-left_170s_linear_infinite]`,
  midRow: `${MARQUEE_TRACK_BASE} animate-[hero-marquee-right_195s_linear_infinite]`,
} as const;

function MarqueeRow({
  motionClass,
  variant = "tall",
  slideFrames,
}: {
  motionClass: string;
  variant?: SlideVariant;
  slideFrames?: readonly { frame: string; imageSizes: string }[];
}) {
  const slideUrls = Array.from({ length: SLIDE_COUNT }, () =>
    randomHeroImageUrl(),
  );

  const slides = slideUrls.map((src, i) => (
    <MarqueeSlide
      key={i}
      src={src}
      variant={variant}
      slideFrame={slideFrames?.[i]}
    />
  ));

  return (
    <div className="relative w-full overflow-hidden py-1">
      <div className={motionClass}>
        <div className="flex gap-3 sm:gap-4 md:gap-5">{slides}</div>
        <div className="flex gap-3 pl-3 sm:gap-4 sm:pl-4 md:gap-5 md:pl-5" aria-hidden>
          {slideUrls.map((src, i) => (
            <MarqueeSlide
              key={`dup-${i}`}
              src={src}
              variant={variant}
              slideFrame={slideFrames?.[i]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeroMarqueeBackdrop() {
  noStore();

  return (
    <section className="relative isolate min-h-[85vh] w-full flex-1 bg-black">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 flex flex-col justify-center gap-3 opacity-[0.97] sm:gap-5">
          <MarqueeRow variant="wide" motionClass={MARQUEE_MOTION.topRow} />
          <div className="relative w-full">
            <MarqueeRow
              variant="tall"
              slideFrames={MIDDLE_ROW_SLIDE_FRAMES}
              motionClass={MARQUEE_MOTION.midRow}
            />
            <div
              className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(0,0,0,0.38)_0%,rgba(0,0,0,0.28)_30%,rgba(0,0,0,0.14)_58%,rgba(0,0,0,0.1)_82%,rgba(0,0,0,0.08)_100%)]"
              aria-hidden
            />
          </div>
          <MarqueeRow variant="medium" motionClass={MARQUEE_MOTION.bottomRow} />
        </div>

        {/* Left 0–30%: full black; rest opens a bit brighter than before. */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#000_0%,#000_30%,rgba(0,0,0,0.72)_43%,rgba(0,0,0,0.42)_56%,rgba(0,0,0,0.22)_72%,rgba(0,0,0,0.12)_100%)]" />
        {/* Softer right-biased vignette (less crushing on edges). */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_95%_72%_at_64%_50%,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0.32)_62%,rgba(0,0,0,0.68)_100%)]" />
        {/* Lighter top/bottom letterbox. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.06)_38%,rgba(0,0,0,0.06)_62%,rgba(0,0,0,0.78)_100%)]" />
      </div>

      {/* Hero copy — same horizontal rail as SiteHeader (max-w + px), left column */}
      <div className="relative z-20 flex min-h-[85vh] w-full flex-1">
        <div className="mx-auto flex min-h-[85vh] w-full max-w-[95%] flex-1">
          <div className="flex w-full flex-col items-start justify-center px-4 py-16 sm:px-6 md:w-1/2 lg:px-8">
            <div className="w-full max-w-3xl text-left text-white">
              <h1 className="font-[family-name:var(--font-rwst-stack)] text-3xl leading-tight tracking-tight text-balance sm:text-4xl md:text-[2.35rem] md:leading-[1.12] lg:text-5xl">
                Get Playbook of Top 1 % in Myanmar
              </h1>
              <p className="mt-5 text-sm leading-relaxed text-white/90 sm:text-base">
                We will take you to learn the life-changing playbooks of
                Myanmar&apos;s visionary founders, CEOs, Experts, how they
                define their journey, critical decision making, strategy which
                transformed their life and business.
              </p>
              <div className="mt-10 w-full">
                <div className="flex items-center gap-3">
                  <span
                    className="h-px w-8 shrink-0 bg-coral"
                    aria-hidden
                  />
                  <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">
                    Choose What You Learn
                  </h2>
                </div>

                <HeroEasyNav />
              </div>
            </div>
          </div>
          <div className="hidden min-h-[85vh] md:block md:w-1/2" aria-hidden />
        </div>
      </div>
    </section>
  );
}
