-- AlterTable
ALTER TABLE "Podcast" ADD COLUMN IF NOT EXISTS "biographyParagraphs" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE IF NOT EXISTS "PodcastNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "podcastId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PodcastNote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PodcastNote_userId_podcastId_key" ON "PodcastNote"("userId", "podcastId");
CREATE INDEX IF NOT EXISTS "PodcastNote_userId_idx" ON "PodcastNote"("userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PodcastNote_userId_fkey'
  ) THEN
    ALTER TABLE "PodcastNote" ADD CONSTRAINT "PodcastNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PodcastNote_podcastId_fkey'
  ) THEN
    ALTER TABLE "PodcastNote" ADD CONSTRAINT "PodcastNote_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
