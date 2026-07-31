"use client";

import { useEffect, useRef } from "react";

export type SkillsetItem = {
  id: string;
  title: string;
  description: string;
};

export function SkillsetCarousel({
  items,
  imageUrls,
}: {
  items: SkillsetItem[];
  imageUrls: string[];
}) {
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

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
  }, []);

  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scrollbar-none py-1 pb-10 pl-6.5 pr-4 sm:-mx-6 sm:gap-7 sm:pb-12 sm:pl-8.5 sm:pr-6 lg:gap-8">
      {items.map((s, i) => (
        <article
          key={s.id}
          ref={(node) => {
            cardRefs.current[i] = node;
          }}
          style={{ transitionDelay: `${Math.min(i, 6) * 90}ms` }}
          className="skillset-card group relative aspect-3/4 w-[78%] shrink-0 snap-start overflow-hidden rounded-2xl border-2 border-white/35 bg-zinc-900 opacity-0 shadow-[0_16px_48px_rgba(0,0,0,0.5)] transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 translate-y-6 sm:w-[46%] lg:w-[31%]"
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
              <span className="font-medium text-white">Description: </span>
              {s.description}
            </p>
          </div>
        </article>
      ))}
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
