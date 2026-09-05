-- CreateTable
CREATE TABLE "PodcastChapter" (
    "id" TEXT NOT NULL,
    "podcastId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "label" TEXT NOT NULL,
    "seconds" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PodcastChapter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PodcastChapter_podcastId_idx" ON "PodcastChapter"("podcastId");

-- AddForeignKey
ALTER TABLE "PodcastChapter" ADD CONSTRAINT "PodcastChapter_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;
