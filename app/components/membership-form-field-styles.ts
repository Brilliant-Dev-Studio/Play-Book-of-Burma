/** Shared with membership payment form and auth (login / signup). */

export const membershipFormFieldClass =
  "w-full rounded-xl border border-white/[0.12] bg-zinc-950/55 px-4 py-3 text-base leading-snug text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition-[border-color,box-shadow,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] placeholder:text-white/38 hover:border-white/[0.2] hover:bg-zinc-950/70 focus:border-coral/50 focus:bg-zinc-950/80 focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_0_3px_rgba(236,113,71,0.2)]";

export const membershipFormFieldLabelClass =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50";

export const membershipFormTextareaClass = `${membershipFormFieldClass} min-h-[6rem] resize-y py-3 leading-relaxed`;

export const membershipFormFileClass = `${membershipFormFieldClass} py-2.5 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-coral file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black file:shadow-sm file:transition-opacity file:hover:opacity-90 file:focus-visible:outline file:focus-visible:outline-2 file:focus-visible:outline-offset-2 file:focus-visible:outline-white/80`;
