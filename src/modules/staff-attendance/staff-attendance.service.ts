// import {
//   Injectable,
//   BadRequestException,
//   NotFoundException,
//   ForbiddenException,
// } from '@nestjs/common';
// import { PrismaService } from '../../database/prisma.service';
// import {
//   MarkStaffAttendanceDto,
//   UpdateStaffAttendanceDto,
//   GetStaffAttendanceDto,
// } from './dto';
// import { HolidayService } from '../holiday/holiday.service';

// @Injectable()
// export class StaffAttendanceService {
//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly holidayService: HolidayService,
//   ) {}

//   private normalizeDate(date: Date | string): Date {
//     const d = new Date(date);
//     d.setUTCHours(0, 0, 0, 0);
//     return d;
//   }

//   private isAfterDeadline(attendanceDate: Date): boolean {
//     const now = new Date();
//     const deadline = new Date(attendanceDate);
//     deadline.setUTCHours(72, 0, 0, 0);
//     return now > deadline;
//   }

//   async markAttendance(dto: MarkStaffAttendanceDto, recordedById: number) {
//     const attendanceDate = this.normalizeDate(dto.date);
//     const today = this.normalizeDate(new Date());

//     if (attendanceDate.getTime() > today.getTime()) {
//       throw new BadRequestException('Cannot mark attendance for future dates');
//     }

//     const day = attendanceDate.getUTCDay();
//     if (day === 0 || day === 6) {
//       throw new BadRequestException('Attendance cannot be taken on weekends');
//     }

//     if (this.isAfterDeadline(attendanceDate)) {
//       throw new BadRequestException('Attendance deadline has passed (72 hours)');
//     }

//     const holidayInfo = await this.holidayService.isHoliday(attendanceDate, undefined);

//     if (holidayInfo.isHoliday && !holidayInfo.isHalfDay) {
//       throw new BadRequestException('Cannot mark attendance on a holiday');
//     }

//     if (holidayInfo.isHoliday && holidayInfo.isHalfDay) {
//       if (!['HALF_DAY', 'PRESENT'].includes(dto.status)) {
//         throw new BadRequestException('Only HALF_DAY or PRESENT allowed on half-day holiday');
//       }
//     }

//     const staff = await this.prisma.staff.findUnique({
//       where: { userId: dto.userId },
//     });

//     if (!staff) {
//       throw new NotFoundException('Staff member not found');
//     }

//     if (staff.status !== 'ACTIVE') {
//       throw new BadRequestException('Cannot mark attendance for inactive staff');
//     }

//     const existing = await this.prisma.staffAttendance.findUnique({
//       where: {
//         userId_date: {
//           userId: dto.userId,
//           date: attendanceDate,
//         },
//       },
//     });

//     if (existing) {
//       throw new BadRequestException('Attendance already marked for this staff member on this date');
//     }

//     const attendance = await this.prisma.staffAttendance.create({
//       data: {
//         userId: dto.userId,
//         date: attendanceDate,
//         status: dto.status,
//         checkIn: dto.checkIn ? new Date(dto.checkIn) : null,
//         checkOut: dto.checkOut ? new Date(dto.checkOut) : null,
//         remarks: dto.remarks || null,
//         recordedBy: recordedById,
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             firstName: true,
//             lastName: true,
//             username: true,
//             email: true,
//           },
//         },
//         recorder: {
//           select: {
//             id: true,
//             firstName: true,
//             lastName: true,
//           },
//         },
//       },
//     });

//     return attendance;
//   }

//   async updateAttendance(id: number, dto: UpdateStaffAttendanceDto) {
//     const attendance = await this.prisma.staffAttendance.findUnique({
//       where: { id },
//     });

//     if (!attendance) {
//       throw new NotFoundException('Attendance record not found');
//     }

//     if (this.isAfterDeadline(attendance.date)) {
//       throw new BadRequestException('Cannot update attendance after 72 hours');
//     }

