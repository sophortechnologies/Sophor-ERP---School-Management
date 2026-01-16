// src/modules/staff-attendance/staff-attendance.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  MarkStaffAttendanceDto,
  UpdateStaffAttendanceDto,
  GetStaffAttendanceDto,
} from './dto';
import { HolidayService } from '../holiday/holiday.service';
@Injectable()
export class StaffAttendanceService {
  constructor(private readonly prisma: PrismaService,
  private readonly holidayService: HolidayService,

  ) 
  {}


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

  /* ================= MARK STAFF ATTENDANCE ================= */

  async markAttendance(
    dto: MarkStaffAttendanceDto,
    recordedById: number,
  ) {
    const attendanceDate = this.normalizeDate(dto.date);

    // 🔴 BLOCK FUTURE
    const today = this.normalizeDate(new Date());
    if (attendanceDate.getTime() > today.getTime()) {
      throw new BadRequestException(
        'Cannot mark attendance for future dates',
      );
    }

    // 🔴 BLOCK WEEKENDS
    const day = attendanceDate.getUTCDay();
    if (day === 0 || day === 6) {
      throw new BadRequestException(
        'Staff attendance cannot be taken on weekends',
      );
    }

    // 🔴 BLOCK DEADLINE (72 HOURS)
    if (this.isAfterDeadline(attendanceDate)) {
      throw new BadRequestException(
        'Attendance deadline has passed',
      );
    }

    // 🔴 CHECK HOLIDAY (SINGLE SOURCE — STAFF USES NULL SESSION)
    const holidayInfo = await this.holidayService.isHoliday(
      attendanceDate,
      undefined, // 👈 IMPORTANT: staff has NO academicSessionId
    );

    // 🔴 FULL HOLIDAY BLOCK
    if (holidayInfo.isHoliday && !holidayInfo.isHalfDay) {
      throw new BadRequestException(
        'Staff attendance cannot be taken on a holiday',
      );
    }

    // 🔴 HALF-DAY RULE (OPTIONAL, CONSISTENT)
    if (holidayInfo.isHoliday && holidayInfo.isHalfDay) {
      if (!['HALF_DAY', 'PRESENT'].includes(dto.status)) {
        throw new BadRequestException(
          'Only HALF_DAY or PRESENT allowed on a half-day holiday',
        );
      }
    }

    // 🔴 DUPLICATE BLOCK
    const existing =
      await this.prisma.staffAttendance.findUnique({
        where: {
          userId_date: {
            userId: dto.userId,
            date: attendanceDate,
          },
        },
      });

    if (existing) {
      throw new BadRequestException(
        'Attendance already marked for this staff member on this date.',
      );
    }

    // ✅ CREATE (LAST STEP)
    return this.prisma.staffAttendance.create({
      data: {
        userId: dto.userId,
        date: attendanceDate,
        status: dto.status,
        remarks: dto.remarks || null,
        recordedBy: recordedById,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        recorder: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
  // Fixed: Only 2 parameters, no checkIn/checkOut fields
  async updateAttendance(id: number, dto: UpdateStaffAttendanceDto) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found.');
    }

    let remarks = dto.remarks?.trim();
    if (dto.checkIn || dto.checkOut) {
      const timeNote = `Check-in: ${dto.checkIn || 'N/A'}, Check-out: ${dto.checkOut || 'N/A'}`;
      remarks = remarks ? `${remarks} | ${timeNote}` : timeNote;
    }

    return this.prisma.attendance.update({
      where: { id },
      data: {
        status: dto.status ? (dto.status as any) : undefined,
        remarks: remarks ?? undefined,
      },
      include: {
        User: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });
  }
  async getAttendance(dto: GetStaffAttendanceDto) {
    const {
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = dto;

    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};

      if (startDate) {
        where.date.gte = new Date(`${startDate}T00:00:00.000Z`);
      }

      if (endDate) {
        where.date.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const skip = (page - 1) * limit;

    const [records, count] = await this.prisma.$transaction([
      this.prisma.staffAttendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              role: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      }),
      this.prisma.staffAttendance.count({ where }),
    ]);

    const totalPages = Math.ceil(count / limit);

    return {
      count,
      total_pages: totalPages,
      current_page: page,
      next:
        page < totalPages
          ? `http://localhost:5000/staff-attendance/user/${userId}?page=${page + 1}&page_size=${limit}`
          : null,
      previous:
        page > 1
          ? `http://localhost:5000/staff-attendance/user/${userId}?page=${page - 1}&page_size=${limit}`
          : null,
      page_size: limit,
      data: records.map((record) => ({
        attendanceId: record.id,
        date: record.date,
        status: record.status,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        remarks: record.remarks,
        user: {
          id: record.user.id,
          firstName: record.user.firstName,
          lastName: record.user.lastName,
          email: record.user.email,
          phone: record.user.phone,
          role: record.user.role,
          createdAt: record.user.createdAt,
          updatedAt: record.user.updatedAt,
        },
      })),
    };
  }

  async getTodaySummary(schoolDate?: string) {
    const baseDate = schoolDate
      ? new Date(`${schoolDate}T00:00:00.000Z`)
      : new Date();

    const start = new Date(baseDate);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(baseDate);
    end.setUTCHours(23, 59, 59, 999);

    const [summaryRaw, totalActiveStaff] = await Promise.all([
      this.prisma.staffAttendance.groupBy({
        by: ['status'],
        where: {
          date: { gte: start, lte: end },
        },
        _count: { status: true },
      }),
      this.prisma.user.count({
        where: {
          isActive: true,
          role: { name: { in: ['TEACHER', 'STAFF', 'ADMIN'] } },
        },
      }),
    ]);

    const breakdown = summaryRaw.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    const present = breakdown['PRESENT'] || 0;
    const absent = totalActiveStaff - present;

    return {
      date: start.toISOString().split('T')[0],
      totalStaff: totalActiveStaff,
      present,
      absent,
      breakdown,
    };
  }

  // DELETE attendance
async deleteAttendance(id: number) {
  // 1️⃣ Check existence
  const attendance = await this.prisma.staffAttendance.findUnique({
    where: { id },
  });

  if (!attendance) {
    throw new NotFoundException('Attendance record not found');
  }

  // 2️⃣ Deadline protection (72-hour rule)
  if (this.isAfterDeadline(attendance.date)) {
  throw new BadRequestException(
    'Attendance cannot be deleted after 72 hours',
  );
}


  // 3️⃣ Delete record
  return this.prisma.staffAttendance.delete({
    where: { id },
  });
}

}