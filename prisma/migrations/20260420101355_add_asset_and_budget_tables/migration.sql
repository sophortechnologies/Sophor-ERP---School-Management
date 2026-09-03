/*
  Warnings:

  - You are about to drop the `salary_components` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[receiptNumber]` on the table `Bill` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[panNumber]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uanNumber]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[esiNumber]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[panNumber]` on the table `staff` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uanNumber]` on the table `staff` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[esiNumber]` on the table `staff` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdBy` to the `Bill` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "salary_components" DROP CONSTRAINT "salary_components_structureId_fkey";

-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "createdBy" INTEGER NOT NULL,
ADD COLUMN     "gatewayName" TEXT,
ADD COLUMN     "gatewayPaymentId" TEXT,
ADD COLUMN     "gatewayResponse" JSONB,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "receiptNumber" TEXT,
ADD COLUMN     "receiptUrl" TEXT,
ADD COLUMN     "refundedAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "refundedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "esiApplicable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "esiNumber" TEXT,
ADD COLUMN     "ifscCode" TEXT,
ADD COLUMN     "panNumber" TEXT,
ADD COLUMN     "pfApplicable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "salaryStructureId" INTEGER,
ADD COLUMN     "uanNumber" TEXT;

-- AlterTable
ALTER TABLE "staff" ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "esiApplicable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "esiNumber" TEXT,
ADD COLUMN     "ifscCode" TEXT,
ADD COLUMN     "panNumber" TEXT,
ADD COLUMN     "pfApplicable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "salaryStructureId" INTEGER,
ADD COLUMN     "uanNumber" TEXT;

-- DropTable
DROP TABLE "salary_components";

-- CreateTable
CREATE TABLE "PaymentReminder" (
    "id" SERIAL NOT NULL,
    "billId" INTEGER NOT NULL,
    "reminderType" TEXT NOT NULL,
    "daysBeforeDue" INTEGER,
    "daysAfterDue" INTEGER,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentVia" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "PaymentReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankReconciliation" (
    "id" SERIAL NOT NULL,
    "reconciliationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bankStatementDate" TIMESTAMP(3) NOT NULL,
    "totalPayments" DECIMAL(12,2) NOT NULL,
    "totalBankEntries" DECIMAL(12,2) NOT NULL,
    "difference" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL,
    "reportUrl" TEXT,
    "completedBy" INTEGER,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BankReconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReconciliationItem" (
    "id" SERIAL NOT NULL,
    "reconciliationId" INTEGER NOT NULL,
    "paymentId" INTEGER,
    "bankReference" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "matchStatus" TEXT NOT NULL,
    "discrepancyReason" TEXT,

    CONSTRAINT "ReconciliationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeHead" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "amount" DECIMAL(10,2) NOT NULL,
    "classId" INTEGER,
    "academicSessionId" INTEGER,
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 3,
    "lateFeePercent" DECIMAL(5,2) NOT NULL DEFAULT 2,
    "maxLateFeePercent" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeHead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRun" (
    "id" SERIAL NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "totalEarnings" DECIMAL(12,2) NOT NULL,
    "totalDeductions" DECIMAL(12,2) NOT NULL,
    "totalNetPay" DECIMAL(12,2) NOT NULL,
    "processedBy" INTEGER NOT NULL,
    "approvedBy" INTEGER,
    "disbursedAt" TIMESTAMP(3),
    "bankFileUrl" TEXT,

    CONSTRAINT "PayrollRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRecord" (
    "id" SERIAL NOT NULL,
    "payrollRunId" INTEGER NOT NULL,
    "teacherId" INTEGER,
    "staffId" INTEGER,
    "presentDays" INTEGER NOT NULL,
    "absentDays" INTEGER NOT NULL,
    "lateDays" INTEGER NOT NULL,
    "overtimeHours" DECIMAL(5,2) NOT NULL,
    "earningsJson" JSONB NOT NULL,
    "deductionsJson" JSONB NOT NULL,
    "grossEarnings" DECIMAL(10,2) NOT NULL,
    "totalDeductions" DECIMAL(10,2) NOT NULL,
    "netPay" DECIMAL(10,2) NOT NULL,
    "employerPf" DECIMAL(10,2) NOT NULL,
    "employerEsi" DECIMAL(10,2) NOT NULL,
    "payslipUrl" TEXT,

    CONSTRAINT "PayrollRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryComponent" (
    "id" SERIAL NOT NULL,
    "structureId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "calculationType" TEXT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "dependsOn" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isTaxable" BOOLEAN NOT NULL DEFAULT false,
    "isStatutory" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SalaryComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatutoryReturn" (
    "id" SERIAL NOT NULL,
    "returnType" TEXT NOT NULL,
    "month" INTEGER,
    "quarter" INTEGER,
    "year" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedToGovt" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgmentNo" TEXT,

    CONSTRAINT "StatutoryReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankFile" (
    "id" SERIAL NOT NULL,
    "payrollRunId" INTEGER NOT NULL,
    "fileFormat" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "totalRecords" INTEGER NOT NULL,
    "uploadedToBank" BOOLEAN NOT NULL DEFAULT false,
    "uploadedAt" TIMESTAMP(3),

    CONSTRAINT "BankFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountRule" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "conditions" JSONB NOT NULL,
    "priority" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DiscountRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundRequest" (
    "id" SERIAL NOT NULL,
    "paymentId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "reasonDetail" TEXT,
    "status" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestedBy" INTEGER NOT NULL,
    "approvedBy" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "processedAt" TIMESTAMP(3),
    "transactionId" TEXT,

    CONSTRAINT "RefundRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LateFeeRule" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 3,
    "calculationType" TEXT NOT NULL,
    "value" DECIMAL(5,2) NOT NULL,
    "maxAmount" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LateFeeRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LateFeeApplied" (
    "id" SERIAL NOT NULL,
    "billId" INTEGER NOT NULL,
    "daysLate" INTEGER NOT NULL,
    "feeAmount" DECIMAL(10,2) NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LateFeeApplied_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" SERIAL NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "paymentId" INTEGER NOT NULL,
    "receiptUrl" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentVia" TEXT NOT NULL,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeeHead_code_key" ON "FeeHead"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_receiptNumber_key" ON "Receipt"("receiptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_receiptNumber_key" ON "Bill"("receiptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_panNumber_key" ON "Teacher"("panNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_uanNumber_key" ON "Teacher"("uanNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_esiNumber_key" ON "Teacher"("esiNumber");

-- CreateIndex
CREATE UNIQUE INDEX "staff_panNumber_key" ON "staff"("panNumber");

-- CreateIndex
CREATE UNIQUE INDEX "staff_uanNumber_key" ON "staff"("uanNumber");

-- CreateIndex
CREATE UNIQUE INDEX "staff_esiNumber_key" ON "staff"("esiNumber");

-- AddForeignKey
ALTER TABLE "PaymentReminder" ADD CONSTRAINT "PaymentReminder_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationItem" ADD CONSTRAINT "ReconciliationItem_reconciliationId_fkey" FOREIGN KEY ("reconciliationId") REFERENCES "BankReconciliation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationItem" ADD CONSTRAINT "ReconciliationItem_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRecord" ADD CONSTRAINT "PayrollRecord_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "PayrollRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRecord" ADD CONSTRAINT "PayrollRecord_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRecord" ADD CONSTRAINT "PayrollRecord_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryComponent" ADD CONSTRAINT "SalaryComponent_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "salary_structures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LateFeeApplied" ADD CONSTRAINT "LateFeeApplied_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
