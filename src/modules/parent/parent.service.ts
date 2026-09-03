import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { CreateParentDto } from './dto/create-parent.dto';
import { RegisterParentDto } from './dto/register-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';

@Injectable()
export class ParentService {
  constructor(private readonly prisma: PrismaService) {}

  async createParent(dto: CreateParentDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return this.prisma.parent.create({
      data: {
        userId: dto.userId,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async registerParent(dto: RegisterParentDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: dto.username }, { email: dto.email }],
      },
    });
    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }
    const role = await this.prisma.role.findUnique({
      where: { name: 'PARENT' },
    });
    if (!role) {
      throw new BadRequestException('Parent role not found');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        roleId: role.id,
        parents: {
          create: {
            isActive: dto.isActive ?? true,
          },
        },
      },
      include: {
        parents: true,
      },
    });
  }

  async updateParent(parentId: number, dto: UpdateParentDto) {
    const parent = await this.prisma.parent.findUnique({
      where: { id: parentId },
    });
    if (!parent) {
      throw new NotFoundException('Parent not found');
    }
    return this.prisma.parent.update({
      where: { id: parentId },
      data: dto,
    });
  }

  // FIXED: Completely rewritten getMyChildren method
  async getMyChildren(userId: number) {
    // First find the parent
    const parent = await this.prisma.parent.findUnique({
      where: { userId },
    });

    if (!parent) {
      throw new NotFoundException('Parent profile not found');
    }

    // Then find all student-parent links
    const links = await this.prisma.studentParent.findMany({
      where: { parentId: parent.id },
      include: {
        student: {
          include: {
            class: true,
            section: true,
          },
        },
      },
    });

    // Filter active students
    const activeChildren = links.filter(
      (link) => link.student && ['ACTIVE', 'ADMITTED'].includes(link.student.status)
    );

    return {
      count: activeChildren.length,
      children: activeChildren.map((link) => ({
        studentId: link.student.id,
        studentCode: link.student.studentId,
        name: `${link.student.firstName} ${link.student.lastName}`,
        class: link.student.class?.name || 'Not Assigned',
        section: link.student.section?.name || null,
        relation: link.relation,
        email: link.student.email,
        phone: link.student.phone,
      })),
    };
  }

  async validateParentAccess(userId: number, studentId: number) {
    const parent = await this.prisma.parent.findUnique({
      where: { userId },
      select: { id: true, isActive: true },
    });
    if (!parent) {
      throw new ForbiddenException('Parent profile not found');
    }
    if (!parent.isActive) {
      throw new ForbiddenException('Parent account is inactive');
    }
    const exists = await this.prisma.studentParent.findFirst({
      where: {
        studentId,
        parentId: parent.id,
      },
    });
    if (!exists) {
      throw new ForbiddenException('You are not authorized to access this student');
    }
    return true;
  }

  async getAttendanceSummary(studentId: number) {
    const summaries = await this.prisma.attendanceSummary.findMany({
      where: { studentId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: 6,
    });
    const overallPercentage =
      summaries.length > 0
        ? Math.round(
            (summaries.reduce((sum, s) => sum + s.percentage, 0) / summaries.length) * 100,
          ) / 100
        : 0;
    return {
      studentId,
      summaries: summaries.map((s) => ({
        month: s.month,
        year: s.year,
        presentDays: s.presentDays,
        absentDays: s.absentDays,
        lateDays: s.lateDays,
        halfDays: s.halfDays,
        totalDays: s.totalDays,
        percentage: Math.round(s.percentage * 100) / 100,
      })),
      overallAverage: overallPercentage,
    };
  }

  async getReportCards(studentId: number) {
    const reportCards = await this.prisma.reportCard.findMany({
      where: {
        studentId,
        isPublished: true,
      },
      include: {
        exam: {
          include: {
            examType: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 10,
    });
    return {
      studentId,
      count: reportCards.length,
      reportCards: reportCards.map((card) => ({
        examId: card.examId,
        examName: card.exam.name,
        examType: card.exam.examType?.name || 'Standard',
        term: card.exam.term,
        totalMarks: Number(card.totalMarks),
        obtainedMarks: Number(card.obtainedMarks),
        percentage: Math.round(Number(card.percentage) * 100) / 100,
        finalGrade: card.finalGrade,
        rank: card.rank,
        publishedAt: card.publishedAt,
      })),
    };
  }

  async getUpcomingExams(studentId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { classId: true, firstName: true, lastName: true },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    if (!student.classId) {
      return {
        studentId,
        message: 'No class assigned to this student',
        exams: [],
      };
    }
    const exams = await this.prisma.exam.findMany({
      where: {
        classId: student.classId,
        startDate: { gte: new Date() },
        isActive: true,
      },
      include: {
        examType: true,
        examSubjects: {
          include: { subject: true },
        },
      },
      orderBy: { startDate: 'asc' },
      take: 5,
    });
    return {
      studentId,
      count: exams.length,
      exams: exams.map((exam) => ({
        id: exam.id,
        name: exam.name,
        type: exam.examType?.name || 'Standard',
        term: exam.term,
        startDate: exam.startDate,
        endDate: exam.endDate,
        subjects: exam.examSubjects.map((es) => ({
          id: es.subject.id,
          name: es.subject.name,
        })),
      })),
    };
  }

  async getStudentBills(studentId: number) {
    const bills = await this.prisma.bill.findMany({
      where: { studentId },
      include: {
        config: true,
        payments: true,
      },
      orderBy: { dueDate: 'asc' },
    });
    const totalAmount = bills.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    const totalPaid = bills.reduce(
      (sum, b) => sum + b.payments.reduce((s, p) => s + Number(p.amountPaid), 0),
      0,
    );
    return {
      studentId,
      totalBilled: totalAmount,
      totalPaid,
      outstanding: totalAmount - totalPaid,
      bills: bills.map((b) => ({
        id: b.id,
        code: b.billCode,
        feeType: b.config?.feeType,
        amount: Number(b.totalAmount),
        dueDate: b.dueDate,
        status: b.status,
        paidAmount: b.payments.reduce((s, p) => s + Number(p.amountPaid), 0),
      })),
    };
  }

  async getStudentGrades(studentId: number) {
    const grades = await this.prisma.examResult.findMany({
      where: { studentId },
      include: {
        exam: true,
        subject: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    const averagePercentage =
      grades.length > 0
        ? grades.reduce((sum, g) => sum + Number(g.percentage), 0) / grades.length
        : 0;
    return {
      studentId,
      totalExams: grades.length,
      averagePercentage: Math.round(averagePercentage * 100) / 100,
      grades: grades.map((g) => ({
        examName: g.exam.name,
        subjectName: g.subject.name,
        marksObtained: Number(g.totalMarks),
        maxMarks: g.maxMarks,
        percentage: Number(g.percentage),
        grade: g.grade,
        date: g.createdAt,
      })),
    };
  }

  // Fix the getPresentDays method to use real attendance

private async getPresentDays(userId: number, salaryMonth: string): Promise<number> {
  const [year, month] = salaryMonth.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  // Get staff attendance for the month
  const presentCount = await this.prisma.staffAttendance.count({
    where: {
      userId: userId,
      status: 'PRESENT',
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Also count half-day as 0.5 day (optional)
  const halfDayCount = await this.prisma.staffAttendance.count({
    where: {
      userId: userId,
      status: 'HALF_DAY',
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Calculate working days (exclude weekends and holidays)
  const workingDays = await this.calculateWorkingDays(startDate, endDate);

  // Present days + half-day counts as 0.5
  const effectivePresentDays = presentCount + (halfDayCount * 0.5);

  return Math.min(effectivePresentDays, workingDays);
}

private async calculateWorkingDays(startDate: Date, endDate: Date): Promise<number> {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) { // Not weekend
      // Check if holiday (optional)
      const holiday = await this.prisma.holiday.findFirst({
        where: {
          date: current,
          isHalfDay: false,
        },
      });
      if (!holiday) {
        count++;
      }
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
}
}