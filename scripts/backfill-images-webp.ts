/**
 * One-off backfill: convert existing S3 images (thumbnails, hero images,
 * instructor/user photos, skillset images, guidebook covers) to resized WebP,
 * so images uploaded before lib/image-to-webp.ts existed load as fast as new ones.
 *
 * Usage:
 *   npm run backfill:images-webp -- --dry-run   # download + convert in memory, report savings; writes nothing
 *   npm run backfill:images-webp                # upload .webp copies and repoint the DB keys
 *
 * Non-destructive: the original object is never deleted or overwritten — the
 * WebP goes to a sibling key (same folder, .webp extension) and only the DB
 * column is repointed, so a rollback is just pointing the keys back.
 * Idempotent: keys already ending in .webp are skipped, so re-running only
 * picks up what's left.
 *
 * Membership payment screenshots are deliberately left alone — they're payment
 * evidence and are only ever viewed by admins.
 *
 * Self-contained (own PrismaClient / S3Client, no `@/lib/*` imports) for the
 * same reason as backfill-lesson-renditions.ts: lib/server/* imports
 * "server-only", which throws outside Next's build pipeline.
 */
import { readFileSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

function loadEnvFile(filename: string) {
  try {
    const lines = readFileSync(join(process.cwd(), filename), "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // skip
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  }),
});

const BUCKET = process.env.AWS_S3_BUCKET ?? "";
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY }
      : undefined,
});

const DRY_RUN = process.argv.includes("--dry-run");
const QUALITY = 82;
const CONCURRENCY = 4;

/** Every DB column holding an image key, with the longest edge to keep (matches the upload-side limits). */
const FIELDS = [
  { model: "video", field: "thumbnailKey", maxDim: 1600 },
  { model: "video", field: "heroImageKey", maxDim: 2400 },
  { model: "video", field: "trailerThumbnailKey", maxDim: 1600 },
  { model: "video", field: "guidebookCoverKey", maxDim: 1600 },
  { model: "podcast", field: "thumbnailKey", maxDim: 1600 },
  { model: "instructor", field: "photoKey", maxDim: 1200 },
  { model: "skillsetItem", field: "imageKey", maxDim: 1600 },
  { model: "user", field: "photoKey", maxDim: 800 },
] as const;

type Field = (typeof FIELDS)[number];
// Loosely typed on purpose: one generic code path over several models.
type Delegate = {
  findMany(args: unknown): Promise<Record<string, string | null>[]>;
  updateMany(args: unknown): Promise<{ count: number }>;
};
const delegate = (model: Field["model"]) => (prisma as unknown as Record<string, Delegate>)[model];

const SKIP_EXT = /\.(webp|gif|svg)$/i;

function webpKeyFor(key: string): string {
  return /\.[^./]+$/.test(key) ? key.replace(/\.[^./]+$/, ".webp") : `${key}.webp`;
}

function fmt(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

async function download(key: string): Promise<Buffer> {
  const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  return Buffer.from(await res.Body!.transformToByteArray());
}

async function main() {
  if (!BUCKET) throw new Error("AWS_S3_BUCKET is not set.");

  // Collect unique keys → every (model, field) that references them. A key shared by
  // several columns (e.g. a hero and a thumbnail) keeps the largest maxDim among them.
  const uses = new Map<string, { refs: Field[]; maxDim: number }>();
  for (const f of FIELDS) {
    // No `not: null` filter — Prisma rejects it on required columns; empties are skipped below.
    const rows = await delegate(f.model).findMany({ select: { [f.field]: true } });
    for (const row of rows) {
      const key = row[f.field];
      if (!key || SKIP_EXT.test(key)) continue;
      const entry = uses.get(key) ?? { refs: [], maxDim: 0 };
      entry.refs.push(f);
      entry.maxDim = Math.max(entry.maxDim, f.maxDim);
      uses.set(key, entry);
    }
  }

  const keys = [...uses.keys()];
  console.log(`${DRY_RUN ? "[dry-run] " : ""}Found ${keys.length} image(s) to convert.\n`);

  let before = 0;
  let after = 0;
  let converted = 0;
  let skipped = 0;
  let failed = 0;

  async function processKey(key: string) {
    const { refs, maxDim } = uses.get(key)!;
    try {
      const original = await download(key);
      const webp = await sharp(original)
        .rotate() // honour EXIF orientation before metadata is stripped
        .resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toBuffer();

      if (webp.length >= original.length) {
        skipped++;
        console.log(`  – ${key}: WebP not smaller (${fmt(original.length)}), kept original`);
        return;
      }

      const newKey = webpKeyFor(key);
      if (!DRY_RUN) {
        await s3.send(
          new PutObjectCommand({ Bucket: BUCKET, Key: newKey, Body: webp, ContentType: "image/webp" }),
        );
        for (const f of refs) {
          await delegate(f.model).updateMany({ where: { [f.field]: key }, data: { [f.field]: newKey } });
        }
      }

      before += original.length;
      after += webp.length;
      converted++;
      const pct = Math.round((1 - webp.length / original.length) * 100);
      console.log(
        `  ✓ ${key}\n      ${fmt(original.length)} → ${fmt(webp.length)} (-${pct}%)  [${refs.map((r) => `${r.model}.${r.field}`).join(", ")}]`,
      );
    } catch (err) {
      failed++;
      console.log(`  ✗ ${key}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  for (let i = 0; i < keys.length; i += CONCURRENCY) {
    await Promise.all(keys.slice(i, i + CONCURRENCY).map(processKey));
  }

  console.log(
    `\n${DRY_RUN ? "[dry-run] Would convert" : "Converted"} ${converted}, skipped ${skipped}, failed ${failed}.` +
      (converted ? `\nTotal: ${fmt(before)} → ${fmt(after)} (-${Math.round((1 - after / before) * 100)}%)` : ""),
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
