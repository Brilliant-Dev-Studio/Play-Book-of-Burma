import Image from "next/image";
import detailBackdrop from "@/app/assets/benefits/Man.png";

const DESCRIPTION =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.";

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
    </main>
  );
}
