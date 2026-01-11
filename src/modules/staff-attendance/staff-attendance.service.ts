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

@Injectable()
export class StaffAttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeDate(dateStr: string): Date {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date;
  }
async markAttendance(
  dto: MarkStaffAttendanceDto,
  recordedById: number,
) {
  const date = this.normalizeDate(dto.date);

  const existing = await this.prisma.staffAttendance.findUnique({
    where: {
      userId_date: {
        userId: dto.userId,
        date,
      },
    },
  });

  if (existing) {
    throw new BadRequestException(
      'Attendance already marked for this staff member on this date.',
    );
  }

  return this.prisma.staffAttendance.create({
    data: {
      userId: dto.userId,
      date,
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
    if (startDate) where.date.gte = this.normalizeDate(startDate);
    if (endDate) where.date.lte = this.normalizeDate(endDate);
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
      id: record.user.id,
      first_name: record.user.firstName,
      last_name: record.user.lastName,
      email: record.user.email,
      phone: record.user.phone,
      role: record.user.role,
      createdAt: record.user.createdAt,
      updatedAt: record.user.updatedAt,
    })),
  };
}

  async getTodaySummary(schoolDate?: string) {
    const today = schoolDate
      ? this.normalizeDate(schoolDate)
      : this.normalizeDate(new Date().toISOString().split('T')[0]);

    const STAFF_CLASS_ID = 0;

    const [summaryRaw, totalActiveStaff] = await Promise.all([
      this.prisma.attendance.groupBy({
        by: ['status'],
        where: {
          classId: STAFF_CLASS_ID,
          date: today,
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
      date: today.toISOString().split('T')[0],
      totalStaff: totalActiveStaff,
      present,
      absent,
      breakdown,
    };
  }
}