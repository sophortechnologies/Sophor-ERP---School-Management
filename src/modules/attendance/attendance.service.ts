// src/modules/attendance/attendance.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { AttendanceStatus } from './enums/attendance-status.enum';
import { PrismaService } from '../../database/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { NotificationService } from '../notification/notification.service'
import { AuditService } from '../../common/services/audit.service';
import { NotificationType } from '../notification/notification-type.enum';
import { HolidayService } from '../holiday/holiday.service';

type UserRoleString = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | string | undefined;

/**
 * IMPORTANT: keep this list in sync with your Prisma enum values in schema.prisma.
 */
// type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'EXCUSED';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly auditService: AuditService,
    private readonly holidayService: HolidayService, // ✅ ADD

  ) {}

  // -------------------------
  // Helpers / Includes
  // -------------------------
  private getAttendanceIncludes() {
    return {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          studentId: true,
          email: true,
          classId: true,
        },
      },
      class: {
        select: {
          id: true,
          name: true,
          grade: true,
          academicSessionId: true,
          Section: { select: { id: true, name: true } },
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    };
  }
private normalizeDateToISODate(date: Date): Date {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0,
  ));
}

private isAfterDeadline(attendanceDate: Date): boolean {
  const now = new Date();
  const deadline = new Date(attendanceDate);
  deadline.setUTCHours(72, 0, 0, 0); 
  return now > deadline;
}

async isHoliday(date: Date, academicSessionId?: number) {
  const startOfDay = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0,
  ));

  const endOfDay = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    23, 59, 59, 999,
  ));

  const holiday = await this.prisma.holiday.findFirst({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      academicSessionId: academicSessionId ?? null,
    },
  });

  return {
    isHoliday: !!holiday,
    isHalfDay: holiday?.isHalfDay ?? false,
    holiday,
  };
}

  /**
   * Resolve role code for a user. Prefer the roleCode parameter (passed from controller),
   * otherwise query DB for role.code.
   */
  private async resolveRoleCode(userId: number, roleCodeFromToken?: string): Promise<string | undefined> {
    if (roleCodeFromToken) return roleCodeFromToken;
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    return user?.role?.code;
  }

