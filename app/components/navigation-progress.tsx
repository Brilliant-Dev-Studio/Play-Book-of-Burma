"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";

function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [width, setWidth] = useState(0);
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");

  const prevKey = useRef(pathname + searchParams.toString());
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimers() {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    if (doneTimer.current) { clearTimeout(doneTimer.current); doneTimer.current = null; }
  }

  function start() {
    clearTimers();
    setPhase("loading");
    setWidth(0);

    // Quickly to 20%, then crawl toward 90%
    let w = 0;
    tickRef.current = setInterval(() => {
      w = w < 20 ? w + 4 : w < 60 ? w + 1.5 : w < 85 ? w + 0.4 : w;
      if (w >= 85) { clearInterval(tickRef.current!); tickRef.current = null; }
      setWidth(w);
    }, 80);
  }

  function finish() {
    clearTimers();
    setWidth(100);
    setPhase("done");
    doneTimer.current = setTimeout(() => {
      setPhase("idle");
      setWidth(0);
    }, 500);
  }

  // Detect navigation start via anchor clicks
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element).closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      try {
        const next = new URL(anchor.href, window.location.href);
        if (next.origin !== window.location.origin) return;
        if (
          next.pathname === window.location.pathname &&
          next.search === window.location.search
        ) return;
        start();
      } catch {
        // invalid URL, skip
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Detect navigation completion
  useEffect(() => {
    const key = pathname + searchParams.toString();
    if (prevKey.current !== key) {
      prevKey.current = key;
      if (phase === "loading") finish();
    }
  });

  // Cleanup on unmount
  useEffect(() => () => clearTimers(), []);

  if (phase === "idle") return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: `${width}%`,
        height: "2px",
        zIndex: 99999,
        pointerEvents: "none",
        background: "var(--color-coral, #ec7147)",
        boxShadow: "0 0 8px 1px color-mix(in srgb, var(--color-coral, #ec7147) 60%, transparent)",
        transition:
          phase === "done"
            ? "width 200ms ease-out, opacity 300ms ease-in 200ms"
            : "width 80ms linear",
        opacity: phase === "done" ? 0 : 1,
      }}
    />
  );
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  );
}
