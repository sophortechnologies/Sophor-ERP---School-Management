import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TeacherService {
  constructor(private prisma: PrismaService) {}

  // teacher overview: today's classes, pending attendance, student performance flags
  async getDashboard(teacherUserId: number, query: any) {
    // find classes assigned to this teacher (relation: teacherAssignments or Class.teachers)
    const classes = await this.prisma.teacherAssignment.findMany({
      where: { teacherId: teacherUserId },
      include: { class: true },
    });

    // get today’s date boundaries
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const todayEnd = new Date();
    todayEnd.setHours(23,59,59,999);

    // today's class schedule (assuming exam/class schedules are present)
    // simple approach: list classes and count attendance pending
    const classSummaries = await Promise.all(classes.map(async (ta) => {
      const classId = ta.classId;
      const totalStudents = await this.prisma.student.count({ where: { classId } });
      const unmarkedAttendance = await this.prisma.attendance.count({
        where: { classId, date: { gte: todayStart, lt: todayEnd } }
      });

      return {
        class: ta.class,
        totalStudents,
        unmarkedAttendance,
      };
    }));

    // flagged students (low average below threshold)
    const flagged = await this.prisma.$queryRawUnsafe(`
      SELECT s.id, s.firstName, s.lastName, AVG(g.marksObtained::numeric) as avg
      FROM "Student" s
      JOIN "Grade" g ON g."studentId" = s.id
      GROUP BY s.id
      HAVING AVG(g.marksObtained::numeric) < 50
      LIMIT 10
    `).catch(() => []); // raw query is optional; modify to prisma aggregator if dislike raw SQL

    return {
      classes: classSummaries,
      flaggedStudents: flagged,
    };
  }

  // mark attendance quickly - teacher action
  async markAttendance(teacherUserId: number, classId: number, records: { studentId: number; status: string }[]) {
    // validate teacher assigned to class
    const assignment = await this.prisma.teacherAssignment.findFirst({ where: { teacherId: teacherUserId, classId } });
    if (!assignment) throw new NotFoundException('Teacher not assigned to this class');

    const date = new Date();
    const tx = await this.prisma.$transaction(records.map(r => 
      this.prisma.attendance.upsert({
        where: { studentId_classId_date: { studentId: r.studentId, classId, date } },
        create: { studentId: r.studentId, classId, date, status: r.status, recordedBy: teacherUserId },
        update: { status: r.status, recordedBy: teacherUserId }
      })
    ));
    return { message: 'Attendance recorded', count: tx.length };
  }
}