//     return this.prisma.staffAttendance.update({
//       where: { id },
//       data: {
//         status: dto.status,
//         checkIn: dto.checkIn ? new Date(dto.checkIn) : undefined,
//         checkOut: dto.checkOut ? new Date(dto.checkOut) : undefined,
//         remarks: dto.remarks,
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             firstName: true,
//             lastName: true,
//             username: true,
//           },
//         },
//       },
//     });
//   }

//   async deleteAttendance(id: number) {
//     const attendance = await this.prisma.staffAttendance.findUnique({
//       where: { id },
//     });

//     if (!attendance) {
//       throw new NotFoundException('Attendance record not found');
//     }

//     if (this.isAfterDeadline(attendance.date)) {
//       throw new BadRequestException('Cannot delete attendance after 72 hours');
//     }

//     await this.prisma.staffAttendance.delete({
//       where: { id },
//     });

//     return { message: 'Attendance record deleted successfully' };
//   }

//   async getAttendance(dto: GetStaffAttendanceDto, baseUrl?: string) {
//     const {
//       userId,
//       startDate,
//       endDate,
//       // status,
//       page = 1,
//       limit = 10,
//     } = dto;

//     const where: any = { userId };

//     if (startDate || endDate) {
//       where.date = {};
//       if (startDate) {
//         where.date.gte = this.normalizeDate(new Date(startDate));
//       }
//       if (endDate) {
//         where.date.lte = this.normalizeDate(new Date(endDate));
//       }
//     }

//     if (status) {
//       where.status = status;
//     }

//     const skip = (page - 1) * limit;
//     const take = Math.min(limit, 50);

//     const [records, count] = await Promise.all([
//       this.prisma.staffAttendance.findMany({
//         where,
//         skip,
//         take,
//         orderBy: { date: 'desc' },
//         include: {
//           user: {
//             select: {
//               id: true,
//               firstName: true,
//               lastName: true,
//               email: true,
//               phone: true,
//             },
//           },
//           recorder: {
//             select: {
//               id: true,
//               firstName: true,
//               lastName: true,
//             },
//           },
//         },
//       }),
//       this.prisma.staffAttendance.count({ where }),
//     ]);

//     const totalPages = Math.ceil(count / take);

//     const response: any = {
//       count,
//       total_pages: totalPages,
//       current_page: page,
//       page_size: take,
//       data: records,
//     };

//     if (baseUrl && totalPages > 0) {
//       if (page < totalPages) {
//         response.next = `${baseUrl}?page=${page + 1}&limit=${take}`;
//       }
//       if (page > 1) {
//         response.previous = `${baseUrl}?page=${page - 1}&limit=${take}`;
//       }
//     }

//     return response;
//   }

//   async getTodaySummary(schoolDate?: string) {
//     const baseDate = schoolDate ? new Date(schoolDate) : new Date();
//     const start = this.normalizeDate(baseDate);
//     const end = new Date(start);
//     end.setUTCHours(23, 59, 59, 999);

//     const holidayInfo = await this.holidayService.isHoliday(start, undefined);

//     const [summaryRaw, totalActiveStaff] = await Promise.all([
//       this.prisma.staffAttendance.groupBy({
//         by: ['status'],
//         where: {
//           date: { gte: start, lte: end },
//         },
//         _count: { status: true },
//       }),
//       this.prisma.staff.count({
//         where: { status: 'ACTIVE' },
//       }),
//     ]);

//     const breakdown: Record<string, number> = {
//       PRESENT: 0,
//       ABSENT: 0,
//       LATE: 0,
//       HALF_DAY: 0,
//       LEAVE: 0,
//     };

//     for (const item of summaryRaw) {
//       breakdown[item.status] = item._count.status;
//     }

//     const present = breakdown.PRESENT + breakdown.HALF_DAY;
//     const absent = totalActiveStaff - present - breakdown.LEAVE;

//     return {
//       date: start.toISOString().split('T')[0],
//       isHoliday: holidayInfo.isHoliday,
//       holidayName: holidayInfo.holidayName,
//       isHalfDay: holidayInfo.isHalfDay,
//       totalStaff: totalActiveStaff,
//       present,
//       absent,
//       onLeave: breakdown.LEAVE,
//       late: breakdown.LATE,
//       halfDay: breakdown.HALF_DAY,
//       attendancePercentage: totalActiveStaff > 0 
//         ? Math.round((present / totalActiveStaff) * 10000) / 100 
//         : 0,
//       breakdown,
//     };
//   }

