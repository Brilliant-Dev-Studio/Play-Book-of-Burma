"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

export function OtpInput({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit || " ";
    onChange(next.join("").trimEnd());
    if (digit && index < 5) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index].trim() === "" && index > 0) {
        const next = [...digits];
        next[index - 1] = " ";
        onChange(next.join("").trimEnd());
        inputs.current[index - 1]?.focus();
        e.preventDefault();
      } else {
        const next = [...digits];
        next[index] = " ";
        onChange(next.join("").trimEnd());
        e.preventDefault();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputs.current[index + 1]?.focus();
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    inputs.current[focusIdx]?.focus();
  }

  const borderBase = hasError
    ? "border-red-500/60 focus:border-red-400 focus:ring-red-400/20"
    : "border-white/[0.12] focus:border-coral/60 focus:ring-coral/20";

  return (
    <div className="flex justify-center gap-2 sm:gap-3" role="group" aria-label="One-time code">
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i].trim()}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          aria-label={`Digit ${i + 1}`}
          className={`h-14 w-11 rounded-xl border bg-zinc-950/55 text-center text-xl font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none ring-2 ring-transparent transition-[border-color,box-shadow,ring-color] duration-200 focus:ring-2 sm:h-14 sm:w-12 ${borderBase}`}
        />
      ))}
    </div>
  );
}
