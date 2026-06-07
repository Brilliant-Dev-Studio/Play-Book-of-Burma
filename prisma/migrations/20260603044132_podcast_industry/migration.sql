/*
  Warnings:

  - Added the required column `industryId` to the `Podcast` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Podcast" ADD COLUMN     "industryId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Podcast_industryId_idx" ON "Podcast"("industryId");

-- AddForeignKey
ALTER TABLE "Podcast" ADD CONSTRAINT "Podcast_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
