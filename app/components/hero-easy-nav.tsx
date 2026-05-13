"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const NAV_ITEMS = [
  { href: "/library", label: "Playbook You Want to Learn" },
  { href: "/library", label: "Industry You Want to Expert" },
  { href: "/library", label: "Skillsets You Want to Level up" },
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
      closeRaf.current = null;
    }
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
      className="mt-5 flex w-full flex-col gap-4 md:flex-row md:items-stretch md:gap-5"
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
        className="flex min-w-0 flex-1 flex-col gap-2 md:min-w-0"
        aria-label="Browse by focus"
      >
        {NAV_ITEMS.map(({ href, label }) => (
          <Link
            key={label}
            href={href}
            className="group flex w-full items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-[#212124] px-3 py-2 text-left text-sm font-normal tracking-tight text-white transition-colors hover:bg-[#2a2a2e] sm:rounded-xl sm:px-3.5 sm:py-2 sm:text-[15px]"
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

      <aside
        aria-hidden={isMdUp && !open}
        className={`flex shrink-0 flex-col justify-center gap-2.5 rounded-xl border border-white/15 bg-[#101010] p-3 md:transform-gpu md:transition-opacity md:duration-[280ms] md:ease-in-out motion-reduce:md:transition-none max-md:pointer-events-auto max-md:w-full max-md:opacity-100 md:min-w-[10.75rem] md:max-w-[17rem] md:w-[min(17rem,36%)] md:shrink-0 md:self-stretch ${
          open
            ? "md:pointer-events-auto md:opacity-100"
            : "md:pointer-events-none md:opacity-0"
        }`}
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
