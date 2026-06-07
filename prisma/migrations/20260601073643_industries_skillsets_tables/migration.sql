/*
  Warnings:

  - You are about to drop the column `industry` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `skillset` on the `Video` table. All the data in the column will be lost.
  - Added the required column `industryId` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skillsetId` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "industry",
DROP COLUMN "skillset",
ADD COLUMN     "industryId" TEXT NOT NULL,
ADD COLUMN     "skillsetId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Industry";

-- DropEnum
DROP TYPE "Skillset";

-- CreateTable
CREATE TABLE "Industry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skillset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skillset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Industry_name_key" ON "Industry"("name");

-- CreateIndex
CREATE INDEX "Industry_order_idx" ON "Industry"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Skillset_name_key" ON "Skillset"("name");

-- CreateIndex
CREATE INDEX "Skillset_order_idx" ON "Skillset"("order");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_skillsetId_fkey" FOREIGN KEY ("skillsetId") REFERENCES "Skillset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
