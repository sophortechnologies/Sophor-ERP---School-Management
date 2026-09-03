// src/modules/teacher/teacher.service.ts

import { 
  Injectable, NotFoundException, ForbiddenException,BadRequestException,InternalServerErrorException, ConflictException } from '@nestjs/common';
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
  // 1️⃣ Validate Teacher exists and get full details
  const teacher = await this.prisma.teacher.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!teacher) {
    throw new ForbiddenException('Logged-in user is not a teacher');
  }

  // 2️⃣ Fetch teacher's class and subject assignments
  const assignments = await this.prisma.teacherAssignment.findMany({
    where: { teacherId: teacher.id },
    include: {
      class: {
        include: {
          Section: {
            select: {
              id: true,
              name: true,
              capacity: true,
            },
          },
          academicSession: {
            where: { isActive: true },
            select: { id: true, name: true },
          },
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  if (assignments.length === 0) {
    return {
      teacher: {
        id: teacher.id,
        name: `${teacher.user.firstName} ${teacher.user.lastName}`,
        department: teacher.department?.name,
      },
      classes: [],
      recentActivity: [],
      upcomingExams: [],
      flaggedStudents: [],
      pendingLeaves: [],
      message: 'No classes assigned yet',
    };
  }

  // 3️⃣ Date boundaries for today and this week
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // 4️⃣ Build comprehensive class summaries
  const classSummaries = await Promise.all(
    assignments.map(async (a) => {
      const classId = a.classId;
      const sectionIds = a.class.Section.map(s => s.id);

      // Get total students in class
      const totalStudents = await this.prisma.student.count({
        where: { 
          classId,
          status: { in: ['ACTIVE', 'ADMITTED'] },
        },
      });

      // Get today's attendance status
      const markedAttendance = await this.prisma.attendance.count({
        where: {
          classId,
          date: { gte: todayStart, lte: todayEnd },
        },
      });

      // Get this week's attendance summary
      const weeklyAttendance = await this.prisma.attendance.groupBy({
        by: ['date'],
        where: {
          classId,
          date: { gte: weekStart, lte: weekEnd },
        },
        _count: { studentId: true },
      });

      // Get pending assignments/exams for this class
      const upcomingExamsForClass = await this.prisma.exam.count({
        where: {
          classId,
          startDate: { gte: new Date() },
          isActive: true,
        },
      });

      return {
        classId,
        className: a.class.name,
        subjectId: a.subjectId,
        subjectName: a.subject?.name,
        sections: a.class.Section.map(s => ({
          id: s.id,
          name: s.name,
          capacity: s.capacity,
        })),
        statistics: {
          totalStudents,
          attendanceMarkedToday: markedAttendance > 0,
          attendancePercentage: totalStudents > 0 
            ? Math.round((markedAttendance / totalStudents) * 100)
            : 0,
          weeklyAttendanceDays: weeklyAttendance.length,
          upcomingExams: upcomingExamsForClass,
        },
      };
    }),
  );

  // 5️⃣ Get recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentActivity = await this.prisma.attendance.findMany({
    where: {
      userId: userId,
      date: { gte: sevenDaysAgo },
    },
    include: {
      class: { select: { name: true } },
      student: { select: { firstName: true, lastName: true, studentId: true } },
    },
    orderBy: { date: 'desc' },
    take: 10,
  });

  // 6️⃣ Get upcoming exams for teacher's classes
  const classIds = assignments.map(a => a.classId);
  const upcomingExams = await this.prisma.exam.findMany({
    where: {
      classId: { in: classIds },
      startDate: { gte: new Date() },
      isActive: true,
    },
    include: {
      examType: { select: { name: true } },
      class: { select: { name: true } },
      examSubjects: {
        include: { subject: { select: { name: true } } },
        take: 5,
      },
    },
    orderBy: { startDate: 'asc' },
    take: 5,
  });

// 7️⃣ Get flagged students (low performance)
const minAverage = 50;

// Get students with low average in subjects teacher teaches
const subjectIds = assignments.filter(a => a.subjectId).map(a => a.subjectId);

let flaggedStudents = [];

if (subjectIds.length > 0) {
  const lowPerformingResults = await this.prisma.examResult.groupBy({
    by: ['studentId'],
    where: {
      subjectId: { in: subjectIds },
      percentage: { lt: minAverage },
    },
    _avg: { percentage: true },
    orderBy: {
      _avg: { percentage: 'asc' },
    },
    take: 10,
  });

  if (lowPerformingResults.length > 0) {
    const studentIds = lowPerformingResults.map(r => r.studentId);
    const students = await this.prisma.student.findMany({
      where: { id: { in: studentIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        studentId: true,
        class: { select: { name: true } },
      },
    });

    flaggedStudents = lowPerformingResults.map(result => {
      const student = students.find(s => s.id === result.studentId);
      // FIX: Convert Decimal to Number
      const avgPercentage = Number(result._avg.percentage);
      
      return {
        studentId: result.studentId,
        studentCode: student?.studentId,
        name: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
        className: student?.class?.name,
        averagePercentage: Math.round(avgPercentage * 100) / 100,
        status: avgPercentage < 35 ? 'Critical' : 'Warning',
      };
    });
  }
}

  // 8️⃣ Get pending leave requests (if teacher is Head of Department)
  let pendingLeaves = [];
  if (teacher.departmentId) {
    const hodCheck = await this.prisma.department.findFirst({
      where: { headId: teacher.id },
    });

    if (hodCheck) {
      pendingLeaves = await this.prisma.staffLeave.findMany({
        where: {
          status: 'PENDING',
          user: {
            staff: {
              departmentId: teacher.departmentId,
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { appliedAt: 'asc' },
        take: 5,
      });
    }
  }

  // 9️⃣ Calculate overall statistics
  const totalStudentsAcrossClasses = classSummaries.reduce(
    (sum, c) => sum + c.statistics.totalStudents, 
    0
  );

  const totalUpcomingExams = upcomingExams.length;

  // 🔟 Return complete dashboard
  return {
    teacher: {
      id: teacher.id,
      name: `${teacher.user.firstName} ${teacher.user.lastName}`,
      email: teacher.user.email,
      department: teacher.department?.name,
      qualification: teacher.qualification,
      specialization: teacher.specialization,
      employmentType: teacher.employmentType,
    },
    summary: {
      totalClasses: assignments.length,
      totalSubjects: assignments.filter(a => a.subjectId).length,
      totalStudents: totalStudentsAcrossClasses,
      upcomingExams: totalUpcomingExams,
      flaggedStudentsCount: flaggedStudents.length,
      pendingLeavesCount: pendingLeaves.length,
    },
    classes: classSummaries,
    recentActivity: recentActivity.map(activity => ({
      date: activity.date,
      studentName: `${activity.student.firstName} ${activity.student.lastName}`,
      status: activity.status,
      className: activity.class.name,
    })),
    upcomingExams: upcomingExams.map(exam => ({
      id: exam.id,
      name: exam.name,
      type: exam.examType?.name,
      className: exam.class.name,
      startDate: exam.startDate,
      endDate: exam.endDate,
      subjects: exam.examSubjects.map(es => es.subject.name),
    })),
    flaggedStudents,
    pendingLeaves: pendingLeaves.map(leave => ({
      id: leave.id,
      teacherName: `${leave.user.firstName} ${leave.user.lastName}`,
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
    })),
    lastUpdated: new Date(),
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
      date: Date = new Date(), 
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

    // ============================================================
    // 4.5 CREATE EMPLOYEE (ADD THIS BLOCK)
    // ============================================================
    const employee = await tx.employee.create({
      data: {
        employeeCode: `EMP-TCH-${user.id}-${Date.now()}`,
        userId: user.id,
        firstName: dto.firstName ?? '',
        lastName: dto.lastName ?? '',
        employeeType: 'TEACHER',
        departmentId: dto.departmentId ?? null,
        designation: 'TEACHER',
        joiningDate: dto.dateOfJoining ? new Date(dto.dateOfJoining) : new Date(),
        employmentType: dto.employmentType ?? 'full_time',
        status: 'ACTIVE',
        // Banking fields
        bankName: dto.bankName ?? null,
        accountNumber: dto.accountNumber ?? null,
        ifscCode: dto.ifscCode ?? null,
        panNumber: dto.panNumber ?? null,
        uanNumber: dto.uanNumber ?? null,
        esiNumber: dto.esiNumber ?? null,
      },
    });

    // 5. Create Teacher (with employeeId)
    const teacher = await tx.teacher.create({
      data: {
        userId: user.id,
        employeeId: employee.id,  // ← ADD THIS LINE
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
        bankName: dto.bankName ?? null,
        accountNumber: dto.accountNumber ?? null,
        ifscCode: dto.ifscCode ?? null,
        panNumber: dto.panNumber ?? null,
        uanNumber: dto.uanNumber ?? null,
        esiNumber: dto.esiNumber ?? null,
      },
    });

    // 6. Update Employee with teacherId (ADD THIS)
    await tx.employee.update({
      where: { id: employee.id },
      data: { teacherId: teacher.id },
    });

    return {
      userId: user.id,
      employeeId: employee.id,
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


async findAllTeachers( 
  page = 1,
  pageSize = 10,
  baseUrl?: string,
  departmentId?: number,
  status?: string,) {
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


async getTeacherClasses(userId: number) {
  const teacher = await this.prisma.teacher.findUnique({
    where: { userId },
  });

  if (!teacher) {
    throw new NotFoundException('Teacher not found');
  }

  const assignments = await this.prisma.teacherAssignment.findMany({
    where: { teacherId: teacher.id },
    include: {
      class: {
        include: {
          Section: true,
        },
      },
      subject: true,
    },
  });

  return assignments.map(a => ({
    classId: a.class.id,
    className: a.class.name,
    sections: a.class.Section,
    subjectId: a.subject?.id,
    subjectName: a.subject?.name,
  }));
}

async removeTeacher(id: number) {
  const teacher = await this.prisma.teacher.findUnique({
    where: { id },
  });

  if (!teacher) {
    throw new NotFoundException('Teacher not found');
  }

  const assignmentCount = await this.prisma.teacherAssignment.count({
    where: { teacherId: id },
  });

  if (assignmentCount > 0) {
    throw new BadRequestException('Cannot delete teacher with active assignments');
  }

  await this.prisma.teacher.delete({
    where: { id },
  });

  return { message: 'Teacher removed successfully' };
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

/**
 * Assign teacher to a class (as class teacher)
 */
async assignTeacherToClass(teacherId: number, classId: number) {
  // Check if teacher exists
  const teacher = await this.prisma.teacher.findUnique({
    where: { id: teacherId },
  });

  if (!teacher) {
    throw new NotFoundException('Teacher not found');
  }

  // Check if class exists
  const classRecord = await this.prisma.class.findUnique({
    where: { id: classId },
  });

  if (!classRecord) {
    throw new NotFoundException('Class not found');
  }

  // Check for duplicate
  const existing = await this.prisma.teacherAssignment.findFirst({
    where: { teacherId, classId, subjectId: null },
  });

  if (existing) {
    throw new ConflictException('Teacher already assigned to this class');
  }

  // Check max classes limit
  const assignmentCount = await this.prisma.teacherAssignment.count({
    where: { teacherId },
  });

  const MAX_CLASSES = 8;
  if (assignmentCount >= MAX_CLASSES) {
    throw new BadRequestException(`Teacher already assigned to ${assignmentCount} classes (max ${MAX_CLASSES})`);
  }

  return this.prisma.teacherAssignment.create({
    data: {
      teacherId,
      classId,
      subjectId: null,
    },
  });
}

/**
 * Assign teacher to a subject in a class
 */
async assignTeacherToSubject(teacherId: number, classId: number, subjectId: number) {
  // Check teacher exists
  const teacher = await this.prisma.teacher.findUnique({
    where: { id: teacherId },
  });

  if (!teacher) {
    throw new NotFoundException('Teacher not found');
  }

  // Check class exists
  const classRecord = await this.prisma.class.findUnique({
    where: { id: classId },
  });

  if (!classRecord) {
    throw new NotFoundException('Class not found');
  }

  // Check subject exists and is active
  const subject = await this.prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!subject) {
    throw new NotFoundException('Subject not found');
  }

  if (!subject.isActive) {
    throw new BadRequestException('Subject is not active');
  }

  // Validate teacher qualification (if specialization exists)
  if (teacher.specialization) {
    const specialization = teacher.specialization.toLowerCase();
    const subjectName = subject.name.toLowerCase();
    
    if (!specialization.includes(subjectName) && !subjectName.includes(specialization)) {
      throw new BadRequestException(
        `Teacher specialization "${teacher.specialization}" does not match subject "${subject.name}"`
      );
    }
  }

  // Check for duplicate
  const existing = await this.prisma.teacherAssignment.findFirst({
    where: { teacherId, classId, subjectId },
  });

  if (existing) {
    throw new ConflictException('Teacher already assigned to this subject in this class');
  }

  return this.prisma.teacherAssignment.create({
    data: {
      teacherId,
      classId,
      subjectId,
    },
  });
}

/**
 * Get all assignments for a teacher
 */
async getTeacherAssignments(teacherId: number) {
  const teacher = await this.prisma.teacher.findUnique({
    where: { id: teacherId },
  });

  if (!teacher) {
    throw new NotFoundException('Teacher not found');
  }

  const assignments = await this.prisma.teacherAssignment.findMany({
    where: { teacherId },
    include: {
      class: {
        select: { id: true, name: true },
      },
      subject: {
        select: { id: true, name: true, code: true },
      },
    },
  });

  return {
    teacherId,
    totalAssignments: assignments.length,
    assignments: assignments.map(a => ({
      id: a.id,
      classId: a.classId,
      className: a.class.name,
      subjectId: a.subjectId,
      subjectName: a.subject?.name,
      subjectCode: a.subject?.code,
      isClassTeacher: !a.subjectId,
    })),
  };
}

/**
 * Remove a teacher assignment
 */
async removeTeacherAssignment(assignmentId: number) {
  const assignment = await this.prisma.teacherAssignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment) {
    throw new NotFoundException('Assignment not found');
  }

  await this.prisma.teacherAssignment.delete({
    where: { id: assignmentId },
  });

  return { message: 'Assignment removed successfully' };
}

/**
 * Check if teacher is qualified for a subject
 */
async isTeacherQualifiedForSubject(teacherId: number, subjectId: number): Promise<boolean> {
  const teacher = await this.prisma.teacher.findUnique({
    where: { id: teacherId },
    select: { specialization: true },
  });

  const subject = await this.prisma.subject.findUnique({
    where: { id: subjectId },
    select: { name: true, code: true },
  });

  if (!teacher || !subject) {
    return false;
  }

  if (!teacher.specialization) {
    return true;
  }

  const specialization = teacher.specialization.toLowerCase();
  const subjectName = subject.name.toLowerCase();
  const subjectCode = subject.code.toLowerCase();

  return specialization === subjectName || 
         specialization === subjectCode ||
         subjectName.includes(specialization) ||
         specialization.includes(subjectName);
}

async softDeleteTeacher(teacherId: number) {
  const teacher = await this.prisma.teacher.findUnique({
    where: { id: teacherId },
  });

  if (!teacher) {
    throw new NotFoundException('Teacher not found');
  }

  const assignmentCount = await this.prisma.teacherAssignment.count({
    where: { teacherId },
  });

  if (assignmentCount > 0) {
    throw new BadRequestException('Cannot delete teacher with active assignments');
  }

  return this.prisma.teacher.update({
    where: { id: teacherId },
    data: { status: 'inactive' },
  });
}

async bulkAssignTeachers(assignments: { teacherId: number; classId: number; subjectId?: number }[]) {
  const results = { success: [], failed: [] };
  
  for (const assignment of assignments) {
    try {
      if (assignment.subjectId) {
        await this.assignTeacherToSubject(assignment.teacherId, assignment.classId, assignment.subjectId);
      } else {
        await this.assignTeacherToClass(assignment.teacherId, assignment.classId);
      }
      results.success.push(assignment);
    } catch (error:any) {
      results.failed.push({ ...assignment, error: error.message });
    }
  }
  
  return results;
}
}
