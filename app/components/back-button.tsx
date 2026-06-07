"use client";

import { useRouter } from "next/navigation";

export function BackButton({
  label = "Back",
  fallbackHref = "/",
  className = "",
}: {
  label?: string;
  /** Where to go when there is no history to go back to. */
  fallbackHref?: string;
  className?: string;
}) {
  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  };

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label={label}
      className={`inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/90 transition-colors hover:border-white/35 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral ${className}`}
    >
      <span className="text-lg leading-none">‹</span>
      {label}
    </button>
  );
}
