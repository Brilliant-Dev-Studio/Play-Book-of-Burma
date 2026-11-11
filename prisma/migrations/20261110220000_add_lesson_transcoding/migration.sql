-- CreateEnum
DO $$
BEGIN
  CREATE TYPE "TranscodeStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$
BEGIN
  CREATE TYPE "RenditionQuality" AS ENUM ('Q_360P', 'Q_480P', 'Q_720P');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "transcodeStatus" "TranscodeStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "transcodeJobId" TEXT;
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "transcodeError" TEXT;
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "sourceHeightPx" INTEGER;

-- CreateTable
CREATE TABLE IF NOT EXISTS "LessonRendition" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "quality" "RenditionQuality" NOT NULL,
    "videoKey" TEXT NOT NULL,
    "status" "TranscodeStatus" NOT NULL DEFAULT 'PROCESSING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonRendition_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LessonRendition_lessonId_quality_key" ON "LessonRendition"("lessonId", "quality");
CREATE INDEX IF NOT EXISTS "LessonRendition_status_idx" ON "LessonRendition"("status");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'LessonRendition_lessonId_fkey'
  ) THEN
    ALTER TABLE "LessonRendition" ADD CONSTRAINT "LessonRendition_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
