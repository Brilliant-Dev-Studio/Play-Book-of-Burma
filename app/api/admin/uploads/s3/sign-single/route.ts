import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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

  if (!filename || !contentType) {
    return NextResponse.json({ error: "Missing filename or contentType" }, { status: 400 });
  }

  const key = keyFor(kind ?? "thumbnail", filename);
  const url = await getSignedUrl(
    s3Client,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 900 },
  );

  return NextResponse.json({
    method: "PUT",
    url,
    fields: {},
    headers: { "Content-Type": contentType },
    key,
  });
}
