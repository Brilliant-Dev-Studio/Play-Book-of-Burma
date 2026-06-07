-- CreateTable
CREATE TABLE "Podcast" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "audioKey" TEXT NOT NULL,
    "thumbnailKey" TEXT NOT NULL,
    "season" INTEGER NOT NULL DEFAULT 1,
    "episodeOrder" INTEGER NOT NULL DEFAULT 0,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "durationLabel" TEXT NOT NULL DEFAULT '',
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Podcast_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Podcast_season_episodeOrder_idx" ON "Podcast"("season", "episodeOrder");

-- CreateIndex
CREATE INDEX "Podcast_popular_idx" ON "Podcast"("popular");
