"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "@/app/assets/logo.png";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/membership", label: "Membership" },
  { href: "/library", label: "Library" },
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Sign up" },
] as const;

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
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
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isFixed, setIsFixed] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const update = () => setHeaderHeight(el.getBoundingClientRect().height);
    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY;
      const scrolledPast = y > 50;

      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
          setIsFixed(scrolledPast);

          if (!scrolledPast) {
            setIsHidden(false);
          } else {
            const goingDown = y > lastY;
            // Hide on scroll-down, show on scroll-up
            setIsHidden(goingDown);
          }

          lastY = y;
          ticking = false;
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isHidden) setMenuOpen(false);
  }, [isHidden]);

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

  return (
    <>
      {isFixed ? <div style={{ height: headerHeight }} aria-hidden /> : null}
      <header
        ref={headerRef}
        className={[
          "bg-black transition-transform duration-200 ease-out will-change-transform",
          isFixed
            ? "fixed inset-x-0 top-0 z-50"
            : menuOpen
              ? "relative z-50"
              : "relative",
          isFixed && isHidden ? "-translate-y-full" : "translate-y-0",
        ].join(" ")}
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
          <div className="flex min-h-[4.25rem] w-full items-center justify-between gap-4 sm:min-h-[5.25rem] sm:gap-6 lg:min-h-[5.75rem]">
            <Link
              href="/"
              className="relative flex min-w-0 shrink-0 items-center outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/80"
              onClick={() => setMenuOpen(false)}
            >
              <Image
                src={logo}
                alt="Story of Burma"
                priority
                className="h-12 w-auto sm:h-13 md:h-13"
                sizes="(max-width: 768px) 240px, 320px"
              />
            </Link>

            <nav
              aria-label="Main"
              className="hidden items-center justify-end gap-x-8 md:flex"
            >
              {navItems.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`text-[15px] font-bold tracking-tight transition-colors ${
                      active
                        ? "text-coral"
                        : "text-white/95 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] text-white transition-colors hover:bg-white/[0.1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral md:hidden"
              aria-expanded={menuOpen}
              aria-controls="site-header-mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <MenuToggleIcon open={menuOpen} />
            </button>
          </div>

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
              {navItems.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`border-b border-white/10 py-3.5 text-base font-bold tracking-tight transition-colors last:border-b-0 ${
                      active
                        ? "text-coral"
                        : "text-white/95 active:bg-white/[0.04]"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
