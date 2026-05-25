/*
  Warnings:

  - You are about to drop the column `biographyParagraphs` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `hostName` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `hostTitle` on the `Video` table. All the data in the column will be lost.
  - Added the required column `instructorId` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "biographyParagraphs",
DROP COLUMN "hostName",
DROP COLUMN "hostTitle",
ADD COLUMN     "instructorId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Instructor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "photoKey" TEXT NOT NULL,
    "biographyParagraphs" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
