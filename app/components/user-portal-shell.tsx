"use client";

import { useState, type ReactNode } from "react";
import {
  UserPortalSidebar,
  type FilterGroup,
} from "@/app/components/user-portal-sidebar";

function IconFilter({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 6h18M6 12h12M10 18h4" />
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

export function UserPortalShell({
  filterGroups,
  children,
  selected: controlledSelected,
  onSelectedChange,
  defaultSidebarOpen = true,
  showFilterToolbar = true,
}: {
  filterGroups: FilterGroup[];
  children: ReactNode;
  /** Optional controlled filter state (home page). */
  selected?: Set<string>;
  onSelectedChange?: (next: Set<string>) => void;
  defaultSidebarOpen?: boolean;
  showFilterToolbar?: boolean;
}) {
  const [internalSelected, setInternalSelected] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(defaultSidebarOpen);

  const selected = controlledSelected ?? internalSelected;
  const setSelected = onSelectedChange ?? setInternalSelected;

  function toggle(option: string) {
    const next = new Set(selected);
    if (next.has(option)) next.delete(option);
    else next.add(option);
    if (onSelectedChange) onSelectedChange(next);
    else setInternalSelected(next);
  }

  function clearAll() {
    const empty = new Set<string>();
    if (onSelectedChange) onSelectedChange(empty);
    else setInternalSelected(empty);
  }

  const selectedArray = Array.from(selected);
  const totalSelected = selected.size;

  return (
    <div className="flex min-h-0 flex-1 overflow-x-clip bg-black">
      {isOpen && (
        <UserPortalSidebar
          selected={selected}
          onToggle={toggle}
          onClearAll={clearAll}
          onClose={() => setIsOpen(false)}
          filterGroups={filterGroups}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {showFilterToolbar ? (
          <div className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/85 backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4 lg:px-10">
              <button
                type="button"
                onClick={() => setIsOpen((o) => !o)}
                aria-expanded={isOpen}
                className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/6 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
              >
                <IconFilter className="h-4 w-4 text-coral" />
                <span className="hidden sm:inline">
                  {isOpen ? "Hide Filters" : "Show Filters"}
                </span>
                <span className="sm:hidden">Filters</span>
                {totalSelected > 0 && (
                  <span className="ml-1 rounded-full bg-coral/20 px-2 py-0.5 text-[10px] font-bold text-coral">
                    {totalSelected}
                  </span>
                )}
              </button>

              {totalSelected === 0 ? (
                <span className="text-sm text-white/50">No filters applied</span>
              ) : (
                <>
                  <ul className="flex flex-wrap items-center gap-2">
                    {selectedArray.map((option) => (
                      <li key={option}>
                        <button
                          type="button"
                          onClick={() => toggle(option)}
                          className="group/chip flex items-center gap-1.5 rounded-full border border-coral/30 bg-coral/10 py-1 pl-3 pr-1.5 text-xs font-semibold text-white transition-colors hover:border-coral/50 hover:bg-coral/20"
                          aria-label={`Remove ${option} filter`}
                        >
                          <span>{option}</span>
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-coral/30 text-coral">
                            <IconX className="h-2.5 w-2.5" />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {totalSelected > 1 && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="text-xs font-medium text-white/60 underline underline-offset-2 hover:text-coral"
                    >
                      Clear all
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ) : null}

        {children}
      </div>
    </div>
  );
}
