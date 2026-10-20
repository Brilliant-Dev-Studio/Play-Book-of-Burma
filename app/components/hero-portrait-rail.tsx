import Image from "next/image";

/** Pre-cropped so shoulders share one horizontal band (~40% from top). */
export const HERO_PORTRAITS = [
  "/HeroSection/aligned/1.jpg",
  "/HeroSection/aligned/2.jpg",
  "/HeroSection/aligned/3.jpg",
  "/HeroSection/aligned/4.jpg",
  "/HeroSection/aligned/5.jpg",
  "/HeroSection/aligned/6.jpg",
  "/HeroSection/aligned/7.jpg",
  "/HeroSection/aligned/8.jpg",
] as const;

function PortraitCard({ src, priority }: { src: string; priority?: boolean }) {
  return (
    <div
      data-portrait-card
      className="relative h-[min(62vh,520px)] w-[140px] shrink-0 overflow-hidden rounded-[30px] shadow-[0_16px_48px_rgba(0,0,0,0.55)] sm:h-[min(68vh,560px)] sm:w-[170px] md:h-[min(72vh,600px)] md:w-[200px] lg:w-[220px] xl:w-[240px]"
    >
      <Image
        src={src}
        alt=""
        fill
        className="object-cover object-top"
        sizes="(max-width: 768px) 140px, 240px"
        draggable={false}
        priority={priority}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-black/40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.25)_12%,rgba(0,0,0,0.15)_35%,rgba(0,0,0,0.2)_55%,rgba(0,0,0,0.45)_82%,rgba(0,0,0,0.85)_100%)]"
        aria-hidden
      />
    </div>
  );
}

export function HeroPortraitRail() {
  const loop = [...HERO_PORTRAITS, ...HERO_PORTRAITS];

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Even, gentle continuous drift — linear keeps speed constant through the loop */}
      <div className="flex h-full w-max items-center gap-[3px] will-change-transform animate-[hero-marquee-left_140s_linear_infinite] motion-reduce:animate-none">
        {loop.map((src, i) => (
          <PortraitCard key={`${src}-${i}`} src={src} priority={i < 3} />
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent sm:w-24"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-black via-black/50 to-transparent sm:w-20"
        aria-hidden
      />
    </div>
  );
}
