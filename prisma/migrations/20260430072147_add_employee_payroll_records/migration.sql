/*
  Warnings:

  - Added the required column `lateDays` to the `payroll_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overtimeHours` to the `payroll_records` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payroll_records" ADD COLUMN     "employeePension" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "employerPension" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "incomeTax" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "lateDays" INTEGER NOT NULL,
ADD COLUMN     "overtimeHours" DECIMAL(5,2) NOT NULL;

-- AlterTable
ALTER TABLE "payroll_runs" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" INTEGER,
ADD COLUMN     "disbursedAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'DRAFT';
