/*
  Warnings:

  - You are about to drop the column `totalDays` on the `employee_leaves` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "employee_attendances" ADD COLUMN     "lateBy" INTEGER,
ADD COLUMN     "recordedBy" INTEGER,
ADD COLUMN     "remarks" TEXT;

-- AlterTable
ALTER TABLE "employee_leaves" DROP COLUMN "totalDays",
ADD COLUMN     "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" INTEGER,
ADD COLUMN     "halfDay" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "employee_attendances_date_idx" ON "employee_attendances"("date");

-- CreateIndex
CREATE INDEX "employee_attendances_status_idx" ON "employee_attendances"("status");

-- CreateIndex
CREATE INDEX "employee_leaves_employeeId_idx" ON "employee_leaves"("employeeId");

-- CreateIndex
CREATE INDEX "employee_leaves_status_idx" ON "employee_leaves"("status");
