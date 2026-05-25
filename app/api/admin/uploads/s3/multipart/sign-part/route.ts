import { NextResponse } from "next/server";
import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSession } from "@/lib/server/auth-helpers";
import { BUCKET, isAllowedKey, s3Client } from "@/lib/server/s3";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { key, uploadId, partNumber } = (await req.json()) as {
    key?: string;
    uploadId?: string;
    partNumber?: number;
  };

  if (!key || !uploadId || !partNumber || !isAllowedKey(key)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const url = await getSignedUrl(
    s3Client,
    new UploadPartCommand({
      Bucket: BUCKET,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    }),
    { expiresIn: 900 },
  );

  return NextResponse.json({ url, expires: 900 });
}
