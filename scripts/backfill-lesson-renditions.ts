/**
 * One-off backfill: submit MediaConvert transcode jobs for existing lessons
 * that don't have one yet, so the quality picker works for the whole catalog,
 * not just new uploads.
 *
 * Usage:
 *   npm run backfill:renditions -- --dry-run   # print the plan, submit nothing
 *   npm run backfill:renditions                # submit for real (idempotent —
 *                                               # skips lessons that already have a transcodeJobId)
 *   npm run backfill:renditions -- --all       # force resubmission even for lessons already submitted
 *
 * Completion is picked up by the existing admin "Check status" button or the
 * /api/admin/transcode/poll cron — this script only submits jobs.
 *
 * Deliberately self-contained (own PrismaClient, own MediaConvert calls, no
 * `@/lib/*` imports) — same reason prisma/seed.ts rolls its own PrismaClient
 * instead of importing lib/prisma.ts: lib/server/mediaconvert.ts (like
 * lib/server/s3.ts) starts with `import "server-only"`, which throws
 * unconditionally outside Next's own build pipeline, so plain tsx/node
 * scripts can never import it.
 */
import { readFileSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { CreateJobCommand, DescribeEndpointsCommand, MediaConvertClient } from "@aws-sdk/client-mediaconvert";

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

const DRY_RUN = process.argv.includes("--dry-run");
const FORCE_ALL = process.argv.includes("--all");
const BATCH_SIZE = 5;
const BATCH_PAUSE_MS = 4000;

// Kept in sync by hand with lib/server/mediaconvert.ts's RENDITION_LADDER —
// this script can't import that module (see file header).
const RENDITION_LADDER = [
  { quality: "Q_2160P" as const, height: 2160, maxBitrateKbps: 12_000, audioKbps: 192 },
  { quality: "Q_1080P" as const, height: 1080, maxBitrateKbps: 5_000, audioKbps: 128 },
  { quality: "Q_720P" as const, height: 720, maxBitrateKbps: 3_000, audioKbps: 128 },
  { quality: "Q_480P" as const, height: 480, maxBitrateKbps: 1_500, audioKbps: 128 },
  { quality: "Q_360P" as const, height: 360, maxBitrateKbps: 800, audioKbps: 96 },
];
type RenditionQuality = (typeof RENDITION_LADDER)[number]["quality"];

const BUCKET = process.env.AWS_S3_BUCKET ?? "";
const roleArn = process.env.MEDIACONVERT_ROLE_ARN;

function nameModifierFor(quality: RenditionQuality): string {
  return `_${quality.replace("Q_", "").toLowerCase()}`;
}
function baseFilename(sourceKey: string): string {
  return (sourceKey.split("/").pop() ?? sourceKey).replace(/\.[^.]+$/, "");
}
function renditionsFolder(sourceKey: string): string {
  const parts = sourceKey.split("/");
  parts.pop();
  return `${parts.join("/")}/renditions`;
}
function plannedRenditionKeys(sourceKey: string, sourceHeightPx?: number | null) {
  const folder = renditionsFolder(sourceKey);
  const base = baseFilename(sourceKey);
  return RENDITION_LADDER.filter((rung) => !sourceHeightPx || rung.height <= sourceHeightPx).map((rung) => ({
    quality: rung.quality,
    key: `${folder}/${base}${nameModifierFor(rung.quality)}.mp4`,
  }));
}

let cachedClient: MediaConvertClient | null = null;
let cachedEndpoint: string | null = process.env.MEDIACONVERT_ENDPOINT ?? null;

async function getClient(): Promise<MediaConvertClient> {
  if (cachedClient) return cachedClient;
  const credentials =
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY }
      : undefined;
  if (!cachedEndpoint) {
    const bootstrap = new MediaConvertClient({ region: process.env.AWS_REGION, credentials });
    const { Endpoints } = await bootstrap.send(new DescribeEndpointsCommand({}));
    const endpoint = Endpoints?.[0]?.Url;
    if (!endpoint) throw new Error("MediaConvert DescribeEndpoints returned no endpoint.");
    cachedEndpoint = endpoint;
  }
  cachedClient = new MediaConvertClient({ region: process.env.AWS_REGION, credentials, endpoint: cachedEndpoint });
  return cachedClient;
}

