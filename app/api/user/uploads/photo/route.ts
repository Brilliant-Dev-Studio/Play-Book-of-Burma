import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSession } from "@/lib/server/auth-helpers";
import { BUCKET, keyForInstructorPhoto, presignGetUrl, s3Client, PRESIGN_TTL } from "@/lib/server/s3";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
  }

  const { filename, contentType, size } = (await req.json()) as {
    filename?: string;
    contentType?: string;
    size?: number;
  };

  if (!filename || !contentType) {
    return NextResponse.json({ error: "Missing filename or contentType." }, { status: 400 });
  }
  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
  }
  if (size && size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 10 MB)." }, { status: 400 });
  }

  const key = keyForInstructorPhoto(filename);

  const putUrl = await getSignedUrl(
    s3Client,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 900 },
  );

  const getUrl = await presignGetUrl(key, PRESIGN_TTL.image);

  return NextResponse.json({ putUrl, getUrl, key });
}