private async assertCanCreateOrManageAttendance(
  classId: number,
  date: Date,
  userId: number,
  userRoleCode?: UserRoleString,
) {
  const attendanceDate = this.normalizeDateToISODate(date);
  const today = this.normalizeDateToISODate(new Date());

  if (attendanceDate.getTime() > today.getTime()) {
    throw new BadRequestException('Cannot mark attendance for future dates');
  }

  const day = attendanceDate.getUTCDay();
  if (day === 0 || day === 6) {
    throw new BadRequestException('Cannot mark attendance on weekends');
  }

  const classEntity = await this.prisma.class.findUnique({
    where: { id: classId },
    select: { academicSessionId: true },
  });

  const holidayInfo = await this.holidayService.isHoliday(
    attendanceDate,
    classEntity?.academicSessionId,
  );

  if (holidayInfo.isHoliday && !holidayInfo.isHalfDay) {
    throw new BadRequestException('Cannot mark attendance on holidays');
  }
}

  // -------------------------
  // Finders
  // -------------------------
 async findAll(
  filters: any = {},
  userId?: number,
  userRoleCode?: UserRoleString,
) {
  const where: any = {};

  // -------------------------
  // Filters
  // -------------------------
  if (filters.studentId) where.studentId = Number(filters.studentId);
  if (filters.classId) where.classId = Number(filters.classId);
  if (filters.status) where.status = filters.status;
  if (filters.subjectId) where.subjectId = Number(filters.subjectId);

  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) {
      where.date.gte = this.normalizeDateToISODate(new Date(filters.startDate));
    }
    if (filters.endDate) {
      where.date.lte = this.normalizeDateToISODate(new Date(filters.endDate));
    }
  }

  if (filters.month && filters.year) {
    const start = new Date(Number(filters.year), Number(filters.month) - 1, 1);
    const end = new Date(Number(filters.year), Number(filters.month), 0);
    where.date = {
      gte: this.normalizeDateToISODate(start),
      lte: this.normalizeDateToISODate(end),
    };
  }

  if (filters.date) {
    where.date = this.normalizeDateToISODate(new Date(filters.date));
  }

  // -------------------------
  // Role-based access
  // -------------------------
  if (userRoleCode === 'TEACHER' && userId) {
  const assignments = await this.prisma.teacherAssignment.findMany({
    where: { teacherId: userId },
    select: { classId: true, subjectId: true },
  });

  const classIds = assignments.map(a => a.classId);
  const subjectIds = assignments.map(a => a.subjectId).filter(Boolean) as number[];

  if (!classIds.length && !subjectIds.length) {
    const page = Number(filters.page) || 1;
    const pageSize = Number(filters.page_size || filters.limit) || 10;

    return {
      count: 0,
      total_pages: 0,
      current_page: page,
      next: null,
      previous: null,
      page_size: pageSize,
      data: [],
    };
  }

  where.AND = [
    {
      OR: [
        ...(classIds.length ? [{ classId: { in: classIds } }] : []),
        ...(subjectIds.length ? [{ subjectId: { in: subjectIds } }] : []),
      ],
    },
  ];
}

  // -------------------------
  // Pagination
  // -------------------------
  const page = Number(filters.page) || 1;
  const pageSize = Number(filters.page_size || filters.limit) || 10;
  const skip = (page - 1) * pageSize;

  // -------------------------
  // Queries
  // -------------------------
  const [count, data] = await this.prisma.$transaction([
    this.prisma.attendance.count({ where }),
    this.prisma.attendance.findMany({
      where,
      include: this.getAttendanceIncludes(),
      orderBy: { date: 'desc' },
      skip,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.ceil(count / pageSize);

  return {
    count,
    total_pages: totalPages,
    current_page: page,
    next:
      page < totalPages
        ? `?page=${page + 1}&page_size=${pageSize}`
        : null,
    previous:
      page > 1
        ? `?page=${page - 1}&page_size=${pageSize}`
        : null,
    page_size: pageSize,
    data,
  };
}

  async findOne(id: number, userId?: number, userRoleCode?: UserRoleString) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: this.getAttendanceIncludes(),
    });
    if (!attendance) throw new NotFoundException(`Attendance record with ID ${id} not found`);

    const resolvedRole = await this.resolveRoleCode(userId ?? 0, userRoleCode);

    if (resolvedRole === 'TEACHER') {
      const isAssigned = await this.prisma.teacherAssignment.findFirst({
        where: {
          teacherId: userId,
          classId: attendance.classId,
          ...(attendance.subjectId ? { subjectId: attendance.subjectId } : {}),
        },
      });
      if (!isAssigned) throw new ForbiddenException('Access denied to this attendance record');
    }

    if (resolvedRole === 'STUDENT' && userId !== attendance.studentId) {
      throw new ForbiddenException('You can only view your own attendance');
    }

    return attendance;
  }

  private async getHolidayForDate(
  date: Date,
  academicSessionId?: number,
) {
  return this.prisma.holiday.findFirst({
    where: {
      date,
      academicSessionId: academicSessionId ?? null,
    },
  });
}

async create(
  dto: CreateAttendanceDto,
  userId: number,
  userRoleCode?: UserRoleString,
) {
  const { studentId, classId, date, status, subjectId, remarks } = dto;

  const attendanceDate = this.normalizeDateToISODate(new Date(date));

  // 🔴 BLOCK FUTURE
  const today = this.normalizeDateToISODate(new Date());
  if (attendanceDate.getTime() > today.getTime()) {
    throw new BadRequestException('Cannot mark attendance for future dates');
  }

  // 🔴 BLOCK WEEKENDS
  const day = attendanceDate.getUTCDay();
  if (day === 0 || day === 6) {
    throw new BadRequestException('Attendance cannot be taken on weekends');
  }

  // 🔴 BLOCK DEADLINE
  if (this.isAfterDeadline(attendanceDate)) {
    throw new BadRequestException('Attendance deadline has passed');
  }

  // 🔴 GET ACADEMIC SESSION
  const classEntity = await this.prisma.class.findUnique({
    where: { id: classId },
    select: { academicSessionId: true },
  });

  // 🔴 CHECK HOLIDAY (SINGLE SOURCE)
  const holidayInfo = await this.holidayService.isHoliday(
    attendanceDate,
    classEntity?.academicSessionId,
  );

  // 🔴 FULL HOLIDAY BLOCK
  if (holidayInfo.isHoliday && !holidayInfo.isHalfDay) {
    throw new BadRequestException(
      'Attendance cannot be taken on a full holiday',
    );
  }

  // 🔴 HALF-DAY RULE
  if (holidayInfo.isHoliday && holidayInfo.isHalfDay) {
    if (!['HALF_DAY', 'PRESENT'].includes(status)) {
      throw new BadRequestException(
        'Only HALF_DAY or PRESENT allowed on a half-day holiday',
      );
    }
  }

  // 🔴 DUPLICATE BLOCK
  const existing = await this.prisma.attendance.findFirst({
    where: {
      studentId,
      classId,
      date: attendanceDate,
    },
  });

  if (existing) {
    throw new BadRequestException(
      'Attendance already exists for this date',
    );
  }

  //  CREATE
  return this.prisma.attendance.create({
    data: {
      studentId,
      classId,
      date: attendanceDate,
      status,
      remarks,
      subjectId: subjectId ?? null,
      userId,
    },
    include: this.getAttendanceIncludes(),
  });
}

