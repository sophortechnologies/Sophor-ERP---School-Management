-- AlterTable
ALTER TABLE "employee_attendances" ADD COLUMN     "overtimeHours" DECIMAL(5,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "salaryStructureId" INTEGER;

-- AlterTable
ALTER TABLE "payroll_runs" ALTER COLUMN "totalNetPay" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_salaryStructureId_fkey" FOREIGN KEY ("salaryStructureId") REFERENCES "salary_structures"("id") ON DELETE SET NULL ON UPDATE CASCADE;
