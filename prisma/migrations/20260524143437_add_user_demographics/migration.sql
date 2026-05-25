-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('YANGON', 'MANDALAY', 'THAILAND', 'OTHER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthYear" INTEGER,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "region" "Region";
