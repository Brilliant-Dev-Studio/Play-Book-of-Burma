"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/app/components/sign-out-button";

type AdminUser = {
  email: string;
  displayName: string | null;
  photoUrl: string | null;
};

function titleForPath(pathname: string | null): string {
  if (!pathname) return "Admin";
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/users")) return "Users";
  if (pathname.startsWith("/admin/submissions")) return "Submissions";
  if (pathname.startsWith("/admin/subscribers")) return "Subscribers";
  if (pathname.startsWith("/admin/retention")) return "Retention";
  return "Admin";
}

function initials(user: AdminUser): string {
  const source = user.displayName?.trim() || user.email;
  const parts = source.split(/\s+|@/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return letters.join("") || "A";
}

function IconBell({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
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

export function AdminTopBar({ user }: { user: AdminUser }) {
  const pathname = usePathname();
  const title = titleForPath(pathname);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-8 py-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Admin</p>
          <h1 className="font-[family-name:var(--font-rwst-stack)] text-xl font-bold tracking-tight text-white">
            {title}
          </h1>
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-white/80 transition-colors hover:bg-white/[0.08]"
        >
          <IconBell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-coral shadow-[0_0_8px_rgba(236,113,71,0.8)]" aria-hidden />
        </button>

        {/* Avatar dropdown */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.04] py-1 pl-1 pr-3 transition-colors hover:bg-white/[0.08]"
          >
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-coral to-wine text-xs font-bold text-white">
              {user.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initials(user)
              )}
            </span>
            <span className="hidden flex-col text-left leading-tight sm:flex">
              <span className="text-xs font-semibold text-white">
                {user.displayName ?? "Administrator"}
              </span>
              <span className="text-[10px] text-white/55">{user.email}</span>
            </span>
            <IconCaret className="hidden h-3.5 w-3.5 text-white/55 sm:block" />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl">
              <div className="border-b border-white/10 px-4 py-3">
                <p className="truncate text-xs font-semibold text-white">
                  {user.displayName ?? "Administrator"}
                </p>
                <p className="truncate text-[11px] text-white/55">{user.email}</p>
              </div>
              <Link
                href="/user-portal/settings"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                Settings
              </Link>
              <div className="border-t border-white/10 px-4 py-3">
                <SignOutButton className="w-full rounded-md border border-white/15 bg-white/[0.06] px-3 py-1.5 text-center text-sm font-semibold text-white transition-colors hover:bg-white/[0.12] disabled:opacity-50" />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
