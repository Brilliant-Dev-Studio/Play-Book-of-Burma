/**
 * Browser-side image optimisation, run before a file is uploaded to S3:
 * downscale to `maxDim` on the longest edge and re-encode as WebP.
 *
 * Images are served straight from presigned S3 URLs (not through next/image —
 * a presigned URL changes every request, so the optimizer could never cache it),
 * so whatever gets uploaded is exactly what every viewer downloads. Shrinking it
 * once here is the cheapest place to do it.
 *
 * Always resolves — falls back to the original file whenever conversion isn't
 * possible or wouldn't help, so callers never have to handle a failure.
 */

/** Formats left untouched: canvas can't keep GIF animation or SVG vector data. */
const SKIP_TYPES = new Set(["image/gif", "image/svg+xml"]);

export type WebpOptions = {
  /** Longest edge in px after resizing (never upscales). */
  maxDim?: number;
  /** WebP quality, 0–1. */
  quality?: number;
};

async function encode(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function imageToWebp(file: File, { maxDim = 1920, quality = 0.82 }: WebpOptions = {}): Promise<File> {
  if (typeof document === "undefined") return file;
  if (!file.type.startsWith("image/") || SKIP_TYPES.has(file.type)) return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();

  let blob = await encode(canvas, "image/webp", quality);
  let ext = "webp";
  // Browsers without a WebP encoder (older Safari) silently return PNG instead —
  // a PNG of a photo is usually *bigger* than the source, so use JPEG there.
  // (PNG source keeps its original: JPEG has no alpha, transparency would turn black.)
  if (!blob || blob.type !== "image/webp") {
    if (file.type === "image/png") return file;
    blob = await encode(canvas, "image/jpeg", quality);
    ext = "jpg";
  }
  if (!blob) return file;

  // Already small and not resized (e.g. an optimised WebP/JPEG) — keep the original.
  if (scale === 1 && blob.size >= file.size) return file;

  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}.${ext}`, { type: blob.type, lastModified: Date.now() });
}
