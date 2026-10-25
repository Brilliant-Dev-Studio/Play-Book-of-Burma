/**
 * Human duration for cards / listings: hours + minutes only (no seconds).
 * Uses actual total seconds (video duration).
 */
export function formatDurationHrsMins(totalSeconds: number): string {
  const sec = Math.max(0, Math.round(totalSeconds));
  if (sec <= 0) return "";

  const totalMins = Math.max(1, Math.floor(sec / 60));
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} ${h === 1 ? "hour" : "hours"}`);
  if (m > 0) parts.push(`${m} ${m === 1 ? "minute" : "minutes"}`);
  return parts.join(" ") || "1 minute";
}

/** Prefer seconds; otherwise strip any trailing seconds from a stored label. */
export function displayDurationLabel(
  label: string,
  durationSeconds?: number | null,
): string {
  if (durationSeconds != null && durationSeconds > 0) {
    return formatDurationHrsMins(durationSeconds);
  }
  const cleaned = label.replace(/\s+\d+\s+seconds?\b/gi, "").trim();
  return cleaned || label;
}
