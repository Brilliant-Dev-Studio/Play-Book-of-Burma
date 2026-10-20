"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const NAV_ITEMS = [
  { href: "/library", label: "Choose Playbook you want to learn" },
  { href: "/library", label: "Pick Industry you want to expert at it" },
  { href: "/library", label: "Pick Skillsets you want to level up" },
] as const;

/** Nav chevron: `duration-[220ms] ease-out`. Preview: fade in/out only (`opacity` + ease-in-out). */
export function HeroEasyNav() {
  const [open, setOpen] = useState(false);
  const [isMdUp, setIsMdUp] = useState(false);
  const closeRaf = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsMdUp(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const cancelScheduledClose = useCallback(() => {
    if (closeRaf.current !== null) {
      cancelAnimationFrame(closeRaf.current);
    }
    closeRaf.current = null;
  }, []);

  const openNow = useCallback(() => {
    cancelScheduledClose();
    setOpen(true);
  }, [cancelScheduledClose]);

  /** Close on the next frame so the browser always runs the exit transition (no 200ms “stick”). */
  const scheduleClose = useCallback(() => {
    cancelScheduledClose();
    closeRaf.current = requestAnimationFrame(() => {
      closeRaf.current = null;
      setOpen(false);
    });
  }, [cancelScheduledClose]);

  useEffect(
    () => () => {
      cancelScheduledClose();
    },
    [cancelScheduledClose],
  );

  return (
    <div
      ref={rootRef}
      className="relative mt-5 w-full max-w-lg"
      onMouseEnter={openNow}
      onMouseLeave={scheduleClose}
      onFocusCapture={openNow}
      onBlurCapture={() => {
        requestAnimationFrame(() => {
          const el = document.activeElement;
          if (rootRef.current?.contains(el)) return;
          scheduleClose();
        });
      }}
    >
      <nav
        className="flex min-w-0 flex-col gap-2.5"
        aria-label="Browse by focus"
      >
        {NAV_ITEMS.map(({ href, label }) => (
          <Link
            key={label}
            href={href}
            className="group flex w-full items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#2a2a2e] px-5 py-3.5 text-left text-[15px] font-normal tracking-tight text-white transition-colors hover:bg-[#333338] sm:px-6 sm:py-4 sm:text-base"
          >
            <span className="min-w-0">{label}</span>
            <span
              className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-[0.65rem] leading-none text-coral transition-transform duration-[220ms] ease-out group-hover:-rotate-90 group-focus-within:-rotate-90 motion-reduce:duration-100 motion-reduce:group-hover:rotate-0 motion-reduce:group-focus-within:rotate-0"
              aria-hidden
            >
              ▶
            </span>
          </Link>
        ))}
      </nav>

      {/* Desktop: flyout to the right of the first row; mobile: below stack */}
      <aside
        aria-hidden={isMdUp && !open}
        className={`z-40 flex w-[min(100%,14rem)] flex-col justify-center gap-2.5 rounded-xl border border-white/15 bg-[#101010] p-3 transform-gpu transition-opacity duration-[280ms] ease-in-out motion-reduce:transition-none max-md:mt-4 max-md:w-full ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0 max-md:pointer-events-auto max-md:opacity-100"
        } absolute top-0 left-full ml-3 max-md:static max-md:ml-0`}
      >
        <Link
          href="/library"
          tabIndex={!isMdUp || open ? 0 : -1}
          className="flex w-full min-w-[10rem] items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-[#212124] px-3 py-2 text-left text-sm font-normal text-white transition-colors hover:bg-[#2a2a2e]"
        >
          <span className="truncate">CEO Playbook</span>
          <span
            className="shrink-0 text-[0.65rem] leading-none text-white/45"
            aria-hidden
          >
            ▶
          </span>
        </Link>
        <Link
          href="/library"
          tabIndex={!isMdUp || open ? 0 : -1}
          className="flex w-full min-w-[10rem] items-center justify-center rounded-lg border border-white/25 bg-transparent px-3 py-2 text-center text-sm font-bold tracking-tight text-white transition-colors hover:bg-white/[0.06]"
        >
          View all
        </Link>
      </aside>
    </div>
  );
}
