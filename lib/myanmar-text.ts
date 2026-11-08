/** Split API prose into display paragraphs (newline or Burmese/Latin sentence end). */
export function splitMyanmarParagraphs(text: string | undefined | null) {
  if (!text) return [];
  return text
    .split(/\n\s*\n|(?<=[။.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}
