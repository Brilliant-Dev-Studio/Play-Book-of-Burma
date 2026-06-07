/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `SkillsetItem` table. All the data in the column will be lost.
  - Added the required column `imageKey` to the `SkillsetItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SkillsetItem" DROP COLUMN "imageUrl",
ADD COLUMN     "imageKey" TEXT NOT NULL;
