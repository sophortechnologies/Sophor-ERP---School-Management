-- CreateTable
CREATE TABLE "timetable_archives" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "academicSessionId" INTEGER NOT NULL,
    "timetableData" JSONB NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timetable_archives_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "timetable_archives" ADD CONSTRAINT "timetable_archives_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_archives" ADD CONSTRAINT "timetable_archives_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "academic_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
