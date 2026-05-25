import { NextResponse } from "next/server";
import { AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import { getSession } from "@/lib/server/auth-helpers";
import { BUCKET, isAllowedKey, s3Client } from "@/lib/server/s3";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { key, uploadId } = (await req.json()) as {
    key?: string;
    uploadId?: string;
  };

  if (!key || !uploadId || !isAllowedKey(key)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  await s3Client.send(
    new AbortMultipartUploadCommand({ Bucket: BUCKET, Key: key, UploadId: uploadId }),
  );

  return new NextResponse(null, { status: 204 });
}
