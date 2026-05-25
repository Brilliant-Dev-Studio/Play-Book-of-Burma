"use client";

import { useEffect, useRef, useState } from "react";

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </svg>
  );
}
function IconCaret({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export const RANGE_PRESETS = [
  { days: 7, label: "Last 7 Days" },
  { days: 30, label: "Last 30 Days" },
  { days: 90, label: "Last 90 Days" },
  { days: 365, label: "Last 365 Days" },
] as const;

export type RangeDays = (typeof RANGE_PRESETS)[number]["days"];

function formatRange(days: number): string {
  const to = new Date();
  const from = new Date(to.getTime() - days * 86_400_000);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(from)} – ${fmt(to)}`;
}

export function DateRangeFilter({
  days,
  onChange,
}: {
  days?: RangeDays;
  onChange?: (days: RangeDays) => void;
} = {}) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState<RangeDays>(days ?? 365);
  const current: RangeDays = days ?? internal;
  const wrapRef = useRef<HTMLDivElement>(null);
  const preset = RANGE_PRESETS.find((p) => p.days === current) ?? RANGE_PRESETS[1];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-left text-sm transition-colors hover:bg-white/[0.08]"
      >
        <IconCalendar className="h-4 w-4 text-coral" />
        <span className="flex flex-col leading-tight">
          <span className="text-xs text-white">{formatRange(preset.days)}</span>
          <span className="text-[10px] uppercase tracking-[0.14em] text-white/45">{preset.label}</span>
        </span>
        <IconCaret className="h-3.5 w-3.5 text-white/55" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-white/12 bg-zinc-950 shadow-xl">
          {RANGE_PRESETS.map((p) => {
            const active = p.days === current;
            return (
              <button
                key={p.days}
                type="button"
                onClick={() => {
                  setInternal(p.days);
                  onChange?.(p.days);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/[0.06] ${active ? "text-coral" : "text-white/85"}`}
              >
                <span>{p.label}</span>
                {active && <span className="text-xs">●</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
