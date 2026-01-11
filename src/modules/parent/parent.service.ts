import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

import { CreateParentDto } from './dto/create-parent.dto';
import { RegisterParentDto } from './dto/register-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';

@Injectable()
export class ParentService {
  constructor(private readonly prisma: PrismaService) {}

  /* =========================
     ADMIN ACTIONS
     ========================= */

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
    return this.prisma.parent.update({
      where: { id: parentId },
      data: dto,
    });
  }

  /* =========================
     PARENT SELF SERVICES
     ========================= */

  async getMyChildren(userId: number) {
    return this.prisma.studentParent.findMany({
      where: {
        parent: {
          userId,
          isActive: true,
        },
      },
      include: {
        student: {
          include: {
            class: true,
            section: true,
          },
        },
      },
    });
  }

  async validateParentAccess(userId: number, studentId: number) {
    const exists = await this.prisma.studentParent.findFirst({
      where: {
        studentId,
        parent: { userId },
      },
    });

    if (!exists) {
      throw new ForbiddenException('You are not allowed to access this student');
    }
  }

  async getAttendanceSummary(studentId: number) {
    return this.prisma.attendanceSummary.findMany({
      where: { studentId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async getReportCards(studentId: number) {
    return this.prisma.reportCard.findMany({
      where: {
        studentId,
        isPublished: true,
      },
      include: { exam: true },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async getUpcomingExams(studentId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { classId: true },
    });

    if (!student?.classId) {
      throw new NotFoundException('Student class not assigned');
    }

    return this.prisma.exam.findMany({
      where: {
        classId: student.classId,
        startDate: { gte: new Date() },
        isActive: true,
      },
      orderBy: { startDate: 'asc' },
    });
  }
}
