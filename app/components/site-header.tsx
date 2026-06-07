"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import logo from "@/app/assets/logo.png";
import { useEffect, useRef, useState } from "react";
import { useCurrentUser, clearCurrentUserCache } from "@/lib/hooks/useCurrentUser";
import { logout } from "@/lib/auth";

const mainNavItems = [
  { href: "/", label: "Home" },
  { href: "/membership", label: "Membership" },
  { href: "/library", label: "Library" },
] as const;

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function IconChevronDown({ className }: { className?: string }) {
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

function MenuToggleIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-5 w-6" aria-hidden>
      <span
        className={[
          "absolute left-0 top-1/2 block h-0.5 w-6 rounded-full bg-white transition-transform duration-200",
          open ? "-translate-y-1/2 rotate-45" : "-translate-y-2",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 top-1/2 block h-0.5 w-6 rounded-full bg-white transition-opacity duration-200",
          open ? "opacity-0" : "-translate-y-1/2 opacity-100",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 top-1/2 block h-0.5 w-6 rounded-full bg-white transition-transform duration-200",
          open ? "-translate-y-1/2 -rotate-45" : "translate-y-1.5",
        ].join(" ")}
      />
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authMenuOpen, setAuthMenuOpen] = useState(false);
  const authMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setAuthMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!authMenuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (authMenuRef.current && !authMenuRef.current.contains(e.target as Node)) {
        setAuthMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAuthMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [authMenuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  async function handleSignOut() {
    await logout();
    clearCurrentUserCache();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <header
        className="sticky inset-x-0 top-0 z-50 bg-black"
      >
        {menuOpen ? (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
        ) : null}
        <div className="relative z-50 mx-auto w-full max-w-[85%] px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex min-h-16 w-full items-center justify-between gap-4 sm:min-h-18 sm:gap-6 lg:min-h-20">
            <Link
              href="/"
              className="relative flex min-w-0 shrink-0 items-center outline-offset-4 focus-visible:outline-2 focus-visible:outline-white/80"
              onClick={() => setMenuOpen(false)}
            >
              <Image
                src={logo}
                alt="Story of Burma"
                priority
                className="h-12 w-auto sm:h-13 md:h-14 lg:h-15"
                sizes="(max-width: 768px) 240px, 320px"
              />
            </Link>

            {/* Desktop nav */}
            <nav
              aria-label="Main"
              className="hidden items-center justify-end gap-x-8 md:flex"
            >
              {mainNavItems.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative text-[15px] font-bold tracking-tight transition-colors ${
                      active ? "text-coral" : "text-white/95 hover:text-white"
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span
                        className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-coral"
                        aria-hidden
                      />
                    )}
                  </Link>
                );
              })}

              {/* Desktop auth */}
              {loading ? (
                <div
                  role="status"
                  aria-label="Checking sign-in"
                  className="flex items-center gap-2"
                >
                  <span
                    className="h-9 w-9 animate-pulse rounded-full bg-white/10"
                    aria-hidden
                  />
                  <span
                    className="hidden h-3 w-14 animate-pulse rounded bg-white/10 md:block"
                    aria-hidden
                  />
                  <span className="sr-only">Checking sign-in…</span>
                </div>
              ) : user ? (
                <div ref={authMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setAuthMenuOpen((o) => !o)}
                    aria-expanded={authMenuOpen}
                    aria-haspopup="menu"
                    className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  >
                    {user.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.photoUrl}
                        alt={user.displayName ?? "Profile"}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-white/20"
                      />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coral text-sm font-bold text-white">
                        {(user.displayName ?? user.email ?? "U").charAt(0).toUpperCase()}
                      </span>
                    )}
                    <IconChevronDown
                      className={`h-4 w-4 text-white/70 transition-transform duration-200 ${authMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {authMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-lg border border-white/10 bg-zinc-900 shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
                    >
                      <div className="border-b border-white/10 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-white">
                          {user.displayName ?? "User"}
                        </p>
                        {user.email && (
                          <p className="mt-0.5 truncate text-xs text-white/60">
                            {user.email}
                          </p>
                        )}
                      </div>
                      <Link
                        href="/user-portal"
                        onClick={() => setAuthMenuOpen(false)}
                        role="menuitem"
                        className="block px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.06]"
                      >
                        Go to User Portal
                      </Link>
                      <Link
                        href="/user-portal/settings"
                        onClick={() => setAuthMenuOpen(false)}
                        role="menuitem"
                        className="block border-t border-white/10 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.06]"
                      >
                        Settings
                      </Link>
                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setAuthMenuOpen(false)}
                          role="menuitem"
                          className="block border-t border-white/10 px-4 py-3 text-sm font-medium text-coral transition-colors hover:bg-white/[0.06]"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={async () => {
                          setAuthMenuOpen(false);
                          await handleSignOut();
                        }}
                        role="menuitem"
                        className="block w-full border-t border-white/10 px-4 py-3 text-left text-sm font-medium text-white transition-colors hover:bg-white/[0.06]"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  aria-current={
                    isNavActive(pathname, "/login") ? "page" : undefined
                  }
                  className={`text-[15px] font-bold tracking-tight transition-colors ${
                    isNavActive(pathname, "/login")
                      ? "text-coral"
                      : "text-white/95 hover:text-white"
                  }`}
                >
                  Login
                </Link>
              )}
            </nav>

            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/6 text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral md:hidden"
              aria-expanded={menuOpen}
              aria-controls="site-header-mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <MenuToggleIcon open={menuOpen} />
            </button>
          </div>

          {/* Mobile nav */}
          <div
            id="site-header-mobile-nav"
            className={[
              "md:hidden",
              "absolute inset-x-0 top-full z-50 border-t border-white/10 bg-black shadow-[0_24px_48px_rgba(0,0,0,0.65)] transition-[visibility,opacity,transform] duration-200 ease-out",
              menuOpen
                ? "visible translate-y-0 opacity-100"
                : "invisible -translate-y-2 opacity-0 pointer-events-none",
            ].join(" ")}
            {...(!menuOpen ? { inert: true } : {})}
          >
            <nav aria-label="Main" className="flex flex-col px-4 py-4 sm:px-6">
              {mainNavItems.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`border-b border-white/10 py-3.5 text-base font-bold tracking-tight transition-colors last:border-b-0 ${
                      active
                        ? "text-coral"
                        : "text-white/95 active:bg-white/4"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* Mobile auth */}
              {!loading && user ? (
                <>
                  <div className="flex items-center gap-3 border-b border-white/10 py-3.5">
                    {user.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.photoUrl}
                        alt={user.displayName ?? "Profile"}
                        width={28}
                        height={28}
                        className="h-7 w-7 rounded-full object-cover ring-2 ring-white/20"
                      />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-coral text-xs font-bold text-white">
                        {(user.displayName ?? user.email ?? "U").charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="truncate text-sm font-medium text-white/70">
                      {user.displayName ?? user.email}
                    </span>
                  </div>
                  <Link
                    href="/user-portal"
                    onClick={() => setMenuOpen(false)}
                    className="border-b border-white/10 py-3.5 text-base font-bold tracking-tight text-white/95 transition-colors hover:text-coral active:bg-white/4"
                  >
                    Go to User Portal
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      setMenuOpen(false);
                      await handleSignOut();
                    }}
                    className="py-3.5 text-left text-base font-bold tracking-tight text-white/95 transition-colors hover:text-coral"
                  >
                    Sign Out
                  </button>
                </>
              ) : !loading ? (
                <Link
                  href="/login"
                  aria-current={
                    isNavActive(pathname, "/login") ? "page" : undefined
                  }
                  className={`py-3.5 text-base font-bold tracking-tight transition-colors ${
                    isNavActive(pathname, "/login")
                      ? "text-coral"
                      : "text-white/95 active:bg-white/4"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              ) : (
                <div
                  role="status"
                  aria-label="Checking sign-in"
                  className="flex items-center gap-3 py-3.5"
                >
                  <span
                    className="h-7 w-7 animate-pulse rounded-full bg-white/10"
                    aria-hidden
                  />
                  <span
                    className="h-3 w-24 animate-pulse rounded bg-white/10"
                    aria-hidden
                  />
                  <span className="sr-only">Checking sign-in…</span>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