//   async getMonthlyReport(year: number, month: number, departmentId?: number) {
//     const startDate = new Date(year, month - 1, 1);
//     const endDate = new Date(year, month, 0);

//     const whereStaff: any = { status: 'ACTIVE' };
//     if (departmentId) {
//       whereStaff.departmentId = departmentId;
//     }

//     const staffList = await this.prisma.staff.findMany({
//       where: whereStaff,
//       select: {
//         id: true,
//         userId: true,
//         user: {
//           select: {
//             firstName: true,
//             lastName: true,
//             email: true,
//           },
//         },
//         department: {
//           select: { name: true },
//         },
//       },
//     });

//     const attendances = await this.prisma.staffAttendance.findMany({
//       where: {
//         userId: { in: staffList.map(s => s.userId) },
//         date: { gte: startDate, lte: endDate },
//       },
//     });

//     const totalWorkingDays = await this.calculateWorkingDays(startDate, endDate);

//     const report = staffList.map(staff => {
//       const staffAttendance = attendances.filter(a => a.userId === staff.userId);
      
//       const present = staffAttendance.filter(a => a.status === 'PRESENT').length;
//       const absent = staffAttendance.filter(a => a.status === 'ABSENT').length;
//       const late = staffAttendance.filter(a => a.status === 'LATE').length;
//       const halfDay = staffAttendance.filter(a => a.status === 'HALF_DAY').length;
//       const onLeave = staffAttendance.filter(a => a.status === 'LEAVE').length;
      
//       const percentage = totalWorkingDays > 0 
//         ? Math.round(((present + halfDay * 0.5) / totalWorkingDays) * 10000) / 100
//         : 0;

//       return {
//         staffId: staff.id,
//         name: `${staff.user.firstName} ${staff.user.lastName}`,
//         email: staff.user.email,
//         department: staff.department?.name || 'Not Assigned',
//         attendance: {
//           present,
//           absent,
//           late,
//           halfDay,
//           onLeave,
//           totalWorkingDays,
//           percentage,
//         },
//       };
//     });

//     const summary = {
//       totalStaff: staffList.length,
//       totalPresent: report.reduce((sum, s) => sum + s.attendance.present, 0),
//       totalAbsent: report.reduce((sum, s) => sum + s.attendance.absent, 0),
//       totalLate: report.reduce((sum, s) => sum + s.attendance.late, 0),
//       averagePercentage: report.length > 0
//         ? Math.round(report.reduce((sum, s) => sum + s.attendance.percentage, 0) / report.length * 100) / 100
//         : 0,
//     };

//     return {
//       year,
//       month,
//       period: {
//         startDate,
//         endDate,
//         totalWorkingDays,
//       },
//       summary,
//       report,
//       generatedAt: new Date(),
//     };
//   }

//   private async calculateWorkingDays(startDate: Date, endDate: Date): Promise<number> {
//     let count = 0;
//     const current = new Date(startDate);
    
//     while (current <= endDate) {
//       const day = current.getUTCDay();
//       if (day !== 0 && day !== 6) {
//         const holidayInfo = await this.holidayService.isHoliday(current, undefined);
//         if (!holidayInfo.isHoliday) {
//           count++;
//         }
//       }
//       current.setUTCDate(current.getUTCDate() + 1);
//     }
    
