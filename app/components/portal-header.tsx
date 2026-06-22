"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function isNavActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/user-portal") return pathname === "/user-portal";
  return pathname === href || pathname.startsWith(`${href}/`);
}
import logo from "@/app/assets/logo.png";
import { useCurrentUser, clearCurrentUserCache } from "@/lib/hooks/useCurrentUser";
import { logout } from "@/lib/auth";

function IconLightBulb({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.7}
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
      />
    </svg>
  );
}

function IconBook({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.7}
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    </svg>
  );
}

function IconChevron({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

const portalNavItems = [
  { href: "/user-portal/progress", label: "My Progress", icon: IconLightBulb },
  { href: "/user-portal/library", label: "Library", icon: IconBook },
] as const;

export function PortalHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user: liveUser, loading: liveLoading } = useCurrentUser();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Force the SSR-matching state on the very first client render so the
  // hydrated DOM never diverges, even if the module-level cache in
  // `useCurrentUser` was already populated by a prior navigation.
  const user = mounted ? liveUser : null;
  const loading = mounted ? liveLoading : true;

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  async function handleSignOut() {
    setMenuOpen(false);
    await logout();
    clearCurrentUserCache();
    router.push("/");
    router.refresh();
  }

  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="relative bg-black">
      <div className="w-full px-4 py-2.5 sm:px-6 lg:px-10">
        <div className="flex min-h-16 w-full items-center justify-between gap-4 sm:min-h-18 sm:gap-6 lg:min-h-20">
          <Link
            href="/user-portal"
            className="relative flex min-w-0 shrink-0 items-center outline-offset-4 focus-visible:outline-2 focus-visible:outline-white/80"
          >
            <Image
              src={logo}
              alt="Story of Burma"
              priority
              className="h-12 w-auto sm:h-13 md:h-14 lg:h-15"
              sizes="(max-width: 768px) 240px, 320px"
            />
          </Link>

          <div className="flex items-center gap-5 sm:gap-7 md:gap-9">
            {portalNavItems.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative hidden items-center gap-2 transition-colors sm:flex ${
                    active ? "text-coral" : "text-white/95 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 text-coral" />
                  <span className="text-[15px] font-bold tracking-tight">
                    {item.label}
                  </span>
                  {active && (
                    <span
                      className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-coral"
                      aria-hidden
                    />
                  )}
                </Link>
              );
            })}

            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-busy={loading || undefined}
                suppressHydrationWarning
                className={`flex items-center gap-2.5 rounded-full pr-1 outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-white/40 sm:gap-3 ${
                  loading ? "opacity-60" : ""
                }`}
              >
                <span className="hidden truncate text-[15px] font-semibold tracking-tight text-white sm:block">
                  {displayName}
                </span>
                {user?.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-white/15"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-coral text-base font-bold text-white">
                    {initial}
                  </span>
                )}
                <IconChevron
                  className={`h-4 w-4 text-white/70 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-lg border border-white/10 bg-zinc-900 shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
                >
                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-white">
                      {displayName}
                    </p>
                    {user?.email && (
                      <p className="mt-0.5 truncate text-xs text-white/60">
                        {user.email}
                      </p>
                    )}
                    {user?.membership?.plan && (
                      <span className="mt-2 inline-flex items-center rounded-full bg-coral/15 px-2.5 py-0.5 text-[11px] font-semibold text-coral">
                        {user.membership.plan === "SIX_MONTHS" ? "6 Month Plan" : "12 Month Plan"}
                      </span>
                    )}
                  </div>

                  {/* Mobile-only nav items */}
                  <div className="border-b border-white/10 sm:hidden">
                    {portalNavItems.map((item) => {
                      const Icon = item.icon;
                      const active = isNavActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          role="menuitem"
                          aria-current={active ? "page" : undefined}
                          className={`flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/6 ${
                            active ? "border-l-2 border-coral bg-coral/10 text-coral" : "text-white"
                          }`}
                        >
                          <Icon className="h-4 w-4 text-coral" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>

                  <Link
                    href="/user-portal/settings"
                    onClick={() => setMenuOpen(false)}
                    role="menuitem"
                    className="block px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/6"
                  >
                    Settings
                  </Link>
                  {user?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                      className="block border-t border-white/10 px-4 py-3 text-sm font-medium text-coral transition-colors hover:bg-white/6"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    role="menuitem"
                    className="block w-full border-t border-white/10 px-4 py-3 text-left text-sm font-medium text-white transition-colors hover:bg-white/6"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
