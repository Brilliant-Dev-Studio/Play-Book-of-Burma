-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('VIDEO', 'PODCAST');

-- CreateEnum
CREATE TYPE "Playbook" AS ENUM ('CEO_PLAYBOOK');

-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('RETAILS', 'FMCG', 'TECHNOLOGY');

-- CreateEnum
CREATE TYPE "Skillset" AS ENUM ('BUSINESS_FINANCE_STRATEGY');

-- CreateEnum
CREATE TYPE "PublishStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "type" "ContentType" NOT NULL DEFAULT 'VIDEO',
    "playbook" "Playbook" NOT NULL DEFAULT 'CEO_PLAYBOOK',
    "industry" "Industry" NOT NULL,
    "skillset" "Skillset" NOT NULL,
    "titleLine1" TEXT NOT NULL,
    "titleLine2" TEXT,
    "description" TEXT NOT NULL,
    "hostName" TEXT NOT NULL,
    "hostTitle" TEXT NOT NULL,
    "thumbnailKey" TEXT NOT NULL,
    "videoKey" TEXT NOT NULL,
    "trailerUrl" TEXT,
    "guidebookUrl" TEXT,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "durationLabel" TEXT NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "biographyParagraphs" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "durationLabel" TEXT NOT NULL,
    "details" TEXT NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillsetItem" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "SkillsetItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillsetItem" ADD CONSTRAINT "SkillsetItem_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
