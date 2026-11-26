"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { IconChevronLeft, IconChevronRight } from "@/app/components/carousel-chevrons";

export type SkillsetItem = {
  id: string;
  title: string;
  description: string;
};

/**
 * Infinite left/right carousel: the card list is rendered three times and the
 * scroller is parked on the middle copy. When a scroll settles inside the first or
 * last copy it is shifted by exactly one copy's width (invisible, same cards), so the
 * arrows — and swiping — loop forever in both directions.
 */
const COPIES = 3;

export function SkillsetCarousel({
  heading,
  items,
  imageUrls,
}: {
  heading?: string;
  items: SkillsetItem[];
  imageUrls: string[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const loop = items.length > 1;
  const copies = loop ? COPIES : 1;

  /** Width of one full copy of the list (first card of copy 1 → first card of copy 2). */
  const setWidth = () => {
    const cards = cardRefs.current;
    const a = cards[0];
    const b = cards[items.length];
    return a && b ? b.offsetLeft - a.offsetLeft : 0;
  };

  const jumpBy = (dx: number) => {
    const el = scrollerRef.current;
    if (!el || dx === 0) return;
    const prev = el.style.scrollSnapType;
    el.style.scrollSnapType = "none"; // so snapping doesn't fight the instant shift
    el.scrollLeft += dx;
    requestAnimationFrame(() => {
      el.style.scrollSnapType = prev;
    });
  };

  // Park on the middle copy before first paint.
  useLayoutEffect(() => {
    if (!loop) return;
    const w = setWidth();
    if (w > 0) jumpBy(w);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- measure once per item set
  }, [loop, items.length]);

  // Re-centre on the middle copy once a scroll comes to rest near either end.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !loop) return;
    let timer: number | undefined;
    const recentre = () => {
      const w = setWidth();
      if (w <= 0) return;
      if (el.scrollLeft < w * 0.5) jumpBy(w);
      else if (el.scrollLeft > w * 1.5) jumpBy(-w);
    };
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(recentre, 140); // fallback for browsers without `scrollend`
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scrollend", recentre);
    return () => {
      window.clearTimeout(timer);
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend", recentre);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loop, items.length]);

  // Entrance animation (fade/slide up) as cards come into view.
  useEffect(() => {
    const nodes = cardRefs.current.filter((n): n is HTMLElement => n !== null);
    if (nodes.length === 0) return;

    // Cards already on screen at mount reveal instantly (no transition) so the
    // entrance animation doesn't visibly "pop" the first row on initial load.
    const viewportHeight = window.innerHeight;
    const alreadyVisible = new Set<HTMLElement>();
    nodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      if (rect.top < viewportHeight && rect.bottom > 0) {
        node.classList.add("is-visible", "no-entrance-transition");
        alreadyVisible.add(node);
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" },
    );

    nodes.forEach((node) => {
      if (!alreadyVisible.has(node)) observer.observe(node);
    });
    return () => observer.disconnect();
  }, [items.length]);

  function scrollByDir(dir: -1 | 1) {
    const el = scrollerRef.current;
    const card = cardRefs.current[0];
    if (!el || !card) return;
    const gap = Number.parseFloat(getComputedStyle(el).columnGap || "24") || 24;
    el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: "smooth" });
  }

  const arrowClass =
    "flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white transition-colors sm:h-11 sm:w-11";

  return (
    <div>
      {heading || loop ? (
        <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
          {heading ? (
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">{heading}</h2>
          ) : (
            <span />
          )}
          {loop ? (
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                aria-label="Previous skillset"
                onClick={() => scrollByDir(-1)}
                className={`${arrowClass} bg-white/6 hover:bg-white/12`}
              >
                <IconChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next skillset"
                onClick={() => scrollByDir(1)}
                className={`${arrowClass} bg-white/10 hover:bg-white/16`}
              >
                <IconChevronRight className="h-5 w-5" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        ref={scrollerRef}
        className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scrollbar-none py-1 pb-10 pl-6.5 pr-4 sm:-mx-6 sm:gap-7 sm:pb-12 sm:pl-8.5 sm:pr-6 lg:gap-8"
      >
        {Array.from({ length: copies }, (_, copy) =>
          items.map((s, i) => {
            const idx = copy * items.length + i;
            return (
              <article
                key={`${copy}-${s.id}`}
                ref={(node) => {
                  cardRefs.current[idx] = node;
                }}
                aria-hidden={copy !== Math.floor(copies / 2) || undefined}
                style={{ transitionDelay: `${Math.min(i, 6) * 90}ms` }}
                className="skillset-card group relative aspect-3/4 w-[78%] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/12 bg-zinc-900 opacity-0 shadow-[0_16px_48px_rgba(0,0,0,0.5)] transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 translate-y-6 sm:w-[46%] lg:w-[31%]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrls[i]}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.82)_28%,rgba(0,0,0,0.45)_50%,rgba(0,0,0,0.15)_68%,transparent_82%)]"
                  aria-hidden
                />
                <span className="absolute left-3 top-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-coral text-xl font-bold text-white shadow-[0_4px_14px_rgba(236,113,71,0.5)] sm:left-4 sm:top-4 sm:h-14 sm:w-14 sm:text-2xl">
                  {i + 1}
                </span>
                <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-5 sm:px-6 sm:pb-6">
                  <h3 className="line-clamp-2 text-lg font-bold leading-snug tracking-tight text-white sm:text-xl">
                    {s.title}
                  </h3>
                  <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-white/80 sm:text-[0.95rem]">
                    {s.description}
                  </p>
                </div>
              </article>
            );
          }),
        )}
      </div>
      <style jsx>{`
        .skillset-card.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .skillset-card.no-entrance-transition {
          transition: none;
        }
      `}</style>
    </div>
  );
}
