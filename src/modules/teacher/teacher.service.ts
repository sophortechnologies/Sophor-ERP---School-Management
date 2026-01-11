// src/modules/teacher/teacher.service.ts

import { Injectable, NotFoundException, ForbiddenException,BadRequestException,InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AttendanceStatus } from '@prisma/client';
import { RegisterTeacherDto } from './dto/register-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeacherService {
  constructor(private readonly prisma: PrismaService) {}

private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
  
  async getDashboard(userId: number, query: any) {
    // 1️⃣ Validate Teacher
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new ForbiddenException('Logged-in user is not a teacher');
    }

    // 2️⃣ Fetch teacher → class assignments
    const assignments = await this.prisma.teacherAssignment.findMany({
      where: { teacherId: teacher.id },
      include: { class: true },
    });

    // 3️⃣ Today boundaries
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 4️⃣ Build dashboard class summaries
    const classSummaries = await Promise.all(
      assignments.map(async (a) => {
        const classId = a.classId;

        const totalStudents = await this.prisma.student.count({
          where: { classId },
        });

        const markedAttendance = await this.prisma.attendance.count({
          where: {
            classId,
            date: { gte: todayStart, lte: todayEnd },
          },
        });

        return {
          classId,
          className: a.class.name,
          totalStudents,
          attendanceMarked: markedAttendance > 0,
        };
      }),
    );

    // 5️⃣ Flagged Students (low marks)
    const minAverage = 50;

    const flaggedAverages = await this.prisma.grade.groupBy({
      by: ['studentId'],
      _avg: { marksObtained: true },
      having: {
        marksObtained: {
          _avg: { lt: minAverage },
        },
      },
      orderBy: {
        _avg: { marksObtained: 'asc' },
      },
      take: 10,
    });

    const flaggedStudents = await Promise.all(
      flaggedAverages.map(async (fa) => {
        const student = await this.prisma.student.findUnique({
          where: { id: fa.studentId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        });

        return {
          ...student,
          averageMarks: fa._avg.marksObtained,
        };
      }),
    );

    return {
      classes: classSummaries,
      flaggedStudents,
    };
  }

  /**
   * ============================================================================
   * MARK ATTENDANCE
   * ============================================================================
   */
  async markAttendance(
    userId: number,
    classId: number,
    records: { studentId: number; status: string }[],
  ) {
    // 1️⃣ Validate Teacher
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new ForbiddenException('Logged-in user is not a teacher');
    }

    // 2️⃣ Validate Class Assignment
    const assignment = await this.prisma.teacherAssignment.findFirst({
      where: { teacherId: teacher.id, classId },
    });

    if (!assignment) {
      throw new NotFoundException('Teacher not assigned to this class');
    }

    // 3️⃣ Prepare date (only date part)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 4️⃣ Perform Upsert for each student attendance
    const results = await this.prisma.$transaction(
      records.map((r) =>
        this.prisma.attendance.upsert({
          where: {
            studentId_classId_date: {
              studentId: r.studentId,
              classId,
              date: today,
            },
          },
          create: {
            studentId: r.studentId,
            classId,
            date: today,
            status: r.status.toUpperCase() as AttendanceStatus,
            // userId: userId, // store who recorded
          },
          update: {
            status: r.status.toUpperCase() as AttendanceStatus,
            // userId: userId, // store who updated
          },
        }),
      ),
    );

    return {
      message: 'Attendance recorded successfully',
      records: results.length,
    };
  }
 async registerTeacher(dto: RegisterTeacherDto) {
  return this.prisma.$transaction(async (tx) => {

    // 1. Get TEACHER role
    const teacherRole = await tx.role.findUnique({
      where: { name: 'TEACHER' },
    });

    if (!teacherRole) {
      throw new InternalServerErrorException('Teacher role not found');
    }

    // 2. Validate department
    if (dto.departmentId !== undefined) {
      const departmentExists = await tx.department.findUnique({
        where: { id: dto.departmentId },
      });

      if (!departmentExists) {
        throw new BadRequestException(
          `Department with ID ${dto.departmentId} does not exist`,
        );
      }
    }

    // 3. Check username/email uniqueness
    const existingUser = await tx.user.findFirst({
      where: {
        OR: [
          { username: dto.username },
          { email: dto.email },
        ],
      },
    });

    if (existingUser) {
      throw new BadRequestException(
        'Username or email already exists',
      );
    }

    // 4. Create User
    const user = await tx.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        passwordHash: await this.hashPassword(dto.password),
        firstName: dto.firstName ?? null,
        lastName: dto.lastName ?? null,
        phone: dto.phone ?? null,
        roleId: teacherRole.id,
      },
    });

    // 5. Create Teacher
    const teacher = await tx.teacher.create({
      data: {
        userId: user.id,
        departmentId: dto.departmentId ?? null,
        dateOfBirth: dto.dateOfBirth
          ? new Date(dto.dateOfBirth)
          : null,
        gender: dto.gender ?? undefined,
        address: dto.address ?? null,
        qualification: dto.qualification ?? undefined,
        specialization: dto.specialization ?? null,
        employmentType: dto.employmentType ?? undefined,
        dateOfJoining: dto.dateOfJoining
          ? new Date(dto.dateOfJoining)
          : undefined,
        salary: dto.salary ?? null,
        status: dto.status ?? undefined,
        emergencyContact: dto.emergencyContact ?? null,
        emergencyPhone: dto.emergencyPhone ?? null,
      },
    });

    return {
      userId: user.id,
      teacherId: teacher.id,
    };
  });
}

