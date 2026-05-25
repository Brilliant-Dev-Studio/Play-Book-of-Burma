import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BUCKET, keyForSubmissionScreenshot, s3Client } from "@/lib/server/s3";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export async function POST(req: Request) {
  let body: { filename?: string; contentType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const { filename, contentType } = body;

  if (!filename || !contentType) {
    return NextResponse.json({ error: "Missing filename or contentType." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
  }

  const key = keyForSubmissionScreenshot(filename);
  const url = await getSignedUrl(
    s3Client,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 900 },
  );

  return NextResponse.json({
    method: "PUT",
    url,
    key,
    headers: { "Content-Type": contentType },
  });
}
