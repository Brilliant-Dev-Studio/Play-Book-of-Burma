"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

const NAV_ITEMS = [
  { label: "Choose the Playbook You Want to Learn" },
  { label: "Pick the Industry You Want to Master" },
  { label: "Pick the Skillsets You Want to Sharpen" },
] as const;

/** Where every hero choice leads: signed-in → the portal library, signed-out → membership. */
const PORTAL_HREF = "/user-portal/library";
const MEMBERSHIP_HREF = "/membership";

/** Index of the "Pick Industry" row — its flyout lists the admin-managed industries. */
const INDUSTRY_ROW = 1;

export type HeroIndustry = { id: string; name: string };

/** Industries (from Admin → Industries, in admin order); each links to `href`. */
function IndustryList({ industries, href }: { industries: HeroIndustry[]; href: string }) {
  return (
    <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto overscroll-contain" aria-label="Industries">
      {industries.map((ind) => (
        <li key={ind.id}>
          <Link
            href={href}
            className="flex w-full min-w-[10rem] items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-[#212124] px-3 py-2 text-left text-sm font-normal text-white transition-colors hover:bg-[#2a2a2e]"
          >
            <span className="truncate">{ind.name}</span>
            <span className="shrink-0 text-[0.65rem] leading-none text-white/45" aria-hidden>
              ▶
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Nav chevron: `duration-[220ms] ease-out`. Preview: fade in/out only (`opacity` + ease-in-out). */
export function HeroEasyNav({ industries = [] }: { industries?: HeroIndustry[] }) {
  const { user } = useCurrentUser();
  const destHref = user ? PORTAL_HREF : MEMBERSHIP_HREF;
  const [open, setOpen] = useState(false);
  /** Row currently hovered/focused — picks which flyout shows on desktop. */
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const showIndustries = industries.length > 0;
  const industryFlyoutOpen = open && activeRow === INDUSTRY_ROW && showIndustries;
  const [isMdUp, setIsMdUp] = useState(false);
  /** Phone/tablet: industry chips are collapsed until the "Pick Industry" row is tapped. */
  const [mobileIndustriesOpen, setMobileIndustriesOpen] = useState(false);
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
      window.clearTimeout(closeRaf.current);
    }
    closeRaf.current = null;
  }, []);

  const openNow = useCallback(() => {
    cancelScheduledClose();
    setOpen(true);
  }, [cancelScheduledClose]);

  /** Close after a short grace period so the pointer can travel from a row to its flyout
   * (or cut a corner) without the flyout disappearing mid-way. */
  const scheduleClose = useCallback(() => {
    cancelScheduledClose();
    closeRaf.current = window.setTimeout(() => {
      closeRaf.current = null;
      setOpen(false);
    }, 220);
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
      className="relative mt-4 w-full max-w-lg sm:mt-5"
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
        className="flex min-w-0 flex-col gap-2 sm:gap-2.5"
        aria-label="Browse by focus"
      >
        {NAV_ITEMS.map(({ label }, index) => {
          const isIndustryRow = index === INDUSTRY_ROW && showIndustries;
          const rowClass =
            "group flex w-full items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-[#2a2a2e] px-4 py-2.5 text-left text-sm font-normal tracking-tight text-white transition-colors hover:bg-[#333338] sm:rounded-xl sm:px-6 sm:py-4 sm:text-base";
          const arrowClass =
            "inline-flex h-4 w-4 shrink-0 items-center justify-center text-[0.65rem] leading-none text-coral transition-transform duration-[220ms] ease-out motion-reduce:duration-100";
          return (
            <div
              key={label}
              className="relative"
              onMouseEnter={() => setActiveRow(index)}
              onFocusCapture={() => setActiveRow(index)}
            >
              {/* Phone/tablet: the Industry row toggles its chips instead of navigating */}
              {isIndustryRow ? (
                <button
                  type="button"
                  onClick={() => setMobileIndustriesOpen((v) => !v)}
                  aria-expanded={mobileIndustriesOpen}
                  aria-controls="hero-industries-mobile"
                  className={`${rowClass} md:hidden`}
                >
                  <span className="min-w-0">{label}</span>
                  <span className={`${arrowClass} ${mobileIndustriesOpen ? "rotate-90" : ""}`} aria-hidden>
                    ▶
                  </span>
                </button>
              ) : null}
              <Link
                href={destHref}
                className={`${rowClass} ${isIndustryRow ? "max-md:hidden" : ""}`}
              >
                <span className="min-w-0">{label}</span>
                <span
                  className={`${arrowClass} group-hover:-rotate-90 group-focus-within:-rotate-90 motion-reduce:group-hover:rotate-0 motion-reduce:group-focus-within:rotate-0`}
                  aria-hidden
                >
                  ▶
                </span>
              </Link>

              {isIndustryRow ? (
                <>
                  {/* Desktop: flyout to the right of this row, on hover/focus. The gap is padding
                      (not margin) so the pointer never "leaves" while crossing to the list. */}
                  <aside
                    aria-hidden={!industryFlyoutOpen}
                    className={`absolute left-full top-0 z-40 hidden pl-3 transform-gpu transition-opacity duration-[280ms] ease-in-out motion-reduce:transition-none md:block ${
                      industryFlyoutOpen ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                  >
                    <div className="w-56 rounded-xl border border-white/15 bg-[#101010] p-3">
                      <IndustryList industries={industries} href={destHref} />
                    </div>
                  </aside>
                  {/* Phone/tablet: chips under the row, shown once the row is tapped */}
                  <ul
                    id="hero-industries-mobile"
                    hidden={!mobileIndustriesOpen}
                    className="mt-2 flex flex-wrap gap-2 md:hidden"
                    aria-label="Industries"
                  >
                    {industries.map((ind) => (
                      <li key={ind.id}>
                        <Link
                          href={destHref}
                          className="block rounded-full border border-white/10 bg-[#212124] px-3 py-1 text-xs text-white/85 transition-colors hover:bg-[#2a2a2e]"
                        >
                          {ind.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          );
        })}
      </nav>

      {/* Desktop only: flyout to the right of the first row (hidden while the Industry flyout
          shows). Not shown on phone/tablet — "Choose Playbook" already goes to the library. */}
      <aside
        aria-hidden={!open || industryFlyoutOpen}
        className={`absolute left-full top-0 z-40 pl-3 transform-gpu transition-opacity duration-[280ms] ease-in-out motion-reduce:transition-none max-md:hidden ${
          open && !industryFlyoutOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex w-56 flex-col justify-center gap-2.5 rounded-xl border border-white/15 bg-[#101010] p-3">
        <Link
          href={destHref}
          tabIndex={isMdUp && open && !industryFlyoutOpen ? 0 : -1}
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
          href={destHref}
          tabIndex={isMdUp && open && !industryFlyoutOpen ? 0 : -1}
          className="flex w-full min-w-[10rem] items-center justify-center rounded-lg border border-white/25 bg-transparent px-3 py-2 text-center text-sm font-bold tracking-tight text-white transition-colors hover:bg-white/[0.06]"
        >
          View all
        </Link>
        </div>
      </aside>
    </div>
  );
}
