import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getJobStatus } from "@/lib/server/mediaconvert";

/**
 * Vercel Cron hits this on a schedule (see vercel.json) to pick up MediaConvert
 * jobs that finished since the last tick — there's no inbound-webhook/event
 * infra in this app, and nobody watches a lesson *during* transcoding, so a
 * few minutes of poll lag is invisible. Also safe to hit manually/ad hoc.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const processing = await prisma.lesson.findMany({
    where: { transcodeStatus: "PROCESSING", transcodeJobId: { not: null } },
    select: { id: true, videoId: true, transcodeJobId: true },
  });

  let ready = 0;
  let failed = 0;
  let stillProcessing = 0;
  const errors: string[] = [];

  for (const lesson of processing) {
    try {
      const job = await getJobStatus(lesson.transcodeJobId!);
      if (job.status === "COMPLETE") {
        await prisma.$transaction([
          prisma.lesson.update({ where: { id: lesson.id }, data: { transcodeStatus: "READY" } }),
          prisma.lessonRendition.updateMany({ where: { lessonId: lesson.id }, data: { status: "READY" } }),
        ]);
        ready++;
      } else if (job.status === "ERROR" || job.status === "CANCELED") {
        await prisma.lesson.update({
          where: { id: lesson.id },
          data: { transcodeStatus: "FAILED", transcodeError: job.errorMessage ?? job.status },
        });
        failed++;
      } else {
        stillProcessing++;
      }
    } catch (err) {
      errors.push(`${lesson.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({ checked: processing.length, ready, failed, stillProcessing, errors });
}
