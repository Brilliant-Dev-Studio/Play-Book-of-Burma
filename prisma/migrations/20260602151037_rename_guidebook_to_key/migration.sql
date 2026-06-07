/*
  Warnings:

  - You are about to drop the column `guidebookUrl` on the `Video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "guidebookUrl",
ADD COLUMN     "guidebookKey" TEXT;
