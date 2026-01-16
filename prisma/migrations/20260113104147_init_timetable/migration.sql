/*
  Warnings:

  - Changed the type of `dayOfWeek` on the `ClassTimetable` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `startTime` on the `ClassTimetable` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `endTime` on the `ClassTimetable` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT');

-- AlterTable
ALTER TABLE "ClassTimetable" DROP COLUMN "dayOfWeek",
ADD COLUMN     "dayOfWeek" "DayOfWeek" NOT NULL,
DROP COLUMN "startTime",
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
DROP COLUMN "endTime",
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "ClassTimetable_sectionId_dayOfWeek_idx" ON "ClassTimetable"("sectionId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "ClassTimetable_teacherId_dayOfWeek_idx" ON "ClassTimetable"("teacherId", "dayOfWeek");
