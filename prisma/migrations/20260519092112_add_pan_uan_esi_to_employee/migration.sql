/*
  Warnings:

  - A unique constraint covering the columns `[panNumber]` on the table `employees` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uanNumber]` on the table `employees` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[esiNumber]` on the table `employees` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "esiNumber" TEXT,
ADD COLUMN     "panNumber" TEXT,
ADD COLUMN     "uanNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "employees_panNumber_key" ON "employees"("panNumber");

-- CreateIndex
CREATE UNIQUE INDEX "employees_uanNumber_key" ON "employees"("uanNumber");

-- CreateIndex
CREATE UNIQUE INDEX "employees_esiNumber_key" ON "employees"("esiNumber");
