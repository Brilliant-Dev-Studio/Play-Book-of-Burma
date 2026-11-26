/**
 * The platform's single play-button look: a translucent dark circle with a white
 * play (or pause) glyph, frosted over whatever artwork sits behind it.
 * Purely visual — wrap it in the button/link that handles the click.
 * Hover growth is driven by the nearest `group` ancestor (the card).
 */

const SIZES = {
  sm: { circle: "h-8 w-8", icon: "h-3.5 w-3.5" },
  md: { circle: "h-11 w-11 sm:h-12 sm:w-12", icon: "h-5 w-5 sm:h-[22px] sm:w-[22px]" },
  lg: { circle: "h-16 w-16 sm:h-18 sm:w-18 md:h-20 md:w-20", icon: "h-7 w-7 sm:h-8 sm:w-8" },
} as const;

/**
 * Cards: hidden until the card (nearest `group`) is hovered or keyboard-focused. Devices without
 * hover (phones/tablets) always show it, otherwise the button would never be visible there.
 */
const HOVER_REVEAL =
  "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 group-focus-visible:opacity-100 group-focus-visible:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 [@media(hover:none)]:opacity-100 [@media(hover:none)]:scale-100";

export function PlayCircle({
  size = "md",
  playing = false,
  revealOnHover = false,
  className = "",
}: {
  size?: keyof typeof SIZES;
  /** Show a pause glyph instead of play. */
  playing?: boolean;
  /** Only appear when the surrounding card is hovered/focused (desktop). */
  revealOnHover?: boolean;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-black/30 text-white shadow-[0_4px_18px_rgba(0,0,0,0.3)] ring-1 ring-white/15 backdrop-blur-[3px] transition-[transform,opacity] duration-300 ease-out ${
        revealOnHover ? HOVER_REVEAL : "group-hover:scale-110"
      } motion-reduce:transition-none ${s.circle} ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className={s.icon}>
        {playing ? (
          <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
        ) : (
          // Nudged right of centre so the triangle looks optically centred in the circle.
          <path d="M8.5 5.3v13.4a.8.8 0 0 0 1.2.7l10.6-6.7a.8.8 0 0 0 0-1.4L9.7 4.6a.8.8 0 0 0-1.2.7z" />
        )}
      </svg>
    </span>
  );
}
