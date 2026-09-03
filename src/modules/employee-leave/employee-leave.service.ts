import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ApplyLeaveDto } from './dto/apply-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { LeaveQueryDto } from './dto/leave-query.dto';
import { LeaveStatus } from './enums/leave-status.enum';
import { LeaveType } from './enums/leave-type.enum';
import { LeaveBalanceHelper } from './leave-balance.helper';

@Injectable()
export class EmployeeLeaveService {
  constructor(private readonly prisma: PrismaService) {}

  async applyLeave(dto: ApplyLeaveDto, currentUserId: number, currentUserRole: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (employee.status !== 'ACTIVE') {
      throw new BadRequestException('Cannot apply leave for inactive employee');
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start > end) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    if (start < today) {
      throw new BadRequestException('Cannot apply leave for past dates');
    }

    const overlapping = await this.prisma.employeeLeave.findFirst({
      where: {
        employeeId: dto.employeeId,
        status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });

    if (overlapping) {
      throw new ConflictException('Leave request already exists for this period');
    }

    const leaveDays = LeaveBalanceHelper.calculateLeaveDays(start, end, dto.halfDay);

    if (dto.leaveType !== LeaveType.UNPAID) {
      const balance = await LeaveBalanceHelper.getLeaveBalance(this.prisma, dto.employeeId);
      const currentBalance = balance.balances[dto.leaveType]?.remaining || 0;

      if (leaveDays > currentBalance) {
        throw new BadRequestException(
          `Insufficient leave balance. Available: ${currentBalance}, Requested: ${leaveDays}`
        );
      }
    }

    const leave = await this.prisma.employeeLeave.create({
      data: {
        employeeId: dto.employeeId,
        leaveType: dto.leaveType,
        startDate: start,
        endDate: end,
        halfDay: dto.halfDay,
        reason: dto.reason,
        status: LeaveStatus.PENDING,
      },
      include: {
        employee: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    return leave;
  }

  async getLeaves(query: LeaveQueryDto) {
    const where: any = {};

    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.status) where.status = query.status;
    if (query.leaveType) where.leaveType = query.leaveType;

    if (query.year) {
      where.startDate = {
        gte: new Date(query.year, 0, 1),
        lte: new Date(query.year, 11, 31),
      };
    }

    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 50);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.employeeLeave.findMany({
        where,
        skip,
        take: limit,
        orderBy: { appliedAt: 'desc' },
        include: {
          employee: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
        },
      }),
      this.prisma.employeeLeave.count({ where }),
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

  async getPendingLeaves() {
    const leaves = await this.prisma.employeeLeave.findMany({
      where: { status: LeaveStatus.PENDING },
      orderBy: { appliedAt: 'asc' },
      include: {
        employee: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    return { count: leaves.length, data: leaves };
  }

  async getLeaveById(id: number) {
    const leave = await this.prisma.employeeLeave.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    return leave;
  }

  async reviewLeave(id: number, dto: UpdateLeaveDto, approverId: number) {
    const leave = await this.prisma.employeeLeave.findUnique({
      where: { id },
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending leave requests can be reviewed');
    }

    if (![LeaveStatus.APPROVED, LeaveStatus.REJECTED].includes(dto.status)) {
      throw new BadRequestException('Status must be APPROVED or REJECTED');
    }

    if (dto.status === LeaveStatus.APPROVED) {
      const leaveDays = LeaveBalanceHelper.calculateLeaveDays(
        leave.startDate,
        leave.endDate,
        leave.halfDay,
      );

      if (leave.leaveType !== LeaveType.UNPAID) {
        const balance = await LeaveBalanceHelper.getLeaveBalance(this.prisma, leave.employeeId);
        const currentBalance = balance.balances[leave.leaveType]?.remaining || 0;

        if (leaveDays > currentBalance) {
          throw new BadRequestException(
            `Insufficient leave balance. Available: ${currentBalance}, Requested: ${leaveDays}`
          );
        }
      }
    }

    const updated = await this.prisma.employeeLeave.update({
      where: { id },
      data: {
        status: dto.status,
        approvedBy: approverId,
        notes: dto.notes,
        approvedAt: dto.status === LeaveStatus.APPROVED ? new Date() : null,
        rejectedAt: dto.status === LeaveStatus.REJECTED ? new Date() : null,
      },
      include: {
        employee: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    return updated;
  }

  async cancelLeave(id: number, employeeId: number) {
    const leave = await this.prisma.employeeLeave.findUnique({
      where: { id },
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    if (leave.employeeId !== employeeId) {
      throw new ForbiddenException('You can only cancel your own leave requests');
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending leave requests can be cancelled');
    }

    await this.prisma.employeeLeave.delete({ where: { id } });

    return { message: 'Leave request cancelled successfully' };
  }

  async getLeaveBalance(employeeId: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return LeaveBalanceHelper.getLeaveBalance(this.prisma, employeeId);
  }

  async getLeaveHistory(employeeId: number, year?: number) {
    const targetYear = year || new Date().getFullYear();

    const leaves = await this.prisma.employeeLeave.findMany({
      where: {
        employeeId,
        startDate: { gte: new Date(targetYear, 0, 1) },
        endDate: { lte: new Date(targetYear, 11, 31) },
      },
      orderBy: { startDate: 'desc' },
    });

    const summary = {
      total: leaves.length,
      approved: leaves.filter(l => l.status === LeaveStatus.APPROVED).length,
      rejected: leaves.filter(l => l.status === LeaveStatus.REJECTED).length,
      pending: leaves.filter(l => l.status === LeaveStatus.PENDING).length,
      totalDays: leaves
        .filter(l => l.status === LeaveStatus.APPROVED)
        .reduce((sum, l) => sum + LeaveBalanceHelper.calculateLeaveDays(l.startDate, l.endDate, l.halfDay), 0),
    };

    return { year: targetYear, summary, leaves };
  }
}