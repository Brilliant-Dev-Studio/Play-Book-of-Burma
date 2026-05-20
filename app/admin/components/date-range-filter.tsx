"use client";

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

export function DateRangeFilter({
  range = "May 16, 2025 – May 15, 2026",
  preset = "Last 365 Days",
}: {
  range?: string;
  preset?: string;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-left text-sm transition-colors hover:bg-white/[0.08]"
    >
      <IconCalendar className="h-4 w-4 text-coral" />
      <span className="flex flex-col leading-tight">
        <span className="text-xs text-white">{range}</span>
        <span className="text-[10px] uppercase tracking-[0.14em] text-white/45">{preset}</span>
      </span>
      <IconCaret className="h-3.5 w-3.5 text-white/55" />
    </button>
  );
}
