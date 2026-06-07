import "server-only";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucket = process.env.AWS_S3_BUCKET;

if (!region || !accessKeyId || !secretAccessKey || !bucket) {
  console.warn(
    "[s3] Missing AWS env vars. Set AWS_REGION, AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY in .env.local.",
  );
}

export const BUCKET = bucket ?? "";
export const REGION = region ?? "";

export const s3Client = new S3Client({
  region: region ?? "us-east-1",
  credentials:
    accessKeyId && secretAccessKey
      ? { accessKeyId, secretAccessKey }
      : undefined,
  // Disable default checksum headers in presigned URLs so browser PUTs don't
  // fail CORS preflight on x-amz-sdk-checksum-algorithm / x-amz-checksum-*.
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

export const PREFIX = "playbookofburma";

function sanitizeFilename(name: string): string {
  return name
    .replace(/[\\/]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9._-]/g, "")
    .slice(0, 180) || "file";
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function keyForVideo(filename: string): string {
  return `${PREFIX}/videos/${randomId()}/${sanitizeFilename(filename)}`;
}

export function keyForThumbnail(filename: string): string {
  return `${PREFIX}/thumbnails/${randomId()}/${sanitizeFilename(filename)}`;
}

export function keyForTrailer(filename: string): string {
  return `${PREFIX}/trailers/${randomId()}/${sanitizeFilename(filename)}`;
}

export function keyForInstructorPhoto(filename: string): string {
  return `${PREFIX}/instructors/${randomId()}/${sanitizeFilename(filename)}`;
}

export function keyForSubmissionScreenshot(filename: string): string {
  return `${PREFIX}/submissions/${randomId()}/${sanitizeFilename(filename)}`;
}

export function keyForAudio(filename: string): string {
  return `${PREFIX}/podcasts/${randomId()}/${sanitizeFilename(filename)}`;
}

export function keyForGuidebook(filename: string): string {
  return `${PREFIX}/guidebooks/${randomId()}/${sanitizeFilename(filename)}`;
}

export type UploadKind =
  | "video"
  | "thumbnail"
  | "trailer"
  | "instructor"
  | "submission"
  | "audio"
  | "guidebook";

export function keyFor(kind: UploadKind, filename: string): string {
  if (kind === "video") return keyForVideo(filename);
  if (kind === "trailer") return keyForTrailer(filename);
  if (kind === "instructor") return keyForInstructorPhoto(filename);
  if (kind === "submission") return keyForSubmissionScreenshot(filename);
  if (kind === "audio") return keyForAudio(filename);
  if (kind === "guidebook") return keyForGuidebook(filename);
  return keyForThumbnail(filename);
}

export function isAllowedKey(key: string): boolean {
  return typeof key === "string" && key.startsWith(`${PREFIX}/`);
}

export const PRESIGN_TTL = {
  image: 4 * 60 * 60,
  video: 6 * 60 * 60,
} as const;

export async function presignGetUrl(key: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(
    s3Client,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn },
  );
}
