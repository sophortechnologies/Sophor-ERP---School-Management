

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

    const totalUsers = await this.prisma.user.count();

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const attendanceSummary = await this.prisma.attendance.groupBy({
      by: ['status'],
      where: { date: { gte: since } },
      _count: { _all: true },
    });

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

    let gradeDistribution: {
      grade: string;
      _count: { _all: number };
    }[] = [];

    if (latestExam) {
      gradeDistribution = await (this.prisma.grade.groupBy as any)({
        by: ['grade'],
        where: { examId: latestExam.id },
        _count: { _all: true },
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

  const exists = await this.prisma.studentParent.findUnique({
    where: {
      studentId_parentId: {
        studentId: dto.studentId,
        parentId: dto.parentId,
      },
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