//     return count;
//   }
// }

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly holidayService: HolidayService,
  ) {}

  private normalizeDate(date: Date | string): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private isAfterDeadline(attendanceDate: Date): boolean {
    const now = new Date();
    const deadline = new Date(attendanceDate);
    deadline.setHours(72, 0, 0, 0);
    return now > deadline;
  }

  // Get employeeId from staff userId
  private async getEmployeeIdFromUserId(userId: number): Promise<number | null> {
    const staff = await this.prisma.staff.findUnique({
      where: { userId },
      include: { employee: true },
    });
    return staff?.employee?.id || null;
  }

  async markAttendance(dto: MarkStaffAttendanceDto, recordedById: number) {
    const attendanceDate = this.normalizeDate(dto.date);
    const today = this.normalizeDate(new Date());

    if (attendanceDate > today) {
      throw new BadRequestException('Cannot mark attendance for future dates');
    }

    const day = attendanceDate.getDay();
    if (day === 0 || day === 6) {
      throw new BadRequestException('Attendance cannot be taken on weekends');
    }

    if (this.isAfterDeadline(attendanceDate)) {
      throw new BadRequestException('Attendance deadline has passed (72 hours)');
    }

    const holidayInfo = await this.holidayService.isHoliday(attendanceDate, undefined);

    if (holidayInfo.isHoliday && !holidayInfo.isHalfDay) {
      throw new BadRequestException('Cannot mark attendance on a holiday');
    }

    // Get staff and employee
    const staff = await this.prisma.staff.findUnique({
      where: { userId: dto.userId },
      include: { employee: true },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    if (!staff.employee) {
      throw new NotFoundException('Employee record not found for this staff. Please create employee record first.');
    }

    if (staff.status !== 'ACTIVE') {
      throw new BadRequestException('Cannot mark attendance for inactive staff');
    }

    const employeeId = staff.employee.id;

    // Check existing attendance in EmployeeAttendance
    const existing = await this.prisma.employeeAttendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: attendanceDate,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Attendance already marked for this staff member on this date');
    }

    // Create attendance in EmployeeAttendance
    const attendance = await this.prisma.employeeAttendance.create({
      data: {
        employeeId,
        date: attendanceDate,
        status: dto.status,
        checkIn: dto.checkIn ? new Date(dto.checkIn) : null,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : null,
        remarks: dto.remarks || null,
        recordedBy: recordedById,
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Also create in StaffAttendance for backward compatibility (optional)
    await this.prisma.staffAttendance.upsert({
      where: {
        userId_date: {
          userId: dto.userId,
          date: attendanceDate,
        },
      },
      update: {
        status: dto.status,
        checkIn: dto.checkIn ? new Date(dto.checkIn) : null,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : null,
        remarks: dto.remarks || null,
        recordedBy: recordedById,
      },
      create: {
        userId: dto.userId,
        date: attendanceDate,
        status: dto.status,
        checkIn: dto.checkIn ? new Date(dto.checkIn) : null,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : null,
        remarks: dto.remarks || null,
        recordedBy: recordedById,
      },
    });

    return attendance;
  }

  async updateAttendance(id: number, dto: UpdateStaffAttendanceDto) {
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
        remarks: dto.remarks,
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
              },
            },
          },
        },
      },
    });
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

  async getAttendance(dto: GetStaffAttendanceDto, baseUrl?: string) {
    // Get employeeId from userId
    const employeeId = await this.getEmployeeIdFromUserId(dto.userId);
    
    if (!employeeId) {
      return {
        count: 0,
        total_pages: 0,
        current_page: 1,
        page_size: 10,
        data: [],
      };
    }

    const where: any = { employeeId };

    if (dto.startDate || dto.endDate) {
      where.date = {};
      if (dto.startDate) {
        where.date.gte = this.normalizeDate(new Date(dto.startDate));
      }
      if (dto.endDate) {
        where.date.lte = this.normalizeDate(new Date(dto.endDate));
      }
    }

    if (dto.status) {
      where.status = dto.status;
    }

    const page = dto.page || 1;
    const limit = Math.min(dto.limit || 10, 50);
    const skip = (page - 1) * limit;

    const [records, count] = await Promise.all([
      this.prisma.employeeAttendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          employee: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.employeeAttendance.count({ where }),
    ]);

    const totalPages = Math.ceil(count / limit);

    const response: any = {
      count,
      total_pages: totalPages,
      current_page: page,
      page_size: limit,
      data: records,
    };

    if (baseUrl && totalPages > 0) {
      if (page < totalPages) {
        response.next = `${baseUrl}?page=${page + 1}&limit=${limit}`;
      }
      if (page > 1) {
        response.previous = `${baseUrl}?page=${page - 1}&limit=${limit}`;
      }
    }

    return response;
  }

  async getTodaySummary(schoolDate?: string) {
    const baseDate = schoolDate ? new Date(schoolDate) : new Date();
    const start = this.normalizeDate(baseDate);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const holidayInfo = await this.holidayService.isHoliday(start, undefined);

    // Get all active staff with their employee ids
    const activeStaff = await this.prisma.staff.findMany({
      where: { status: 'ACTIVE' },
      include: { employee: true },
    });

    const employeeIds = activeStaff.filter(s => s.employee).map(s => s.employee.id);
    const totalActiveStaff = employeeIds.length;

    const summaryRaw = await this.prisma.employeeAttendance.groupBy({
      by: ['status'],
      where: {
        employeeId: { in: employeeIds },
        date: { gte: start, lte: end },
      },
      _count: { status: true },
    });

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
    const absent = totalActiveStaff - present - breakdown.LEAVE;

    return {
      date: start.toISOString().split('T')[0],
      isHoliday: holidayInfo.isHoliday,
      holidayName: holidayInfo.holidayName,
      isHalfDay: holidayInfo.isHalfDay,
      totalStaff: totalActiveStaff,
      present,
      absent,
      onLeave: breakdown.LEAVE,
      late: breakdown.LATE,
      halfDay: breakdown.HALF_DAY,
      attendancePercentage: totalActiveStaff > 0 
        ? Math.round((present / totalActiveStaff) * 10000) / 100 
        : 0,
      breakdown,
    };
  }

  async getMonthlyReport(year: number, month: number, departmentId?: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const whereStaff: any = { status: 'ACTIVE' };
    if (departmentId) {
      whereStaff.departmentId = departmentId;
    }

    const staffList = await this.prisma.staff.findMany({
      where: whereStaff,
      include: {
        employee: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        department: {
          select: { name: true },
        },
      },
    });

    const employeeIds = staffList.filter(s => s.employee).map(s => s.employee.id);
    
    const attendances = await this.prisma.employeeAttendance.findMany({
      where: {
        employeeId: { in: employeeIds },
        date: { gte: startDate, lte: endDate },
      },
    });

    const totalWorkingDays = await this.calculateWorkingDays(startDate, endDate);

    const report = staffList.map(staff => {
      const staffAttendance = attendances.filter(a => a.employeeId === staff.employee?.id);
      
      const present = staffAttendance.filter(a => a.status === 'PRESENT').length;
      const absent = staffAttendance.filter(a => a.status === 'ABSENT').length;
      const late = staffAttendance.filter(a => a.status === 'LATE').length;
      const halfDay = staffAttendance.filter(a => a.status === 'HALF_DAY').length;
      const onLeave = staffAttendance.filter(a => a.status === 'LEAVE').length;
      
      const percentage = totalWorkingDays > 0 
        ? Math.round(((present + halfDay * 0.5) / totalWorkingDays) * 10000) / 100
        : 0;

      return {
        staffId: staff.id,
        name: `${staff.user.firstName} ${staff.user.lastName}`,
        email: staff.user.email,
        department: staff.department?.name || 'Not Assigned',
        attendance: {
          present,
          absent,
          late,
          halfDay,
          onLeave,
          totalWorkingDays,
          percentage,
        },
      };
    });

    const summary = {
      totalStaff: staffList.length,
      totalPresent: report.reduce((sum, s) => sum + s.attendance.present, 0),
      totalAbsent: report.reduce((sum, s) => sum + s.attendance.absent, 0),
      totalLate: report.reduce((sum, s) => sum + s.attendance.late, 0),
      averagePercentage: report.length > 0
        ? Math.round(report.reduce((sum, s) => sum + s.attendance.percentage, 0) / report.length * 100) / 100
        : 0,
    };

    return {
      year,
      month,
      period: {
        startDate,
        endDate,
        totalWorkingDays,
      },
      summary,
      report,
      generatedAt: new Date(),
    };
  }

  private async calculateWorkingDays(startDate: Date, endDate: Date): Promise<number> {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        const holidayInfo = await this.holidayService.isHoliday(current, undefined);
        if (!holidayInfo.isHoliday) {
          count++;
        }
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }
}