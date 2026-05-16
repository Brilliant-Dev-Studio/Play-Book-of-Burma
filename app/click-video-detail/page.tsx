import Image, { type StaticImageData } from "next/image";
import detailBackdrop from "@/app/assets/benefits/Man.png";
import skillsetThumb from "@/app/assets/benefits/Ray Dalio - 1.png";
import { HomeMembershipCta } from "@/app/components/home-membership-cta";

const DESCRIPTION =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.";

const SKILLSET_DESCRIPTION =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,";

const LESSON_DETAIL =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry.";

const DOWNLOAD_DESCRIPTION =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s";

const LESSONS = [
  { title: "Introduction of Modern Finance", duration: "10 mins", details: LESSON_DETAIL },
  { title: "Lorem Ipsum is simply dummy text of the printing", duration: "10 mins", details: LESSON_DETAIL },
  { title: "Lorem Ipsum is simply dummy text of the printing", duration: "10 mins", details: LESSON_DETAIL },
  { title: "Lorem Ipsum is simply dummy text of the printing", duration: "10 mins", details: LESSON_DETAIL },
  { title: "Lorem Ipsum is simply dummy text of the printing", duration: "10 mins", details: LESSON_DETAIL },
];

type SkillsetItem = {
  number: number;
  image: StaticImageData;
  title: string;
  description: string;
};

const SKILLSETS: SkillsetItem[] = [
  { number: 1, image: skillsetThumb, title: "Title of Skillsets", description: SKILLSET_DESCRIPTION },
  { number: 2, image: skillsetThumb, title: "Title of Skillsets", description: SKILLSET_DESCRIPTION },
  { number: 3, image: skillsetThumb, title: "Title of Skillsets", description: SKILLSET_DESCRIPTION },
];

function SkillsetCard({ number, image, title, description }: SkillsetItem) {
  return (
    <article className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-zinc-900 shadow-[0_16px_48px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
      <Image
        src={image}
        alt=""
        fill
        className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 28vw"
      />

      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.82)_28%,rgba(0,0,0,0.45)_50%,rgba(0,0,0,0.15)_68%,transparent_82%)]"
        aria-hidden
      />

      <span className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-coral text-base font-bold text-white shadow-[0_4px_14px_rgba(236,113,71,0.5)] sm:left-4 sm:top-4 sm:h-10 sm:w-10 sm:text-lg">
        {number}
      </span>

      <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-5 sm:px-6 sm:pb-6">
        <h3 className="text-lg font-bold leading-snug tracking-tight text-white sm:text-xl">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-[0.95rem]">
          <span className="font-medium text-white">Description: </span>
          {description}
        </p>
      </div>
    </article>
  );
}

/**
 * Top: hero — left rail + right image.
 * Below: trailer block (16:9, rounded, “Watch Trailer” + play).
 */
