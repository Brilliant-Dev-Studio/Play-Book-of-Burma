-- CreateTable
CREATE TABLE "PodcastProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "podcastId" TEXT NOT NULL,
    "currentSeconds" INTEGER NOT NULL DEFAULT 0,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "lastListenedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PodcastProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PodcastProgress_userId_lastListenedAt_idx" ON "PodcastProgress"("userId", "lastListenedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PodcastProgress_userId_podcastId_key" ON "PodcastProgress"("userId", "podcastId");

-- AddForeignKey
ALTER TABLE "PodcastProgress" ADD CONSTRAINT "PodcastProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PodcastProgress" ADD CONSTRAINT "PodcastProgress_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;
