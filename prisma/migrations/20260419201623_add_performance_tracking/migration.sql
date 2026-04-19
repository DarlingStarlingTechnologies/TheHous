-- CreateTable
CREATE TABLE "Performance" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "persona" TEXT,
    "venue" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "hoursWorked" DOUBLE PRECISION,
    "type" TEXT NOT NULL DEFAULT 'featured',
    "season" TEXT NOT NULL DEFAULT 'standard',
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "brandScore" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceIncome" (
    "id" TEXT NOT NULL,
    "performanceId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "isProjected" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceIncome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceExpense" (
    "id" TEXT NOT NULL,
    "performanceId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "isProjected" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "purchaseCost" DOUBLE PRECISION NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "expectedUses" INTEGER NOT NULL DEFAULT 10,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetUsage" (
    "id" TEXT NOT NULL,
    "performanceId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Performance_date_idx" ON "Performance"("date");

-- CreateIndex
CREATE INDEX "Performance_status_idx" ON "Performance"("status");

-- CreateIndex
CREATE INDEX "Performance_persona_idx" ON "Performance"("persona");

-- CreateIndex
CREATE INDEX "Performance_type_idx" ON "Performance"("type");

-- CreateIndex
CREATE INDEX "Performance_season_idx" ON "Performance"("season");

-- CreateIndex
CREATE INDEX "PerformanceIncome_performanceId_idx" ON "PerformanceIncome"("performanceId");

-- CreateIndex
CREATE INDEX "PerformanceIncome_category_idx" ON "PerformanceIncome"("category");

-- CreateIndex
CREATE INDEX "PerformanceExpense_performanceId_idx" ON "PerformanceExpense"("performanceId");

-- CreateIndex
CREATE INDEX "PerformanceExpense_category_idx" ON "PerformanceExpense"("category");

-- CreateIndex
CREATE INDEX "Asset_category_idx" ON "Asset"("category");

-- CreateIndex
CREATE INDEX "Asset_status_idx" ON "Asset"("status");

-- CreateIndex
CREATE INDEX "AssetUsage_performanceId_idx" ON "AssetUsage"("performanceId");

-- CreateIndex
CREATE INDEX "AssetUsage_assetId_idx" ON "AssetUsage"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "AssetUsage_performanceId_assetId_key" ON "AssetUsage"("performanceId", "assetId");

-- AddForeignKey
ALTER TABLE "PerformanceIncome" ADD CONSTRAINT "PerformanceIncome_performanceId_fkey" FOREIGN KEY ("performanceId") REFERENCES "Performance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceExpense" ADD CONSTRAINT "PerformanceExpense_performanceId_fkey" FOREIGN KEY ("performanceId") REFERENCES "Performance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetUsage" ADD CONSTRAINT "AssetUsage_performanceId_fkey" FOREIGN KEY ("performanceId") REFERENCES "Performance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetUsage" ADD CONSTRAINT "AssetUsage_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