async updateTeacher(
  teacherId: number,
  dto: UpdateTeacherDto,
) {
  return this.prisma.$transaction(async (tx) => {
    const teacher = await tx.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    /* =========================
       UPDATE USER
       ========================= */

    const userData: any = {};

    if (dto.username) userData.username = dto.username;
    if (dto.email) userData.email = dto.email;
    if (dto.firstName !== undefined) userData.firstName = dto.firstName;
    if (dto.lastName !== undefined) userData.lastName = dto.lastName;
    if (dto.phone !== undefined) userData.phone = dto.phone;
    if (dto.isActive !== undefined) userData.isActive = dto.isActive;

    if (dto.password) {
      userData.passwordHash = await this.hashPassword(dto.password);
    }

    if (Object.keys(userData).length > 0) {
      await tx.user.update({
        where: { id: teacher.userId },
        data: userData,
      });
    }

    /* =========================
       UPDATE TEACHER
       ========================= */

    const teacherData: any = {};

    if (dto.dateOfBirth)
      teacherData.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.gender) teacherData.gender = dto.gender;
    if (dto.address !== undefined) teacherData.address = dto.address;
    if (dto.qualification) teacherData.qualification = dto.qualification;
    if (dto.specialization !== undefined)
      teacherData.specialization = dto.specialization;
    if (dto.employmentType)
      teacherData.employmentType = dto.employmentType;
    if (dto.dateOfJoining)
      teacherData.dateOfJoining = new Date(dto.dateOfJoining);
    if (dto.salary !== undefined) teacherData.salary = dto.salary;
    if (dto.status) teacherData.status = dto.status;
    if (dto.emergencyContact !== undefined)
      teacherData.emergencyContact = dto.emergencyContact;
    if (dto.emergencyPhone !== undefined)
      teacherData.emergencyPhone = dto.emergencyPhone;
    if (dto.departmentId !== undefined)
      teacherData.departmentId = dto.departmentId;

    if (Object.keys(teacherData).length > 0) {
      await tx.teacher.update({
        where: { id: teacherId },
        data: teacherData,
      });
    }

    return {
      message: 'Teacher updated successfully',
    };
  });
}


async findAllTeachers(page = 1, pageSize = 10) {
  const skip = (page - 1) * pageSize;

  const [totalCount, teachers] = await this.prisma.$transaction([
    this.prisma.teacher.count(),
    this.prisma.teacher.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          include: {
            role: true,
          },
        },
        department: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    count: totalCount,
    total_pages: totalPages,
    current_page: page,
    next:
      page < totalPages
        ? `http://localhost:5000/teachers?page=${page + 1}&page_size=${pageSize}`
        : null,
    previous:
      page > 1
        ? `http://localhost:5000/teachers?page=${page - 1}&page_size=${pageSize}`
        : null,
    page_size: pageSize,
    data: teachers.map((t) => ({
      id: t.id,
      first_name: t.user.firstName,
      last_name: t.user.lastName,
      email: t.user.email,
      phone: t.user.phone,
      role: t.user.role.name,
      department: t.department?.name ?? null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    })),
  };
}

async findOneTeacher(id: number) {
  const teacher = await this.prisma.teacher.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          role: true,
        },
      },
      department: true,
    },
  });

  if (!teacher) {
    throw new NotFoundException('Teacher not found');
  }

  return {
    id: teacher.id,
    first_name: teacher.user.firstName,
    last_name: teacher.user.lastName,
    email: teacher.user.email,
    phone: teacher.user.phone,
    role: teacher.user.role.name,
    department: teacher.department?.name ?? null,
    createdAt: teacher.createdAt,
    updatedAt: teacher.updatedAt,
  };
}


}
