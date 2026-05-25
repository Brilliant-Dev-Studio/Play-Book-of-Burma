-- CreateEnum
CREATE TYPE "MembershipPlan" AS ENUM ('SIX_MONTHS', 'TWELVE_MONTHS');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "amountMmk" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "plan" "MembershipPlan";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "MembershipSubmission" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "plan" "MembershipPlan" NOT NULL DEFAULT 'SIX_MONTHS',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "amountMmk" INTEGER NOT NULL,
    "screenshotKey" TEXT NOT NULL,
    "note" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "resultingUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MembershipSubmission_status_createdAt_idx" ON "MembershipSubmission"("status", "createdAt");