export default function ClickVideoDetailPage() {
  return (
    <main className="flex min-h-0 w-full flex-1 flex-col bg-black">
      <div className="relative isolate min-h-[min(68dvh,620px)] w-full shrink-0 overflow-hidden pb-6 sm:pb-8 md:pb-10">
        {/* Full-bleed image: full viewport on small screens; from ~30vw → right on md+ */}
        <div className="absolute inset-0 z-0 md:left-[30vw]">
          <Image
            src={detailBackdrop}
            alt=""
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 70vw"
            priority
            draggable={false}
          />
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.4)_14%,rgba(0,0,0,0.14)_30%,transparent_56%)] max-md:bg-[linear-gradient(90deg,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.35)_45%,rgba(0,0,0,0.2)_70%,transparent_100%)]"
            aria-hidden
          />
        </div>

        {/* Foreground: home-style rail */}
        <div className="relative z-[3] mx-auto flex min-h-[min(68dvh,620px)] w-full max-w-[85%] flex-1 flex-col px-4 pt-12 pb-16 sm:px-6 sm:pt-14 sm:pb-20 lg:px-8 md:flex-row">
          <div className="flex w-full flex-1 flex-col items-start justify-center md:w-[30vw] md:max-w-[30vw] md:shrink-0">
            <div className="w-full max-w-3xl text-left text-white max-md:rounded-lg max-md:bg-black/35 max-md:px-4 max-md:py-6 sm:max-md:px-5">
              <h1 className="text-2xl font-semibold leading-tight tracking-tight text-balance sm:text-3xl md:text-[1.95rem] md:leading-[1.14] lg:text-4xl">
                <span className="block">Learn Finance in 21 Day,</span>
                <span className="block">Become Master at it</span>
              </h1>

              <span
                className="mt-5 block h-1 w-20 shrink-0 bg-coral sm:mt-6"
                aria-hidden
              />

              <p className="mt-5 text-base font-semibold leading-snug tracking-tight text-white sm:text-lg">
                Ko Jason Myint, CEO of BYD By Essentials
              </p>

              <p className="mt-5 text-left text-sm leading-relaxed text-white/90 sm:mt-6 sm:text-base">
                <span className="font-medium text-white">Description: </span>
                {DESCRIPTION}
              </p>
            </div>
          </div>
          <div className="hidden min-h-[min(68dvh,620px)] md:block md:min-w-0 md:flex-1" aria-hidden />
        </div>

        {/* Seam fade at ~30vw (md+, where image starts) */}
        <div
          className="pointer-events-none absolute inset-y-0 left-[30vw] z-[2] hidden w-16 -translate-x-1/2 bg-[linear-gradient(90deg,#000_0%,rgba(0,0,0,0.5)_40%,transparent_100%)] sm:w-24 md:block"
          aria-hidden
        />
      </div>

      {/* Trailer — directly under hero */}
      <section className="w-full shrink-0 bg-black py-16 md:py-20 lg:py-24 xl:py-28">
       <div className="mx-auto w-full max-w-[85%] px-4 sm:px-6 lg:px-8">
          <div className="group relative aspect-video w-full overflow-hidden rounded-2xl shadow-[0_20px_56px_rgba(0,0,0,0.55)] ring-1 ring-white/10 md:rounded-3xl">
            <Image
              src={detailBackdrop}
              alt=""
              fill
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              sizes="(max-width: 768px) 95vw, 85vw"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.55)_0%,transparent_38%,transparent_65%,rgba(0,0,0,0.35)_100%)]"
              aria-hidden
            />
            <p className="absolute left-4 top-4 z-10 text-lg font-bold tracking-tight text-white sm:left-6 sm:top-5 sm:text-xl">
              Watch Trailer
            </p>
            <button
              type="button"
              className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              aria-label="Play trailer"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-coral text-black shadow-lg transition-transform hover:scale-105 sm:h-[4.5rem] sm:w-[4.5rem] md:h-20 md:w-20">
                <span className="ml-1 text-2xl leading-none sm:text-3xl" aria-hidden>
                  ▶
                </span>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Skillset You will Learn */}
      <section className="w-full shrink-0 bg-black pb-16 md:pb-20 lg:pb-24 xl:pb-28">
        <div className="mx-auto w-full max-w-[85%] px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-white sm:text-3xl md:mb-10 md:text-4xl">
            Skillset You will Learn
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-7 lg:grid-cols-3 lg:gap-8">
            {SKILLSETS.map((s) => (
              <SkillsetCard key={s.number} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* Lessons Plan */}
      <section className="w-full shrink-0 bg-black pb-16 md:pb-20 lg:pb-24 xl:pb-28">
        <div className="mx-auto w-full max-w-[85%] px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-white sm:text-3xl md:mb-10 md:text-4xl">
            Lessons Plan
          </h2>

          <div className="flex flex-col gap-3">
            {LESSONS.map((lesson, index) => (
              <details
                key={index}
                className="group border border-white/10 bg-zinc-900/90"
              >
                <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.04] sm:px-6 sm:py-5 [&::-webkit-details-marker]:hidden">
                  <span className="w-6 shrink-0 text-base font-medium tabular-nums text-white sm:text-lg">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-white sm:text-base">
                    {lesson.title}
                  </span>
                  <span className="shrink-0 text-sm text-white/80 sm:text-base">
                    {lesson.duration}
                  </span>
                  <span
                    className="shrink-0 text-xs text-white/50 transition-transform duration-200 ease-out group-open:rotate-180"
                    aria-hidden
                  >
                    ▼
                  </span>
                </summary>
                <div className="border-t border-white/[0.06] bg-black/25 px-5 py-4 pl-[3.25rem] text-sm leading-relaxed text-white/80 sm:px-6 sm:pl-14 sm:text-[15px]">
                  {lesson.details}
                </div>
              </details>
            ))}
          </div>

          {/* Download Learning Resources */}
          <div className="mt-6 flex flex-col gap-5 border border-white/10 bg-zinc-900/90 p-5 sm:mt-8 sm:flex-row sm:gap-7 sm:p-7 md:mt-10">
            <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-lg bg-zinc-800 sm:w-40 md:w-48">
              <Image
                src={skillsetThumb}
                alt=""
                fill
                className="object-cover object-center"
                sizes="(max-width: 640px) 90vw, (max-width: 768px) 160px, 192px"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <h3 className="text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl">
                Download Learning Resources
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/85 sm:text-[0.95rem]">
                <span className="font-medium text-white">Description: </span>
                {DOWNLOAD_DESCRIPTION}
              </p>
              <button
                type="button"
                className="mt-5 flex w-fit items-center gap-2 rounded-md border border-white/20 bg-transparent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral sm:mt-6 sm:px-6 sm:py-3 sm:text-base"
                aria-label="Download Guidebook"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
                Guidebook
              </button>
            </div>
          </div>
        </div>
      </section>

      <HomeMembershipCta variant="embedded" />
    </main>
  );
}
