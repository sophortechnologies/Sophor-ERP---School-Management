-- CreateTable
CREATE TABLE "BillItem" (
    "id" SERIAL NOT NULL,
    "billId" INTEGER NOT NULL,
    "billConfigId" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "description" TEXT,

    CONSTRAINT "BillItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" SERIAL NOT NULL,
    "assetTag" TEXT NOT NULL,
    "serialNumber" TEXT,
    "name" TEXT NOT NULL,
    "model" TEXT,
    "manufacturer" TEXT,
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "purchaseCost" DECIMAL(12,2) NOT NULL,
    "purchaseOrderId" INTEGER,
    "vendorName" TEXT,
    "vendorContact" TEXT,
    "invoiceNumber" TEXT,
    "warrantyExpiry" TIMESTAMP(3),
    "warrantyDetails" TEXT,
    "depreciationMethod" TEXT NOT NULL DEFAULT 'STRAIGHT_LINE',
    "usefulLifeYears" INTEGER NOT NULL DEFAULT 5,
    "salvageValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "currentValue" DECIMAL(12,2) NOT NULL,
    "accumulatedDepreciation" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "lastDepreciationDate" TIMESTAMP(3),
    "fullyDepreciated" BOOLEAN NOT NULL DEFAULT false,
    "currentLocation" TEXT,
    "rackNumber" TEXT,
    "assignedToUserId" INTEGER,
    "assignedToDepartmentId" INTEGER,
    "assignedAt" TIMESTAMP(3),
    "assignedBy" INTEGER,
    "lastMaintenanceDate" TIMESTAMP(3),
    "nextMaintenanceDate" TIMESTAMP(3),
    "maintenanceInterval" INTEGER,
    "maintenanceCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "insuranceProvider" TEXT,
    "insurancePolicyNo" TEXT,
    "insuranceExpiry" TIMESTAMP(3),
    "insuranceAmount" DECIMAL(12,2),
    "documents" JSONB,
    "photos" JSONB,
    "notes" TEXT,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepreciationHistory" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "openingValue" DECIMAL(12,2) NOT NULL,
    "depreciationAmount" DECIMAL(12,2) NOT NULL,
    "closingValue" DECIMAL(12,2) NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isYearEnd" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DepreciationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetMaintenance" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "maintenanceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL,
    "vendorName" TEXT,
    "technicianName" TEXT,
    "nextDueDate" TIMESTAMP(3),
    "invoiceNumber" TEXT,
    "remarks" TEXT,
    "performedBy" INTEGER NOT NULL,

    CONSTRAINT "AssetMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetTransfer" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "transferDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fromUserId" INTEGER,
    "fromDepartmentId" INTEGER,
    "fromLocation" TEXT,
    "toUserId" INTEGER,
    "toDepartmentId" INTEGER,
    "toLocation" TEXT,
    "reason" TEXT NOT NULL,
    "transferOrderNo" TEXT,
    "condition" TEXT,
    "authorizedBy" INTEGER NOT NULL,
    "authorizedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedBy" INTEGER,
    "receivedAt" TIMESTAMP(3),

    CONSTRAINT "AssetTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetDisposal" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "disposalDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disposalType" TEXT NOT NULL,
    "saleAmount" DECIMAL(12,2),
    "disposalCost" DECIMAL(12,2),
    "buyerName" TEXT,
    "reason" TEXT NOT NULL,
    "authorizedBy" INTEGER NOT NULL,
    "authorizedAt" TIMESTAMP(3) NOT NULL,
    "certificateUrl" TEXT,
    "notes" TEXT,

    CONSTRAINT "AssetDisposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" SERIAL NOT NULL,
    "budgetCode" TEXT NOT NULL,
    "fiscalYear" TEXT NOT NULL,
    "parentId" INTEGER,
    "departmentId" INTEGER,
    "costCenter" TEXT,
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "budgetType" TEXT NOT NULL DEFAULT 'ANNUAL',
    "allocatedAmount" DECIMAL(12,2) NOT NULL,
    "committedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "actualAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "availableAmount" DECIMAL(12,2) NOT NULL,
    "softStopPercent" INTEGER NOT NULL DEFAULT 80,
    "hardStopPercent" INTEGER NOT NULL DEFAULT 100,
    "alertEmail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submittedBy" INTEGER,
    "submittedAt" TIMESTAMP(3),
    "approvedBy" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "frozenAt" TIMESTAMP(3),
    "allowRollover" BOOLEAN NOT NULL DEFAULT false,
    "rolloverToNextYear" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetCommitment" (
    "id" SERIAL NOT NULL,
    "budgetId" INTEGER NOT NULL,
    "commitmentNumber" TEXT NOT NULL,
    "referenceType" TEXT NOT NULL,
    "referenceId" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "committedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "committedBy" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "realizedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,

    CONSTRAINT "BudgetCommitment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetActual" (
    "id" SERIAL NOT NULL,
    "budgetId" INTEGER NOT NULL,
    "actualNumber" TEXT NOT NULL,
    "referenceType" TEXT NOT NULL,
    "referenceId" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" INTEGER NOT NULL,
    "approvedBy" INTEGER,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "BudgetActual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetTransfer" (
    "id" SERIAL NOT NULL,
    "transferNumber" TEXT NOT NULL,
    "fromBudgetId" INTEGER NOT NULL,
    "toBudgetId" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "justification" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedBy" INTEGER NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "executedAt" TIMESTAMP(3),

    CONSTRAINT "BudgetTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetAlert" (
    "id" SERIAL NOT NULL,
    "budgetId" INTEGER NOT NULL,
    "alertType" TEXT NOT NULL,
    "percentageUsed" INTEGER NOT NULL,
    "threshold" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetForecast" (
    "id" SERIAL NOT NULL,
    "budgetId" INTEGER NOT NULL,
    "forecastDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "projectedSpend" DECIMAL(12,2) NOT NULL,
    "confidenceLevel" TEXT NOT NULL,
    "assumptions" JSONB,
    "generatedBy" INTEGER NOT NULL,

    CONSTRAINT "BudgetForecast_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_assetTag_key" ON "Asset"("assetTag");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_serialNumber_key" ON "Asset"("serialNumber");

-- CreateIndex
CREATE INDEX "Asset_assetTag_idx" ON "Asset"("assetTag");

-- CreateIndex
CREATE INDEX "Asset_category_idx" ON "Asset"("category");

-- CreateIndex
CREATE INDEX "Asset_status_idx" ON "Asset"("status");

-- CreateIndex
CREATE INDEX "Asset_assignedToUserId_idx" ON "Asset"("assignedToUserId");

-- CreateIndex
CREATE INDEX "Asset_nextMaintenanceDate_idx" ON "Asset"("nextMaintenanceDate");

-- CreateIndex
CREATE INDEX "DepreciationHistory_assetId_year_idx" ON "DepreciationHistory"("assetId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "DepreciationHistory_assetId_year_month_key" ON "DepreciationHistory"("assetId", "year", "month");

-- CreateIndex
CREATE INDEX "AssetMaintenance_assetId_maintenanceDate_idx" ON "AssetMaintenance"("assetId", "maintenanceDate");

-- CreateIndex
CREATE INDEX "AssetMaintenance_nextDueDate_idx" ON "AssetMaintenance"("nextDueDate");

-- CreateIndex
CREATE INDEX "AssetTransfer_assetId_idx" ON "AssetTransfer"("assetId");

-- CreateIndex
CREATE INDEX "AssetDisposal_assetId_idx" ON "AssetDisposal"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_budgetCode_key" ON "Budget"("budgetCode");

-- CreateIndex
CREATE INDEX "Budget_fiscalYear_idx" ON "Budget"("fiscalYear");

-- CreateIndex
CREATE INDEX "Budget_departmentId_idx" ON "Budget"("departmentId");

-- CreateIndex
CREATE INDEX "Budget_category_idx" ON "Budget"("category");

-- CreateIndex
CREATE INDEX "Budget_status_idx" ON "Budget"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetCommitment_commitmentNumber_key" ON "BudgetCommitment"("commitmentNumber");

-- CreateIndex
CREATE INDEX "BudgetCommitment_budgetId_idx" ON "BudgetCommitment"("budgetId");

-- CreateIndex
CREATE INDEX "BudgetCommitment_referenceType_referenceId_idx" ON "BudgetCommitment"("referenceType", "referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetActual_actualNumber_key" ON "BudgetActual"("actualNumber");

-- CreateIndex
CREATE INDEX "BudgetActual_budgetId_idx" ON "BudgetActual"("budgetId");

-- CreateIndex
CREATE INDEX "BudgetActual_referenceType_referenceId_idx" ON "BudgetActual"("referenceType", "referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetTransfer_transferNumber_key" ON "BudgetTransfer"("transferNumber");

-- CreateIndex
CREATE INDEX "BudgetTransfer_fromBudgetId_idx" ON "BudgetTransfer"("fromBudgetId");

-- CreateIndex
CREATE INDEX "BudgetTransfer_toBudgetId_idx" ON "BudgetTransfer"("toBudgetId");

-- CreateIndex
CREATE INDEX "BudgetTransfer_status_idx" ON "BudgetTransfer"("status");

-- CreateIndex
CREATE INDEX "BudgetAlert_budgetId_isResolved_idx" ON "BudgetAlert"("budgetId", "isResolved");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetForecast_budgetId_month_year_key" ON "BudgetForecast"("budgetId", "month", "year");

-- AddForeignKey
ALTER TABLE "BillItem" ADD CONSTRAINT "BillItem_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillItem" ADD CONSTRAINT "BillItem_billConfigId_fkey" FOREIGN KEY ("billConfigId") REFERENCES "BillConfiguration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_assignedToDepartmentId_fkey" FOREIGN KEY ("assignedToDepartmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepreciationHistory" ADD CONSTRAINT "DepreciationHistory_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetMaintenance" ADD CONSTRAINT "AssetMaintenance_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetTransfer" ADD CONSTRAINT "AssetTransfer_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetDisposal" ADD CONSTRAINT "AssetDisposal_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetCommitment" ADD CONSTRAINT "BudgetCommitment_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetActual" ADD CONSTRAINT "BudgetActual_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetTransfer" ADD CONSTRAINT "BudgetTransfer_fromBudgetId_fkey" FOREIGN KEY ("fromBudgetId") REFERENCES "Budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetTransfer" ADD CONSTRAINT "BudgetTransfer_toBudgetId_fkey" FOREIGN KEY ("toBudgetId") REFERENCES "Budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetTransfer" ADD CONSTRAINT "BudgetTransfer_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetTransfer" ADD CONSTRAINT "BudgetTransfer_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetAlert" ADD CONSTRAINT "BudgetAlert_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetAlert" ADD CONSTRAINT "BudgetAlert_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetForecast" ADD CONSTRAINT "BudgetForecast_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetForecast" ADD CONSTRAINT "BudgetForecast_generatedBy_fkey" FOREIGN KEY ("generatedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
