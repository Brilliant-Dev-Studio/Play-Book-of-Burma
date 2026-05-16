import type { ReactNode } from "react";
import Image from "next/image";
import googleGLogo from "@/app/assets/Google__G__logo.svg.webp";
import {
  membershipFormFieldClass,
  membershipFormFieldErrorClass,
  membershipFormFieldLabelClass,
} from "@/app/components/membership-form-field-styles";

export function AuthPageShell({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden bg-black px-4 py-10 font-sans text-zinc-100 sm:py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,rgba(236,113,71,0.12),transparent_52%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.04),transparent_45%)]" aria-hidden />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-b from-zinc-900/90 via-zinc-950/88 to-zinc-950/95 px-6 py-7 shadow-[0_24px_80px_rgba(0,0,0,0.72),0_0_64px_-24px_rgba(236,113,71,0.14),inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-white/[0.05] backdrop-blur-md sm:px-8 sm:py-8">
        <div
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/22 to-transparent opacity-90 sm:inset-x-8"
          aria-hidden
        />

        <h1 className="relative text-center font-[family-name:var(--font-rwst-stack)] text-xl font-bold tracking-tight text-white sm:text-2xl">
          {heading}
        </h1>
        <div
          className="relative mx-auto mt-3 h-[3px] w-11 rounded-full bg-coral shadow-[0_0_18px_rgba(236,113,71,0.45)]"
          aria-hidden
        />
        <div className="relative mt-6 sm:mt-7">{children}</div>
      </div>
    </main>
  );
}

export function AuthFieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className={membershipFormFieldLabelClass}>
      {children}
    </label>
  );
}

export const authInputClass = membershipFormFieldClass;
export const authInputErrorClass = membershipFormFieldErrorClass;

/** Primary CTA — matches membership payment submit */
export const authPrimaryButtonClass =
  "w-full rounded-xl bg-coral py-3 text-sm font-bold tracking-wide text-white shadow-[0_8px_28px_rgba(236,113,71,0.35)] transition-[transform,box-shadow,opacity] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(236,113,71,0.42)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral motion-reduce:hover:translate-y-0";

export function AuthOrDivider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <span className="h-px w-full bg-gradient-to-r from-transparent via-white/18 to-transparent" />
      </div>
      <div className="relative flex justify-center text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
        <span className="bg-gradient-to-b from-zinc-900/95 to-zinc-950 px-4 py-0.5">Or</span>
      </div>
    </div>
  );
}

export function AuthGoogleButton({ label }: { label: string }) {
  return (
    <button
      type="button"
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
  );
}
