"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="flex min-h-0 flex-1 items-center justify-center bg-black px-4 py-12 text-white sm:px-6">
      <div className="mx-auto w-full max-w-md text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-coral/80">
          Error 404
        </p>

        <h1 className="mt-3 font-[family-name:var(--font-rwst-stack)] text-6xl font-bold leading-none tracking-tight text-coral sm:text-7xl">
          404
        </h1>

        <div className="mx-auto mt-4 h-0.5 w-12 rounded-full bg-coral" aria-hidden />

        <h2 className="mt-5 text-lg font-bold tracking-tight text-white sm:text-xl">
          This page isn&apos;t in the playbook
        </h2>

        <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-white/65 sm:text-sm">
          The page might have moved or never existed. Let&apos;s get you back.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md bg-coral px-4 py-2 text-xs font-bold text-black transition-colors hover:bg-coral/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral sm:text-sm"
          >
            ← Go back
          </button>
          <Link
            href="/library"
            className="rounded-md border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/85 transition-colors hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral sm:text-sm"
          >
            Library
          </Link>
        </div>
      </div>
    </main>
  );
}
