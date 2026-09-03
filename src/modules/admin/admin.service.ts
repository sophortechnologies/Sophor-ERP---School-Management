

import { Injectable,BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AssignParentDto } from './dto/assign-parent.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

async getDashboard(query: any) {
  const sessionId = query.sessionId ? Number(query.sessionId) : undefined;

  const totalStudents = await this.prisma.student.count({
    where: sessionId ? { sessionId } : undefined,
  });

  const activeStudents = await this.prisma.student.count({
    where: { deletedAt: null },
  });

  const totalTeachers = await this.prisma.user.count({
    where: { role: { name: 'TEACHER' } },
  });

  const totalStaff = await this.prisma.staff.count({
    where: { status: 'ACTIVE' },
  });

  const totalUsers = await this.prisma.user.count();

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const attendanceGroup = await this.prisma.attendance.groupBy({
    by: ['status'],
    where: { date: { gte: since } },
    _count: { _all: true },
  });

  // FIX: Format attendance summary properly
  const attendanceSummary = {
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    total: 0,
  };

  for (const item of attendanceGroup) {
    const status = item.status;
    const count = item._count._all;
    attendanceSummary.total += count;
    
    if (status === 'PRESENT') attendanceSummary.present = count;
    if (status === 'ABSENT') attendanceSummary.absent = count;
    if (status === 'LATE') attendanceSummary.late = count;
    if (status === 'HALF_DAY') attendanceSummary.halfDay = count;
  }

  const recentStudents = await this.prisma.student.findMany({
    take: 5,
    orderBy: { admissionDate: 'desc' },
    include: {
      class: true,
      session: true,
    },
  });

  const latestExam = await this.prisma.exam.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  let gradeDistribution = [];

  if (latestExam) {
    const gradeGroup = await this.prisma.examResult.groupBy({
      by: ['grade'],
      where: { examId: latestExam.id },
      _count: { grade: true },
    });
    
    gradeDistribution = gradeGroup.map(item => ({
      grade: item.grade,
      count: item._count.grade,
    }));
  }

  // FIX: Add monthly trend data
  const monthlyTrend = await this.prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', date) as month,
      COUNT(*) as total,
      SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present
    FROM attendance
    WHERE date >= ${since}
    GROUP BY DATE_TRUNC('month', date)
    ORDER BY month DESC
    LIMIT 6
  `;

  return {
    totals: {
      totalStudents,
      activeStudents,
      totalTeachers,
      totalStaff,
      totalUsers,
    },
    attendanceSummary,
    recentStudents,
    latestExam: latestExam || null,
    gradeDistribution,
    monthlyTrend,
    generatedAt: new Date(),
  };
}
 
async linkParentToStudent(dto: AssignParentDto) {
  const parent = await this.prisma.parent.findUnique({
    where: { id: dto.parentId },
  });

  if (!parent) {
    throw new BadRequestException('Parent not found');
  }

  const student = await this.prisma.student.findUnique({
    where: { id: dto.studentId },
  });

  if (!student) {
    throw new BadRequestException('Student not found');
  }

  const exists = await this.prisma.studentParent.findFirst({
    where: {
      studentId: dto.studentId,
      parentId: dto.parentId,
    },
  });

  if (exists) {
    throw new BadRequestException('Parent already linked to this student');
  }

  return this.prisma.studentParent.create({
    data: {
      relation: dto.relation,
      studentId: dto.studentId,
      parentId: dto.parentId,
    },
  });
}

  async usersList(page = 1, page_size = 20) {
    const skip = (page - 1) * page_size;

    const [users, total] = await Promise.all([
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
      total,
      page,
      page_size,
    };
  }
}
