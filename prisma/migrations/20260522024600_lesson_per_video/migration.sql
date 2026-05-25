/*
  Warnings:

  - You are about to drop the column `trailerUrl` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `videoKey` on the `Video` table. All the data in the column will be lost.
  - Added the required column `videoKey` to the `Lesson` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "durationSeconds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "videoKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "trailerUrl",
DROP COLUMN "videoKey",
ADD COLUMN     "trailerKey" TEXT;
