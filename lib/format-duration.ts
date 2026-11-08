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
/** Compact clock for players (1:05:04 or 24:30) — avoids wordy labels wrapping in tight UI. */
export function formatPlayerClock(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const sec = Math.floor(totalSeconds);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

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
