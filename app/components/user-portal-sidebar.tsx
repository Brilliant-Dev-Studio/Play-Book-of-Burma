"use client";

const FILTER_GROUPS = [
  { heading: "Playbook", options: ["CEO Playbook"] },
  { heading: "Industry", options: ["Retails", "FMCG", "Technology"] },
  { heading: "Skillsets", options: ["Business, Finance & Strategy"] },
] as const;

function IconCheck({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export function UserPortalSidebar({
  selected,
  onToggle,
  onClearAll,
  onClose,
}: {
  selected: Set<string>;
  onToggle: (option: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}) {
  const totalSelected = selected.size;

  return (
    <aside className="sticky top-0 z-20 hidden h-dvh w-72 shrink-0 flex-col border-r border-white/10 bg-zinc-950 lg:flex">
      {/* Header */}
      <div className="px-7 pb-6 pt-10">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-[family-name:var(--font-rwst-stack)] text-xl font-bold tracking-tight text-white">
            Choose What You Learn
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Hide filters"
            className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
        <span
          className="mt-3 block h-0.75 w-10 rounded-full bg-coral shadow-[0_0_18px_rgba(236,113,71,0.4)]"
          aria-hidden
        />
      </div>

      {/* Filter groups */}
      <div className="flex-1 overflow-y-auto px-7 pb-8 scrollbar-thin [-ms-overflow-style:none] [scrollbar-color:rgba(255,255,255,0.15)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
        <div className="flex flex-col gap-6">
          {FILTER_GROUPS.map((group, idx) => {
            const groupCount = group.options.filter((o) => selected.has(o)).length;
            return (
              <div
                key={group.heading}
                className={idx > 0 ? "border-t border-white/[0.06] pt-6" : ""}
              >
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">
                    {group.heading}
                  </h3>
                  {groupCount > 0 && (
                    <span className="rounded-full bg-coral/15 px-2 py-0.5 text-[10px] font-bold text-coral">
                      {groupCount}
                    </span>
                  )}
                </div>
                <ul className="mt-3 flex flex-col gap-0.5">
                  {group.options.map((option) => {
                    const checked = selected.has(option);
                    return (
                      <li key={option}>
                        <label
                          className={`group/option flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2.5 text-sm leading-snug transition-colors hover:bg-white/[0.04] focus-within:bg-white/[0.04] ${
                            checked ? "text-white" : "text-white/80 hover:text-white"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => onToggle(option)}
                            className="sr-only"
                          />
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-150 ${
                              checked
                                ? "border-coral bg-coral shadow-[0_0_0_4px_rgba(236,113,71,0.12)]"
                                : "border-white/30 bg-transparent group-hover/option:border-white/55"
                            }`}
                            aria-hidden
                          >
                            <IconCheck
                              className={`h-3 w-3 text-white transition-opacity duration-150 ${checked ? "opacity-100" : "opacity-0"}`}
                            />
                          </span>
                          <span>{option}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer — Clear all (only when selections exist) */}
      {totalSelected > 0 && (
        <div className="border-t border-white/10 bg-black/40 px-7 py-4">
          <button
            type="button"
            onClick={onClearAll}
            className="flex w-full items-center justify-between rounded-md px-1 py-1 text-sm font-medium text-white/70 transition-colors hover:text-coral focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
          >
            <span>Clear all filters</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white">
              {totalSelected}
            </span>
          </button>
        </div>
      )}
    </aside>
  );
}