async function submitTranscodeJob(
  lessonId: string,
  sourceKey: string,
  sourceHeightPx?: number | null,
): Promise<string> {
  if (!roleArn) throw new Error("MEDIACONVERT_ROLE_ARN is not configured.");
  const outputs = RENDITION_LADDER.filter((rung) => !sourceHeightPx || rung.height <= sourceHeightPx).map(
    (rung) => ({
      NameModifier: nameModifierFor(rung.quality),
      ContainerSettings: { Container: "MP4" as const },
      VideoDescription: {
        Height: rung.height,
        CodecSettings: {
          Codec: "H_264" as const,
          H264Settings: {
            RateControlMode: "QVBR" as const,
            MaxBitrate: rung.maxBitrateKbps * 1000,
            QvbrSettings: {
              QvbrQualityLevel: rung.height >= 1080 ? 9 : rung.height >= 720 ? 8 : rung.height >= 480 ? 7 : 6,
            },
          },
        },
      },
      AudioDescriptions: [
        {
          AudioSourceName: "Audio Selector 1",
          CodecSettings: {
            Codec: "AAC" as const,
            AacSettings: {
              Bitrate: rung.audioKbps * 1000,
              SampleRate: 48_000,
              CodingMode: "CODING_MODE_2_0" as const,
            },
          },
        },
      ],
    }),
  );

  const client = await getClient();
  const { Job } = await client.send(
    new CreateJobCommand({
      Role: roleArn,
      UserMetadata: { lessonId },
      Settings: {
        Inputs: [
          {
            FileInput: `s3://${BUCKET}/${sourceKey}`,
            AudioSelectors: { "Audio Selector 1": { DefaultSelection: "DEFAULT" } },
          },
        ],
        OutputGroups: [
          {
            Name: "Renditions",
            OutputGroupSettings: {
              Type: "FILE_GROUP_SETTINGS",
              FileGroupSettings: { Destination: `s3://${BUCKET}/${renditionsFolder(sourceKey)}/` },
            },
            Outputs: outputs,
          },
        ],
      },
    }),
  );
  if (!Job?.Id) throw new Error("MediaConvert CreateJob returned no job id.");
  return Job.Id;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const lessons = await prisma.lesson.findMany({
    where: FORCE_ALL ? {} : { transcodeJobId: null },
    select: { id: true, videoId: true, videoKey: true, sourceHeightPx: true },
    orderBy: { id: "asc" },
  });

  console.log(`Found ${lessons.length} lesson(s) to ${DRY_RUN ? "plan for" : "submit"}.`);
  if (DRY_RUN) {
    lessons.forEach((l) => console.log(`  - ${l.id} (video ${l.videoId}): ${l.videoKey}`));
    await prisma.$disconnect();
    return;
  }

  let submitted = 0;
  let failed = 0;

  for (let i = 0; i < lessons.length; i += BATCH_SIZE) {
    const batch = lessons.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (lesson) => {
        try {
          const jobId = await submitTranscodeJob(lesson.id, lesson.videoKey, lesson.sourceHeightPx);
          const planned = plannedRenditionKeys(lesson.videoKey, lesson.sourceHeightPx);
          await prisma.$transaction([
            prisma.lesson.update({
              where: { id: lesson.id },
              data: { transcodeStatus: "PROCESSING", transcodeJobId: jobId, transcodeError: null },
            }),
            ...planned.map((p) =>
              prisma.lessonRendition.upsert({
                where: { lessonId_quality: { lessonId: lesson.id, quality: p.quality } },
                create: { lessonId: lesson.id, quality: p.quality, videoKey: p.key, status: "PROCESSING" },
                update: { videoKey: p.key, status: "PROCESSING" },
              }),
            ),
          ]);
          console.log(`  ✓ ${lesson.id} → job ${jobId}`);
          submitted++;
        } catch (err) {
          console.error(`  ✗ ${lesson.id}:`, err instanceof Error ? err.message : err);
          await prisma.lesson
            .update({
              where: { id: lesson.id },
              data: { transcodeStatus: "FAILED", transcodeError: err instanceof Error ? err.message : String(err) },
            })
            .catch(() => {});
          failed++;
        }
      }),
    );
    if (i + BATCH_SIZE < lessons.length) await sleep(BATCH_PAUSE_MS);
  }

  console.log(`Done. Submitted ${submitted}, failed ${failed}.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
