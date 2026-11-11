import "server-only";
import {
  CreateJobCommand,
  DescribeEndpointsCommand,
  GetJobCommand,
  MediaConvertClient,
} from "@aws-sdk/client-mediaconvert";
import { BUCKET } from "./s3";

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const roleArn = process.env.MEDIACONVERT_ROLE_ARN;

if (!roleArn) {
  console.warn(
    "[mediaconvert] Missing MEDIACONVERT_ROLE_ARN. Set it to the MediaConvert job-execution role ARN in .env.local.",
  );
}

/**
 * Plain progressive MP4 renditions, not HLS/DASH — the whole playback
 * pipeline (website + mobile) presigns one S3 object per request, and HLS
 * would need segment-level access control instead. One job → one File Group
 * output group → one MP4 per rung below, each presignable exactly like the
 * source `videoKey` already is.
 */
export const RENDITION_LADDER = [
  // Top two rungs double as the "original/native quality" option — a real
  // MediaConvert output (always faststart) instead of serving the raw
  // upload directly, which can hang the browser indefinitely on seek if the
  // source file isn't faststart-optimized (common for camera/export files).
  { quality: "Q_2160P" as const, height: 2160, maxBitrateKbps: 12_000, audioKbps: 192 },
  { quality: "Q_1080P" as const, height: 1080, maxBitrateKbps: 5_000, audioKbps: 128 },
  { quality: "Q_720P" as const, height: 720, maxBitrateKbps: 3_000, audioKbps: 128 },
  { quality: "Q_480P" as const, height: 480, maxBitrateKbps: 1_500, audioKbps: 128 },
  { quality: "Q_360P" as const, height: 360, maxBitrateKbps: 800, audioKbps: 96 },
];

export type RenditionQuality = (typeof RENDITION_LADDER)[number]["quality"];

export const RENDITION_HEIGHT: Record<RenditionQuality, number> = Object.fromEntries(
  RENDITION_LADDER.map((rung) => [rung.quality, rung.height]),
) as Record<RenditionQuality, number>;

function nameModifierFor(quality: RenditionQuality): string {
  return `_${quality.replace("Q_", "").toLowerCase()}`; // _720p / _480p / _360p
}

function baseFilename(sourceKey: string): string {
  const last = sourceKey.split("/").pop() ?? sourceKey;
  return last.replace(/\.[^.]+$/, "");
}

function renditionsFolder(sourceKey: string): string {
  // Source lives at `<PREFIX>/videos/<id>/<filename>` — renditions sit
  // alongside it in a `renditions/` subfolder of that same `<id>` directory.
  const parts = sourceKey.split("/");
  parts.pop(); // drop filename
  return `${parts.join("/")}/renditions`;
}

/**
 * Output keys are fully deterministic before the job even runs (MediaConvert
 * names each output `<base filename><NameModifier>.<ext>`), so callers never
 * need to introspect a completed job to learn filenames — they can be
 * computed, persisted, and presigned ahead of the job actually finishing.
 */
export function plannedRenditionKeys(
  sourceKey: string,
  sourceHeightPx?: number | null,
): { quality: RenditionQuality; key: string }[] {
  const folder = renditionsFolder(sourceKey);
  const base = baseFilename(sourceKey);
  return RENDITION_LADDER.filter((rung) => !sourceHeightPx || rung.height <= sourceHeightPx).map(
    (rung) => ({
      quality: rung.quality,
      key: `${folder}/${base}${nameModifierFor(rung.quality)}.mp4`,
    }),
  );
}

let cachedClient: MediaConvertClient | null = null;
let cachedEndpoint: string | null = process.env.MEDIACONVERT_ENDPOINT ?? null;

async function getClient(): Promise<MediaConvertClient> {
  if (cachedClient) return cachedClient;

  const credentials =
    accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined;

  if (!cachedEndpoint) {
    const bootstrap = new MediaConvertClient({ region, credentials });
    const { Endpoints } = await bootstrap.send(new DescribeEndpointsCommand({}));
    const endpoint = Endpoints?.[0]?.Url;
    if (!endpoint) throw new Error("MediaConvert DescribeEndpoints returned no endpoint.");
    cachedEndpoint = endpoint;
    // Account+region-specific and effectively never changes — log once so it
    // can be pinned via MEDIACONVERT_ENDPOINT and skip this call entirely.
    console.log(`[mediaconvert] Discovered endpoint ${endpoint} — consider setting MEDIACONVERT_ENDPOINT.`);
  }

  cachedClient = new MediaConvertClient({ region, credentials, endpoint: cachedEndpoint });
  return cachedClient;
}

export async function submitTranscodeJob(
  lessonId: string,
  sourceKey: string,
  sourceHeightPx?: number | null,
): Promise<string> {
  if (!roleArn) throw new Error("MEDIACONVERT_ROLE_ARN is not configured.");

  const outputs = RENDITION_LADDER.filter(
    (rung) => !sourceHeightPx || rung.height <= sourceHeightPx,
  ).map((rung) => ({
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
  }));

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
              FileGroupSettings: {
                Destination: `s3://${BUCKET}/${renditionsFolder(sourceKey)}/`,
              },
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

export type JobStatus = {
  status: "SUBMITTED" | "PROGRESSING" | "COMPLETE" | "ERROR" | "CANCELED";
  errorMessage?: string;
};

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const client = await getClient();
  const { Job } = await client.send(new GetJobCommand({ Id: jobId }));
  return {
    status: (Job?.Status as JobStatus["status"]) ?? "SUBMITTED",
    errorMessage: Job?.ErrorMessage,
  };
}
