"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 bg-black px-6 py-24 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-coral/80">
        Error
      </p>
      <h1 className="font-[family-name:var(--font-rwst-stack)] text-2xl font-bold tracking-tight text-white">
        Something went wrong
      </h1>
      <p className="max-w-md text-sm text-white/60">
        An unexpected error occurred. Try again, or head back to the homepage.
      </p>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-coral px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-coral/90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-white/15 bg-white/[0.04] px-5 py-2 text-sm font-semibold text-white/85 transition-colors hover:bg-white/[0.08]"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
