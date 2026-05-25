import { NextResponse } from "next/server";
import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3";
import { getSession } from "@/lib/server/auth-helpers";
import { BUCKET, keyFor, s3Client, type UploadKind } from "@/lib/server/s3";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { filename, contentType, kind } = (await req.json()) as {
    filename?: string;
    contentType?: string;
    kind?: UploadKind;
  };

  if (!filename) {
    return NextResponse.json({ error: "Missing filename" }, { status: 400 });
  }

  const key = keyFor(kind ?? "video", filename);
  const out = await s3Client.send(
    new CreateMultipartUploadCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    }),
  );

  if (!out.UploadId) {
    return NextResponse.json({ error: "S3 did not return UploadId" }, { status: 500 });
  }

  return NextResponse.json({ uploadId: out.UploadId, key });
}
