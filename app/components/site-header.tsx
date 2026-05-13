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
] as const;

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isFixed, setIsFixed] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

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

  return (
    <>
      {isFixed ? <div style={{ height: headerHeight }} aria-hidden /> : null}
      <header
        ref={headerRef}
        className={[
          "bg-black transition-transform duration-200 ease-out will-change-transform",
          isFixed ? "fixed inset-x-0 top-0 z-50" : "relative",
          isFixed && isHidden ? "-translate-y-full" : "translate-y-0",
        ].join(" ")}
      >
        <div className="mx-auto flex w-full min-h-[4.25rem] max-w-[95%] items-center justify-between gap-6 px-4 py-2.5 sm:min-h-[5.25rem] sm:px-6 sm:py-3 lg:min-h-[5.75rem] lg:px-8">
          <Link
            href="/"
            className="relative flex shrink-0 items-center outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/80"
          >
            <Image
              src={logo}
              alt="Story of Burma"
              priority
              className="h-12 w-auto  sm:h-13 md:h-13"
              sizes="(max-width: 768px) 240px, 320px"
            />
          </Link>
          <nav
            aria-label="Main"
            className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 sm:gap-x-8"
          >
            {navItems.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`text-sm font-medium tracking-tight transition-colors sm:text-[15px] ${
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
        </div>
      </header>
    </>
  );
}
