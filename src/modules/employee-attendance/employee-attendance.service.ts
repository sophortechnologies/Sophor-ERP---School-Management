import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { HolidayService } from '../holiday/holiday.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { AttendanceStatus } from './enums/attendance-status.enum';
import {
  AttendanceSummary,
  MonthlyAttendanceReport,
  EmployeeAttendanceDetail,
} from './interfaces/attendance.interface';

@Injectable()
export class EmployeeAttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly holidayService: HolidayService,
  ) {}

  private normalizeDate(date: Date | string): Date {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  private isAfterDeadline(attendanceDate: Date): boolean {
    const now = new Date();
    const deadline = new Date(attendanceDate);
    deadline.setUTCHours(72, 0, 0, 0);
    return now > deadline;
  }

  async markAttendance(dto: MarkAttendanceDto, recordedById: number) {
    const attendanceDate = this.normalizeDate(dto.date);
    const today = this.normalizeDate(new Date());

    if (attendanceDate > today) {
      throw new BadRequestException('Cannot mark attendance for future dates');
    }

    const day = attendanceDate.getUTCDay();
    if (day === 0 || day === 6) {
      throw new BadRequestException('Attendance cannot be taken on weekends');
    }

    if (this.isAfterDeadline(attendanceDate)) {
      throw new BadRequestException('Attendance deadline has passed (72 hours)');
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (employee.status !== 'ACTIVE') {
      throw new BadRequestException('Cannot mark attendance for inactive employee');
    }

    const holidayInfo = await this.holidayService.isHoliday(attendanceDate, undefined);

    if (holidayInfo.isHoliday && !holidayInfo.isHalfDay) {
      throw new BadRequestException('Cannot mark attendance on a holiday');
    }

    if (holidayInfo.isHoliday && holidayInfo.isHalfDay) {
      if (!['HALF_DAY', 'PRESENT'].includes(dto.status)) {
        throw new BadRequestException('Only HALF_DAY or PRESENT allowed on half-day holiday');
      }
    }

    const existing = await this.prisma.employeeAttendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: dto.employeeId,
          date: attendanceDate,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Attendance already marked for this employee on this date');
    }

    const attendance = await this.prisma.employeeAttendance.create({
      data: {
        employeeId: dto.employeeId,
        date: attendanceDate,
        status: dto.status,
        checkIn: dto.checkIn ? new Date(dto.checkIn) : null,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : null,
        lateBy: dto.lateMinutes,
        remarks: dto.remarks,
        recordedBy: recordedById,
      },
      include: {
        employee: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
            teacher: true,
            staff: true,
          },
        },
      },
    });

    return attendance;
  }

  async updateAttendance(id: number, dto: UpdateAttendanceDto) {
    const attendance = await this.prisma.employeeAttendance.findUnique({
      where: { id },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    if (this.isAfterDeadline(attendance.date)) {
      throw new BadRequestException('Cannot update attendance after 72 hours');
    }

    return this.prisma.employeeAttendance.update({
      where: { id },
      data: {
        status: dto.status,
        checkIn: dto.checkIn ? new Date(dto.checkIn) : undefined,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : undefined,
        lateBy: dto.lateMinutes,
        remarks: dto.remarks,
      },
      include: {
        employee: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async getAttendance(query: AttendanceQueryDto) {
    const where: any = {};

    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.status) where.status = query.status;

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = this.normalizeDate(query.startDate);
      if (query.endDate) where.date.lte = this.normalizeDate(query.endDate);
    }

    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 50);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.employeeAttendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          employee: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true } },
              department: true,
            },
          },
        },
      }),
      this.prisma.employeeAttendance.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      count: total,
      total_pages: totalPages,
      current_page: page,
      page_size: limit,
      data,
    };
  }

  async getTodaySummary(): Promise<AttendanceSummary> {
    const today = this.normalizeDate(new Date());

    const holidayInfo = await this.holidayService.isHoliday(today, undefined);

    const [summaryRaw, totalEmployees] = await Promise.all([
      this.prisma.employeeAttendance.groupBy({
        by: ['status'],
        where: { date: today },
        _count: { status: true },
      }),
      this.prisma.employee.count({
        where: { status: 'ACTIVE' },
      }),
    ]);

    const breakdown: Record<string, number> = {
      PRESENT: 0,
      ABSENT: 0,
      LATE: 0,
      HALF_DAY: 0,
      LEAVE: 0,
    };

    for (const item of summaryRaw) {
      breakdown[item.status] = item._count.status;
    }

    const present = breakdown.PRESENT + breakdown.HALF_DAY;
    const absent = totalEmployees - present - breakdown.LEAVE;

    return {
      date: today.toISOString().split('T')[0],
      totalEmployees,
      present,
      absent,
      late: breakdown.LATE,
      halfDay: breakdown.HALF_DAY,
      onLeave: breakdown.LEAVE,
      attendancePercentage: totalEmployees > 0 ? (present / totalEmployees) * 100 : 0,
    };
  }

  async getMonthlyReport(year: number, month: number, departmentId?: number): Promise<MonthlyAttendanceReport> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const employees = await this.prisma.employee.findMany({
      where: {
        status: 'ACTIVE',
        ...(departmentId && { departmentId }),
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        department: true,
      },
    });

    const attendances = await this.prisma.employeeAttendance.findMany({
      where: {
        employeeId: { in: employees.map(e => e.id) },
        date: { gte: startDate, lte: endDate },
      },
    });

    const totalWorkingDays = await this.calculateWorkingDays(startDate, endDate);

    const details: EmployeeAttendanceDetail[] = employees.map(emp => {
      const empAttendance = attendances.filter(a => a.employeeId === emp.id);

      const present = empAttendance.filter(a => a.status === 'PRESENT').length;
      const absent = empAttendance.filter(a => a.status === 'ABSENT').length;
      const late = empAttendance.filter(a => a.status === 'LATE').length;
      const halfDay = empAttendance.filter(a => a.status === 'HALF_DAY').length;
      const onLeave = empAttendance.filter(a => a.status === 'LEAVE').length;

      const percentage = totalWorkingDays > 0
        ? ((present + halfDay * 0.5) / totalWorkingDays) * 100
        : 0;

      return {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        name: `${emp.user.firstName} ${emp.user.lastName}`,
        employeeType: emp.employeeType,
        department: emp.department?.name || 'Not Assigned',
        attendance: {
          present,
          absent,
          late,
          halfDay,
          onLeave,
          totalWorkingDays,
          percentage: Math.round(percentage * 100) / 100,
        },
      };
    });

    const summary = {
      totalPresent: details.reduce((sum, d) => sum + d.attendance.present, 0),
      totalAbsent: details.reduce((sum, d) => sum + d.attendance.absent, 0),
      totalLate: details.reduce((sum, d) => sum + d.attendance.late, 0),
      averagePercentage: details.length > 0
        ? details.reduce((sum, d) => sum + d.attendance.percentage, 0) / details.length
        : 0,
    };

    return {
      year,
      month,
      totalWorkingDays,
      totalEmployees: employees.length,
      summary,
      details,
    };
  }

  private async calculateWorkingDays(startDate: Date, endDate: Date): Promise<number> {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const day = current.getUTCDay();
      if (day !== 0 && day !== 6) {
        const holidayInfo = await this.holidayService.isHoliday(current, undefined);
        if (!holidayInfo.isHoliday) {
          count++;
        }
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }

    return count;
  }

  async deleteAttendance(id: number) {
    const attendance = await this.prisma.employeeAttendance.findUnique({
      where: { id },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    if (this.isAfterDeadline(attendance.date)) {
      throw new BadRequestException('Cannot delete attendance after 72 hours');
    }

    await this.prisma.employeeAttendance.delete({ where: { id } });

    return { message: 'Attendance record deleted successfully' };
  }
}