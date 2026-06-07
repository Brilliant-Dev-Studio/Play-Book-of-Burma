import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { presignGetUrl, PRESIGN_TTL } from "@/lib/server/s3";
import { getSession } from "@/lib/server/auth-helpers";
import { HomeMembershipCta } from "@/app/components/home-membership-cta";
import { TrailerSection } from "./trailer-section";

export async function VideoDetail({
  videoId,
  variant,
  basePath,
}: {
  videoId?: string;
  variant: "landing" | "portal";
  basePath: string;
}) {
  // Container width follows the header for each context: the portal header is
  // full-width (lg:px-10); the marketing site header is capped at max-w-[85%].
  const shell =
    variant === "portal"
      ? "w-full px-4 sm:px-6 lg:px-10"
      : "mx-auto w-full max-w-[85%] px-4 sm:px-6 lg:px-8";

  if (!videoId) {
    const fallback = await prisma.video.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: { id: true },
    });
    if (!fallback) notFound();
    redirect(`${basePath}?video=${fallback.id}`);
  }

  const video = await prisma.video.findFirst({
    where: { id: videoId, status: "PUBLISHED" },
    include: {
      instructor: true,
      lessons: { orderBy: { order: "asc" } },
      skillsetItems: { orderBy: { order: "asc" } },
    },
  });
  if (!video) notFound();

  const session = await getSession();
  const watchPath = `/user-portal/watch?video=${video.id}`;
  const startWatchingHref = session
    ? watchPath
    : `/login?next=${encodeURIComponent(watchPath)}`;

  const [thumbnailUrl, trailerUrl, guidebookUrl, skillsetImageUrls] = await Promise.all([
    presignGetUrl(video.thumbnailKey, PRESIGN_TTL.image),
    video.trailerKey
      ? presignGetUrl(video.trailerKey, PRESIGN_TTL.video)
      : Promise.resolve<string | null>(null),
    video.guidebookKey
      ? presignGetUrl(video.guidebookKey, PRESIGN_TTL.image)
      : Promise.resolve<string | null>(null),
    Promise.all(
      video.skillsetItems.map((s) =>
        s.imageKey ? presignGetUrl(s.imageKey, PRESIGN_TTL.image) : Promise.resolve(""),
      ),
    ),
  ]);

  const title = [video.titleLine1, video.titleLine2].filter(Boolean).join(" ");

  return (
    <main className="flex min-h-0 w-full flex-1 flex-col bg-black">
      <div className="relative isolate min-h-[min(68dvh,620px)] w-full shrink-0 overflow-hidden pb-6 sm:pb-8 md:pb-10">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt=""
            className="h-full w-full object-cover object-center"
            draggable={false}
          />
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.94)_22%,rgba(0,0,0,0.78)_38%,rgba(0,0,0,0.45)_55%,rgba(0,0,0,0.18)_72%,transparent_90%)] max-md:bg-[linear-gradient(180deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.75)_35%,rgba(0,0,0,0.45)_60%,rgba(0,0,0,0.2)_80%,transparent_100%)]"
            aria-hidden
          />
        </div>

        <div className={`relative z-[3] flex min-h-[min(68dvh,620px)] flex-1 flex-col pt-12 pb-16 sm:pt-14 sm:pb-20 md:flex-row ${shell}`}>
          <div className="flex w-full flex-1 flex-col items-start justify-center md:w-[30vw] md:max-w-[30vw] md:shrink-0">
            <div className="w-full max-w-3xl text-left text-white max-md:rounded-lg max-md:bg-black/35 max-md:px-4 max-md:py-6 sm:max-md:px-5">
              <h1 className="text-2xl font-semibold leading-tight tracking-tight text-balance sm:text-3xl md:text-[1.95rem] md:leading-[1.14] lg:text-4xl">
                <span className="block">{video.titleLine1}</span>
                {video.titleLine2 && <span className="block">{video.titleLine2}</span>}
              </h1>

              <span
                className="mt-5 block h-1 w-20 shrink-0 bg-coral sm:mt-6"
                aria-hidden
              />

              <p className="mt-5 text-base font-semibold leading-snug tracking-tight text-white sm:text-lg">
                {video.instructor.name}, {video.instructor.title}
              </p>

              <p className="mt-5 text-left text-sm leading-relaxed text-white/90 sm:mt-6 sm:text-base">
                <span className="font-medium text-white">Description: </span>
                {video.description}
              </p>

              <Link
                href={startWatchingHref}
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-coral px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-coral/90 sm:mt-8 sm:px-6 sm:py-3 sm:text-base"
              >
                ▶ Start watching
              </Link>
            </div>
          </div>
          <div className="hidden min-h-[min(68dvh,620px)] md:block md:min-w-0 md:flex-1" aria-hidden />
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 left-[30vw] z-[2] hidden w-40 -translate-x-1/2 backdrop-blur-md [mask-image:linear-gradient(90deg,transparent_0%,black_45%,black_55%,transparent_100%)] [-webkit-mask-image:linear-gradient(90deg,transparent_0%,black_45%,black_55%,transparent_100%)] sm:w-56 md:block"
          aria-hidden
        />
      </div>

      {trailerUrl && (
        <section className="w-full shrink-0 bg-black py-16 md:py-20 lg:py-24 xl:py-28">
          <div className={shell}>
            <TrailerSection
              trailerUrl={trailerUrl}
              posterUrl={thumbnailUrl}
              title={`${title} — Trailer`}
            />
          </div>
        </section>
      )}

      {video.skillsetItems.length > 0 && (
        <section className="w-full shrink-0 bg-black pb-16 md:pb-20 lg:pb-24 xl:pb-28">
          <div className={shell}>
            <h2 className="mb-8 text-2xl font-bold tracking-tight text-white sm:text-3xl md:mb-10 md:text-4xl">
              Skillset You will Learn
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-7 lg:grid-cols-3 lg:gap-8">
              {video.skillsetItems.map((s, i) => (
                <article
                  key={s.id}
                  className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-zinc-900 shadow-[0_16px_48px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={skillsetImageUrls[i]}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.82)_28%,rgba(0,0,0,0.45)_50%,rgba(0,0,0,0.15)_68%,transparent_82%)]"
                    aria-hidden
                  />
                  <span className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-coral text-base font-bold text-white shadow-[0_4px_14px_rgba(236,113,71,0.5)] sm:left-4 sm:top-4 sm:h-10 sm:w-10 sm:text-lg">
                    {i + 1}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-5 sm:px-6 sm:pb-6">
                    <h3 className="text-lg font-bold leading-snug tracking-tight text-white sm:text-xl">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-[0.95rem]">
                      <span className="font-medium text-white">Description: </span>
                      {s.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="w-full shrink-0 bg-black pb-16 md:pb-20 lg:pb-24 xl:pb-28">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-white sm:text-3xl md:mb-10 md:text-4xl">
            Lessons Plan
          </h2>

          {video.lessons.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/[0.04] py-12 text-center text-white/55">
              No lessons in this course yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {video.lessons.map((lesson, index) => (
                <details
                  key={lesson.id}
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
                      {lesson.durationLabel}
                    </span>
                    <span
                      className="shrink-0 text-xs text-white/50 transition-transform duration-200 ease-out group-open:rotate-180"
                      aria-hidden
                    >
                      ▼
                    </span>
                  </summary>
                  <div className="border-t border-white/[0.06] bg-black/25 px-5 py-4 pl-[3.25rem] text-sm leading-relaxed text-white/80 sm:px-6 sm:pl-14 sm:text-[15px]">
                    {lesson.details || "No description for this lesson."}
                  </div>
                </details>
              ))}
            </div>
          )}

          {guidebookUrl && (
            <div className="mt-6 flex flex-col gap-5 border border-white/10 bg-zinc-900/90 p-5 sm:mt-8 sm:flex-row sm:gap-7 sm:p-7 md:mt-10">
              <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-lg bg-zinc-800 sm:w-40 md:w-48">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl">
                  Download Learning Resources
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/85 sm:text-[0.95rem]">
                  <span className="font-medium text-white">Description: </span>
                  The course guidebook for {title} by {video.instructor.name}.
                </p>
                {(() => {
                  const btnClass =
                    "mt-5 flex w-fit items-center gap-2 rounded-md border border-white/20 bg-transparent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral sm:mt-6 sm:px-6 sm:py-3 sm:text-base";
                  const inner = (
                    <>
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
                    </>
                  );
                  // Members (logged in) download the PDF directly; visitors are
                  // sent to the membership page to subscribe first.
                  return session ? (
                    <a
                      href={guidebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={btnClass}
                      aria-label="Download Guidebook"
                    >
                      {inner}
                    </a>
                  ) : (
                    <Link
                      href="/membership"
                      className={btnClass}
                      aria-label="Get membership to download the guidebook"
                    >
                      {inner}
                    </Link>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </section>

      <HomeMembershipCta
        variant="embedded"
        tightTop
        containerClassName={variant === "portal" ? shell : undefined}
      />
    </main>
  );
}
