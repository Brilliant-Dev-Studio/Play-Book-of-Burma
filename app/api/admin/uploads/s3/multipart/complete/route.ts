import { NextResponse } from "next/server";
import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { getSession } from "@/lib/server/auth-helpers";
import { BUCKET, isAllowedKey, s3Client } from "@/lib/server/s3";

type ClientPart = { ETag?: string; PartNumber?: number };

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { key, uploadId, parts } = (await req.json()) as {
    key?: string;
    uploadId?: string;
    parts?: ClientPart[];
  };

  if (!key || !uploadId || !Array.isArray(parts) || parts.length === 0 || !isAllowedKey(key)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const out = await s3Client.send(
    new CompleteMultipartUploadCommand({
      Bucket: BUCKET,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map((p) => ({ ETag: p.ETag, PartNumber: p.PartNumber })),
      },
    }),
  );

  return NextResponse.json({ location: out.Location ?? "", key });
}
