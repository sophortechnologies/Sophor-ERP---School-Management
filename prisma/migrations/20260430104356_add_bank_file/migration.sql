-- CreateTable
CREATE TABLE "bank_files" (
    "id" SERIAL NOT NULL,
    "payrollRunId" INTEGER NOT NULL,
    "bankName" TEXT NOT NULL,
    "fileFormat" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "totalTransactions" INTEGER NOT NULL,
    "generatedBy" INTEGER NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedToBank" BOOLEAN NOT NULL DEFAULT false,
    "uploadResponse" JSONB,

    CONSTRAINT "bank_files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bank_files" ADD CONSTRAINT "bank_files_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "payroll_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
