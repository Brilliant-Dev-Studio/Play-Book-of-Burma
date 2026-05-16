"use client";

import Image from "next/image";
import logo from "@/app/assets/logo.png";

export function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black">
      {/* Radial coral glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(236,113,71,0.08),transparent_70%)]"
        aria-hidden
      />

      <div className="relative flex flex-col items-center gap-8">
        {/* Logo */}
        <Image
          src={logo}
          alt="Playbook of Burma"
          className="h-12 w-auto opacity-90"
          priority
        />

        {/* Spinner */}
        <div className="relative h-10 w-10">
          {/* Track */}
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          {/* Coral arc */}
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-coral" />
        </div>

        {/* Label */}
        <p className="font-[family-name:var(--font-rwst-stack)] text-xs font-semibold tracking-[0.25em] text-white/40 uppercase">
          Please wait
        </p>
      </div>
    </div>
  );
}
