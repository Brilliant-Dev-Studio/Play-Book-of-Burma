-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "key" "MembershipPlan" NOT NULL,
    "name" TEXT NOT NULL,
    "months" INTEGER NOT NULL,
    "priceMmk" INTEGER NOT NULL,
    "perks" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_key_key" ON "Plan"("key");
