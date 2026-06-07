-- CreateTable
CREATE TABLE "PlaybookAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaybookAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlaybookAchievement_userId_achievedAt_idx" ON "PlaybookAchievement"("userId", "achievedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlaybookAchievement_userId_videoId_key" ON "PlaybookAchievement"("userId", "videoId");

-- AddForeignKey
ALTER TABLE "PlaybookAchievement" ADD CONSTRAINT "PlaybookAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaybookAchievement" ADD CONSTRAINT "PlaybookAchievement_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