async createBulk(
  dto: BulkAttendanceDto,
  userId: number,
  userRoleCode?: UserRoleString,
) {
  const { classId, date, subjectId, attendanceRecords } = dto;

  const attendanceDate = this.normalizeDateToISODate(new Date(date));

  // 🔴 COMMON RULES (weekend, holiday, future, permission)
  await this.assertCanCreateOrManageAttendance(
    classId,
    attendanceDate,
    userId,
    userRoleCode,
  );

  const studentIds = attendanceRecords.map(r => r.studentId);

  // 🔴 DUPLICATE CHECK
  const existing = await this.prisma.attendance.findMany({
    where: {
      classId,
      date: attendanceDate,
      studentId: { in: studentIds },
    },
    select: { studentId: true },
  });

  if (existing.length > 0) {
    const ids = existing.map(e => e.studentId).join(', ');
    throw new BadRequestException(
      `Attendance already exists for students: ${ids}`,
    );
  }

  // 🔴 VALIDATE STUDENTS BELONG TO CLASS
  const studentsInClass = await this.prisma.student.findMany({
    where: {
      id: { in: studentIds },
      classId,
    },
    select: { id: true },
  });

  const validIds = studentsInClass.map(s => s.id);
  const invalidIds = studentIds.filter(id => !validIds.includes(id));

  if (invalidIds.length > 0) {
    throw new BadRequestException(
      `Students not found in class: ${invalidIds.join(', ')}`,
    );
  }

  // ✅ CREATE ATTENDANCE (NO HOLIDAY OVERRIDES)
  const creates = attendanceRecords.map(record => {
    return this.prisma.attendance.create({
      data: {
        studentId: record.studentId,
        classId,
        date: attendanceDate,
        status: record.status as AttendanceStatus,
        remarks: record.remarks ?? null,
        subjectId: subjectId ?? null,
        userId,
      },
    });
  });

  const created = await this.prisma.$transaction(creates);

  // 🔔 SUMMARY UPDATE & NOTIFICATIONS
  for (const record of attendanceRecords) {
    await this.updateAttendanceSummary(
      record.studentId,
      classId,
      attendanceDate,
    ).catch(err => this.logger.error(err));

    if ((record.status as string) === 'ABSENT') {
      await this.notificationService
        .create({
          userId,
          studentId: record.studentId,
          type: NotificationType.ATTENDANCE,
          title: 'Attendance Alert',
          message: `Student was marked ABSENT on ${attendanceDate
            .toISOString()
            .split('T')[0]}`,
        })
        .catch(err => this.logger.error(err));
    }
  }

  // 🧾 AUDIT LOG
  await this.auditService
    .log('attendance.bulk_create', {
      count: created.length,
      createdBy: userId,
      classId,
      date: attendanceDate,
    })
    .catch(err => this.logger.error(err));

  return created;
}

  // -------------------------
  // CSV parser helper
  // -------------------------
  async createFromCsv(buffer: Buffer, classId: number, date: Date, subjectId?: number, userId?: number, userRoleCode?: UserRoleString) {
    const text = buffer.toString('utf8');
    const rows = text.split(/\r?\n/).map(r => r.trim()).filter(Boolean);
    if (rows.length <= 1) throw new BadRequestException('CSV has no data rows');

    const header = rows[0].split(',').map(h => h.trim().toLowerCase());
    const dataRows = rows.slice(1);
    const attendanceRecords = dataRows.map(line => {
      const cols = line.split(',').map(c => c.trim());
      const obj: Record<string, string> = {};
      header.forEach((h, i) => (obj[h] = cols[i] ?? ''));

      return {
        studentId: Number(obj['studentid'] ?? obj['student_id'] ?? obj['student'] ?? obj['id']),
        status: (obj['status'] || '').toUpperCase() as AttendanceStatus,
        remarks: obj['remarks'] ?? undefined,
      };
    });

    const dto: BulkAttendanceDto = {
      classId,
      date: date.toISOString(),
      subjectId,
      attendanceRecords,
    } as any;

    // Forward to createBulk and use authenticated userId & role
    return this.createBulk(dto, userId ?? 0, userRoleCode);
  }

  // -------------------------
  // Update & Delete
  // -------------------------
  async update(id: number, dto: UpdateAttendanceDto, userId: number, userRoleCode?: UserRoleString) {
    const existing = await this.prisma.attendance.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Attendance not found');

    // resolve role code (prefer provided role code)
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    const roleCode = (userRoleCode ?? user?.role?.code)?.toString().toUpperCase();

    if (roleCode !== 'SUPER_ADMIN' && roleCode !== 'ADMIN') {
      if (roleCode === 'TEACHER') {
        const isAssigned = await this.prisma.teacherAssignment.findFirst({
          where: { teacherId: userId, classId: existing.classId, ...(existing.subjectId ? { subjectId: existing.subjectId } : {}) },
        });
        if (!isAssigned) throw new ForbiddenException('You are not assigned to this class/subject');
      } else if (roleCode === 'STUDENT') {
        if (userId !== existing.studentId) throw new ForbiddenException('Students can only modify their own records');
      } else {
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    const attendanceDate = this.normalizeDateToISODate(new Date(existing.date));
    const today = this.normalizeDateToISODate(new Date());
    if (attendanceDate.getTime() !== today.getTime() && roleCode !== 'SUPER_ADMIN' && roleCode !== 'ADMIN') {
      throw new BadRequestException('Can only edit attendance on the same day unless you are an administrator');
    }

    const updateData: any = {
      ...(dto.status ? { status: dto.status as AttendanceStatus } : {}),
      ...(dto.remarks !== undefined ? { remarks: dto.remarks } : {}),
      updatedAt: new Date(),
    };
    if (Object.prototype.hasOwnProperty.call(dto, 'subjectId')) {
      updateData.subjectId = (dto as any).subjectId;
    }

    const updated = await this.prisma.attendance.update({
      where: { id },
      data: updateData,
      include: this.getAttendanceIncludes(),
    });

    await this.updateAttendanceSummary(updated.studentId, updated.classId, updated.date).catch(e => this.logger.error(e));
    await this.auditService.log('attendance.update', { attendanceId: id, updatedBy: userId }).catch(e => this.logger.error(e));

    return updated;
  }

  async remove(id: number, userId: number, userRoleCode?: UserRoleString) {
    const existing = await this.prisma.attendance.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Attendance not found');

    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    const roleCode = (userRoleCode ?? user?.role?.code)?.toString().toUpperCase();

    if (!user || (roleCode !== 'ADMIN' && roleCode !== 'SUPER_ADMIN')) {
      throw new ForbiddenException('Only administrators can delete attendance records');
    }

    const today = this.normalizeDateToISODate(new Date());
    const daysDiff = (today.getTime() - this.normalizeDateToISODate(new Date(existing.date)).getTime()) / (1000 * 3600 * 24);
    if (daysDiff > 7) throw new BadRequestException('Cannot delete attendance records older than 7 days');

    const deleted = await this.prisma.attendance.delete({ where: { id } });
    await this.updateAttendanceSummary(deleted.studentId, deleted.classId, deleted.date).catch(e => this.logger.error(e));
    await this.auditService.log('attendance.delete', { attendanceId: id, deletedBy: userId }).catch(e => this.logger.error(e));

    return deleted;
  }

  // -------------------------
  // Student / Class helpers & Reports (unchanged logic)
  // -------------------------
  async getStudentAttendance(studentId: number, startDate?: Date, endDate?: Date, userId?: number, userRoleCode?: UserRoleString) {
    if (userRoleCode === 'STUDENT' && userId !== studentId) throw new ForbiddenException('You can only view your own attendance');

    if (userRoleCode === 'TEACHER') {
      const student = await this.prisma.student.findUnique({ where: { id: studentId }, select: { classId: true } });
      if (student) {
        const isAssigned = await this.prisma.teacherAssignment.findFirst({ where: { teacherId: userId, classId: student.classId } });
        if (!isAssigned) throw new ForbiddenException('You are not assigned to this student\'s class');
      }
    }

    const where: any = { studentId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = this.normalizeDateToISODate(startDate);
      if (endDate) where.date.lte = this.normalizeDateToISODate(endDate);
    }

    return this.prisma.attendance.findMany({ where, include: this.getAttendanceIncludes(), orderBy: { date: 'desc' } });
  }

  async getClassAttendanceByDate(classId: number, date: Date, userId?: number, userRoleCode?: UserRoleString) {
    if (userRoleCode === 'TEACHER') {
      const isAssigned = await this.prisma.teacherAssignment.findFirst({ where: { teacherId: userId, classId } });
      if (!isAssigned) throw new ForbiddenException('You are not assigned to this class');
    }

    const d = this.normalizeDateToISODate(date);
    return this.prisma.attendance.findMany({ where: { classId, date: d }, include: this.getAttendanceIncludes(), orderBy: { student: { firstName: 'asc' } } });
  }
private async calculateWorkingDays(
  startDate: Date,
  endDate: Date,
  academicSessionId?: number,
) {
  let count = 0;
  const cur = new Date(this.normalizeDateToISODate(startDate));
  const end = this.normalizeDateToISODate(endDate);

  while (cur <= end) {
    const day = cur.getUTCDay();

    if (day !== 0 && day !== 6) {
      const holidayInfo = await this.holidayService.isHoliday(
        cur,
        academicSessionId,
      );

      if (!holidayInfo.isHoliday) {
        count++;
      }
    }

    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  return count;
}

  async generateAttendanceReport(classId: number, month: number, year: number, userId?: number, userRoleCode?: UserRoleString) {
    if (userRoleCode === 'TEACHER') {
      const isAssigned = await this.prisma.teacherAssignment.findFirst({ where: { teacherId: userId, classId } });
      if (!isAssigned) throw new ForbiddenException('You are not assigned to this class');
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const students = await this.prisma.student.findMany({
      where: { classId },
      select: { id: true, firstName: true, lastName: true, studentId: true, email: true },
    });

    const attendance = await this.prisma.attendance.findMany({
      where: { classId, date: { gte: this.normalizeDateToISODate(startDate), lte: this.normalizeDateToISODate(endDate) } },
      include: { student: { select: { id: true, firstName: true, lastName: true } } },
    });

    const workingDays = await this.calculateWorkingDays(startDate, endDate);

    const studentSummaries = students.map(s => {
      const sAttendance = attendance.filter(a => a.studentId === s.id);
      const present = sAttendance.filter(a => (a.status as string) === 'PRESENT').length;
      const absent = sAttendance.filter(a => (a.status as string) === 'ABSENT').length;
      const late = sAttendance.filter(a => (a.status as string) === 'LATE').length;
      const halfDay = sAttendance.filter(a => (a.status as string) === 'HALF_DAY').length;
      const percentage = workingDays > 0 ? (present / workingDays) * 100 : 0;
      return { student: s, summary: { totalDays: workingDays, present, absent, late, halfDay, percentage }, attendance: sAttendance };
    });

    const totalPresent = studentSummaries.reduce((sum, s) => sum + s.summary.present, 0);
    const totalPossible = studentSummaries.length * workingDays;
    const classPercentage = totalPossible > 0 ? (totalPresent / totalPossible) * 100 : 0;

    return {
      classId,
      month,
      year,
      period: { startDate, endDate, workingDays },
      overallSummary: { totalStudents: students.length, totalPresent, totalPossible, classPercentage: Math.round(classPercentage * 100) / 100 },
      studentSummaries,
      generatedAt: new Date(),
    };
  }

  async getStudentAttendanceSummary(studentId: number, startDate?: Date, endDate?: Date) {
    const where: any = { studentId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = this.normalizeDateToISODate(startDate);
      if (endDate) where.date.lte = this.normalizeDateToISODate(endDate);
    }

    const attendance = await this.prisma.attendance.findMany({ where, select: { status: true, date: true } });

    const present = attendance.filter(a => (a.status as string) === 'PRESENT').length;
    const absent = attendance.filter(a => (a.status as string) === 'ABSENT').length;
    const late = attendance.filter(a => (a.status as string) === 'LATE').length;
    const halfDay = attendance.filter(a => (a.status as string) === 'HALF_DAY').length;
    const total = attendance.length;
    const percentage = total > 0 ? (present / total) * 100 : 0;

    return { studentId, period: { startDate, endDate }, summary: { totalDays: total, present, absent, late, halfDay, percentage }, totalRecords: total };
  }

  async getAttendanceForParent(parentUserId: number) {
  const parent = await this.prisma.parent.findUnique({
    where: { userId: parentUserId },
    include: {
      students: true,
    },
  });

  if (!parent) return [];

  return this.prisma.attendance.findMany({
    where: {
      studentId: {
        in: parent.students.map(s => s.id),
      },
    },
    select: {
      date: true,
      status: true,
      student: {
        select: {
          firstName: true,
        },
      },
    },
    orderBy: { date: 'desc' },
    take: 30, // last 30 records
  });
}

  private async updateAttendanceSummary(studentId: number, classId: number, date: Date) {
    try {
      const month = date.getUTCMonth() + 1;
      const year = date.getUTCFullYear();

      const currentSession = await this.prisma.academicSession.findFirst({
        where: {
          startDate: { lte: date },
          endDate: { gte: date },
          isActive: true,
        },
      });

      if (!currentSession) {
        this.logger.warn(`No active academic session found for date: ${date.toISOString()}`);
        return;
      }

      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 0));

      const monthlyAttendance = await this.prisma.attendance.findMany({
        where: { studentId, classId, date: { gte: start, lte: end } },
      });

      const presentDays = monthlyAttendance.filter(a => (a.status as string) === 'PRESENT').length;
      const absentDays = monthlyAttendance.filter(a => (a.status as string) === 'ABSENT').length;
      const lateDays = monthlyAttendance.filter(a => (a.status as string) === 'LATE').length;
      const halfDays = monthlyAttendance.filter(a => (a.status as string) === 'HALF_DAY').length;
      const totalDays = monthlyAttendance.length;
      const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

      const existingSummary = await this.prisma.attendanceSummary.findFirst({
        where: { studentId, classId, academicSessionId: currentSession.id, month, year },
      });

      if (existingSummary) {
        await this.prisma.attendanceSummary.update({
          where: { id: existingSummary.id },
          data: { totalDays, presentDays, absentDays, lateDays, halfDays, percentage, updatedAt: new Date() },
        });
      } else {
        await this.prisma.attendanceSummary.create({
          data: {
            studentId,
            classId,
            academicSessionId: currentSession.id,
            month,
            year,
            totalDays,
            presentDays,
            absentDays,
            lateDays,
            halfDays,
            percentage,
          },
        });
      }

      this.logger.log(`Attendance summary updated for student ${studentId}, month ${month}, year ${year}`);
    } catch (error: any) {
      this.logger.error(`Failed to update attendance summary: ${error?.message ?? error}`);
    }
  }
async markAbsent(studentId: number, date: Date) {
  const attendanceDate = this.normalizeDateToISODate(date);

  // 1️⃣ Student exists
  const student = await this.prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true, classId: true },
  });

  if (!student) {
    throw new NotFoundException('Student not found');
  }

  // 2️⃣ Prevent duplicates
  const existing = await this.prisma.attendance.findFirst({
    where: {
      studentId,
      date: attendanceDate,
    },
  });

  if (existing) {
    throw new BadRequestException('Attendance already recorded');
  }

  // 3️⃣ Create attendance (REQUIRED relations)
  await this.prisma.attendance.create({
    data: {
      date: attendanceDate,
      status: AttendanceStatus.ABSENT,
      student: {
        connect: { id: studentId },
      },
      class: {
        connect: { id: student.classId },
      },
    },
  });

  // 4️⃣ Notify parents
  await this.notifyParentsForAbsence(studentId, attendanceDate);

  return {
    message: 'Student marked absent and parents notified',
  };
}


  private async notifyParentsForAbsence(
  studentId: number,
  attendanceDate: Date,
) {
  const parentLinks = await this.prisma.studentParent.findMany({
    where: { studentId },
    include: {
      parent: {
        include: { user: true },
      },
    },
  });

  if (!parentLinks.length) return;

  for (const link of parentLinks) {
    const parentUser = link.parent?.user;
    if (!parentUser) continue;

    await this.notificationService.create({
      userId: parentUser.id,
      studentId,
      type: NotificationType.ATTENDANCE,
      title: 'Attendance Alert',
      message: `Your child was marked ABSENT on ${attendanceDate
        .toISOString()
        .split('T')[0]}`,
      sendEmail: false,
      email: parentUser.email,
    });
  }
}

}
