import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(query: any) {
    const sessionId = query.sessionId ? Number(query.sessionId) : undefined;

    // Students
    const totalStudents = await this.prisma.student.count({
      where: sessionId ? { sessionId } : undefined,
    });

    const activeStudents = await this.prisma.student.count({
      where: { deletedAt: null },
    });

    // Teachers (role = TEACHER)
    const totalTeachers = await this.prisma.user.count({
      where: { role: { name: 'TEACHER' } },
    });

    const totalUsers = await this.prisma.user.count();

    // Attendance (last 30 days)
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const attendanceSummary = await this.prisma.attendance.groupBy({
      by: ['status'],
      where: { date: { gte: since } },
      _count: { _all: true },
    });

    // Latest students
    const recentStudents = await this.prisma.student.findMany({
      orderBy: { admissionDate: 'desc' },
      take: 5,
      include: {
        class: true,
        session: true,
      },
    });

    // Latest Exam
    const latestExam = await this.prisma.exam.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let gradeDistribution = [];

    if (latestExam) {
  gradeDistribution = await (this.prisma.grade.groupBy as any)({
    by: ['grade'],
    where: {
      examId: latestExam.id,
    },
    _count: {
      _all: true,
    },
  });
}


    return {
      totals: {
        totalStudents,
        activeStudents,
        totalTeachers,
        totalUsers,
      },
      attendanceSummary,
      recentStudents,
      latestExam,
      gradeDistribution,
    };
  }

  // User list for admin panel
  async usersList(page = 1, page_size = 20) {
    const skip = (page - 1) * page_size;

    const [users, count] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: page_size,
        orderBy: { id: 'desc' },
        include: { role: true },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users,
      total: count,
      page,
      page_size,
    };
  }
}
