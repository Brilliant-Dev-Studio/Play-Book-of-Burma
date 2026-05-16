"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithGoogle } from "@/lib/auth";
import { FullScreenLoader } from "@/app/components/full-screen-loader";
import googleGLogo from "@/app/assets/Google__G__logo.svg.webp";

export function GoogleSignInButton({ label }: { label: string }) {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  async function handleClick() {
    try {
      const navigated = await signInWithGoogle();
      // false means redirect was initiated — browser is leaving the page
      if (navigated) {
        setRedirecting(true);
        router.push("/user-portal");
      }
    } catch (err) {
      console.error("Google sign-in failed:", err);
    }
  }

  return (
    <>
      {redirecting && <FullScreenLoader />}
      <button
        type="button"
        onClick={handleClick}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/[0.12] bg-zinc-950/55 px-4 py-3 text-base font-medium leading-snug text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[border-color,box-shadow,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/[0.2] hover:bg-zinc-950/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral/50"
      >
        <Image
          src={googleGLogo}
          alt=""
          width={20}
          height={20}
          className="h-5 w-5 shrink-0 object-contain"
          aria-hidden
        />
        {label}
      </button>
    </>
  );
}
