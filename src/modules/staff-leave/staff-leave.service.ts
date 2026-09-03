import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStaffLeaveDto } from './dto/create-leave.dto';
import { UpdateStaffLeaveDto } from './dto/update-leave.dto';
import { GetStaffLeavesDto } from './dto/get-leaves.dto';

@Injectable()
export class StaffLeaveService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateLeaveDays(startDate: Date, endDate: Date, halfDay?: string): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (halfDay) {
      return 0.5;
    }
    
    return diffDays;
  }

  async applyLeave(currentUserId: number, currentUserRole: string, dto: CreateStaffLeaveDto) {
    const targetUserId = dto.userId ?? currentUserId;

    if (targetUserId !== currentUserId && !['ADMIN', 'SUPER_ADMIN', 'HR'].includes(currentUserRole)) {
      throw new ForbiddenException('You can only apply leave for yourself');
    }

    const staff = await this.prisma.staff.findUnique({
      where: { userId: targetUserId },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    if (staff.status !== 'ACTIVE') {
      throw new BadRequestException('Cannot apply leave for inactive staff');
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

    const overlapping = await this.prisma.staffLeave.findFirst({
      where: {
        userId: targetUserId,
        status: { in: ['PENDING', 'APPROVED'] },
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });

    if (overlapping) {
      throw new ConflictException('Leave request already exists for this period');
    }

    const leaveDays = this.calculateLeaveDays(start, end, dto.halfDay);

    if (dto.leaveType !== 'UNPAID') {
      const balance = await this.getLeaveBalance(targetUserId);
      const currentBalance = balance[dto.leaveType] || 0;
      
      if (leaveDays > currentBalance) {
        throw new BadRequestException(
          `Insufficient leave balance. Available: ${currentBalance}, Requested: ${leaveDays}`
        );
      }
    }

    const leave = await this.prisma.staffLeave.create({
      data: {
        userId: targetUserId,
        leaveType: dto.leaveType,
        startDate: start,
        endDate: end,
        halfDay: dto.halfDay ?? null,
        reason: dto.reason,
        status: 'PENDING',
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, username: true, email: true },
        },
      },
    });

    return leave;
  }

  async getMyLeaves(userId: number, dto: GetStaffLeavesDto, baseUrl?: string) {
    const page = dto.page || 1;
    const limit = Math.min(dto.limit || 10, 50);
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (dto.status) where.status = dto.status;

    const [data, total] = await Promise.all([
      this.prisma.staffLeave.findMany({
        where,
        skip,
        take: limit,
        orderBy: { appliedAt: 'desc' },
        include: {
          approver: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.staffLeave.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: any = {
      count: total,
      total_pages: totalPages,
      current_page: page,
      page_size: limit,
      data,
    };

    if (baseUrl && totalPages > 0) {
      let url = baseUrl;
      if (dto.status) url = `${url}?status=${dto.status}`;
      
      if (page < totalPages) {
        response.next = `${url}&page=${page + 1}&limit=${limit}`;
      }
      if (page > 1) {
        response.previous = `${url}&page=${page - 1}&limit=${limit}`;
      }
    }

    return response;
  }

  async getAllPendingLeaves() {
    const leaves = await this.prisma.staffLeave.findMany({
      where: { status: 'PENDING' },
      orderBy: { appliedAt: 'asc' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, username: true, email: true },
        },
      },
    });

    return {
      count: leaves.length,
      data: leaves,
    };
  }

  async getLeaveById(leaveId: number, currentUserId: number, currentUserRole: string) {
    const leave = await this.prisma.staffLeave.findUnique({
      where: { id: leaveId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, username: true, email: true },
        },
        approver: {
          select: { id: true, firstName: true, lastName: true, username: true },
        },
      },
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    if (leave.userId !== currentUserId && !['ADMIN', 'SUPER_ADMIN', 'HR'].includes(currentUserRole)) {
      throw new ForbiddenException('Not authorized to view this leave request');
    }

    return leave;
  }

  async updateLeave(leaveId: number, userId: number, dto: UpdateStaffLeaveDto) {
    const leave = await this.prisma.staffLeave.findUnique({
      where: { id: leaveId },
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    if (leave.userId !== userId) {
      throw new ForbiddenException('You can only update your own leave requests');
    }

    if (leave.status !== 'PENDING') {
      throw new BadRequestException('Only pending leave requests can be updated');
    }

    const updateData: any = {};

    if (dto.leaveType) updateData.leaveType = dto.leaveType;
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);
    if (dto.halfDay !== undefined) updateData.halfDay = dto.halfDay;
    if (dto.reason) updateData.reason = dto.reason;

    if (dto.startDate || dto.endDate) {
      const start = dto.startDate ? new Date(dto.startDate) : leave.startDate;
      const end = dto.endDate ? new Date(dto.endDate) : leave.endDate;
      
      if (start > end) {
        throw new BadRequestException('Start date cannot be after end date');
      }

      const overlapping = await this.prisma.staffLeave.findFirst({
        where: {
          userId,
          status: { in: ['PENDING', 'APPROVED'] },
          startDate: { lte: end },
          endDate: { gte: start },
          id: { not: leaveId },
        },
      });

      if (overlapping) {
        throw new ConflictException('Another leave request exists for this period');
      }
    }

    return this.prisma.staffLeave.update({
      where: { id: leaveId },
      data: updateData,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async approveOrReject(leaveId: number, dto: UpdateStaffLeaveDto, approverId: number) {
    const leave = await this.prisma.staffLeave.findUnique({
      where: { id: leaveId },
      include: { user: true },
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    if (leave.status !== 'PENDING') {
      throw new BadRequestException('Only pending leave requests can be reviewed');
    }

    if (!['APPROVED', 'REJECTED'].includes(dto.status)) {
      throw new BadRequestException('Status must be APPROVED or REJECTED');
    }

    if (dto.status === 'APPROVED') {
      const leaveDays = this.calculateLeaveDays(leave.startDate, leave.endDate, leave.halfDay);
      
      if (leave.leaveType !== 'UNPAID') {
        const balance = await this.getLeaveBalance(leave.userId);
        const currentBalance = balance.balances[leave.leaveType]?.remaining || 0;
        
        if (leaveDays > currentBalance) {
          throw new BadRequestException(
            `Insufficient leave balance. Available: ${currentBalance}, Requested: ${leaveDays}`
          );
        }
      }
    }

    const updated = await this.prisma.staffLeave.update({
      where: { id: leaveId },
      data: {
        status: dto.status,
        approvedBy: approverId,
        notes: dto.notes || null,
        approvedAt: dto.status === 'APPROVED' ? new Date() : null,
        rejectedAt: dto.status === 'REJECTED' ? new Date() : null,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        approver: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return updated;
  }

  async deleteLeave(leaveId: number, userId: number) {
    const leave = await this.prisma.staffLeave.findUnique({
      where: { id: leaveId },
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    if (leave.userId !== userId) {
      throw new ForbiddenException('You can only delete your own leave requests');
    }

    if (leave.status !== 'PENDING') {
      throw new BadRequestException('Only pending leave requests can be deleted');
    }

    await this.prisma.staffLeave.delete({
      where: { id: leaveId },
    });

    return { message: 'Leave request deleted successfully' };
  }


  async getLeaveHistory(userId: number, year?: number) {
  const targetYear = year || new Date().getFullYear();

  const leaves = await this.prisma.staffLeave.findMany({
    where: {
      userId,
      startDate: { gte: new Date(targetYear, 0, 1) },
      endDate: { lte: new Date(targetYear, 11, 31) },
    },
    orderBy: { startDate: 'desc' },
    include: {
      approver: { select: { firstName: true, lastName: true } },
    },
  });

  const summary = {
    total: leaves.length,
    approved: leaves.filter(l => l.status === 'APPROVED').length,
    rejected: leaves.filter(l => l.status === 'REJECTED').length,
    pending: leaves.filter(l => l.status === 'PENDING').length,
    totalDays: leaves
      .filter(l => l.status === 'APPROVED')
      .reduce((sum, l) => sum + this.calculateLeaveDays(l.startDate, l.endDate, l.halfDay), 0),
  };

  return {
    year: targetYear,
    summary,
    leaves: leaves.map(l => ({
      id: l.id,
      type: l.leaveType,
      startDate: l.startDate,
      endDate: l.endDate,
      days: this.calculateLeaveDays(l.startDate, l.endDate, l.halfDay),
      halfDay: l.halfDay,
      reason: l.reason,
      status: l.status,
      appliedAt: l.appliedAt,
      approvedBy: l.approver ? `${l.approver.firstName} ${l.approver.lastName}` : null,
      notes: l.notes,
    })),
  };
}

async getLeaveBalance(userId: number) {
  const currentYear = new Date().getFullYear();

  const approvedLeaves = await this.prisma.staffLeave.findMany({
    where: {
      userId,
      status: 'APPROVED',
      startDate: { gte: new Date(currentYear, 0, 1) },
      endDate: { lte: new Date(currentYear, 11, 31) },
    },
  });

  let annualTaken = 0;
  let sickTaken = 0;
  let casualTaken = 0;

  for (const leave of approvedLeaves) {
    const days = this.calculateLeaveDays(leave.startDate, leave.endDate, leave.halfDay);
    
    if (leave.leaveType === 'ANNUAL') annualTaken += days;
    if (leave.leaveType === 'SICK') sickTaken += days;
    if (leave.leaveType === 'CASUAL') casualTaken += days;
  }

  const entitlements = {
    ANNUAL: 22,
    SICK: 12,
    CASUAL: 10,
    MATERNITY: 90,
    PATERNITY: 15,
    BEREAVEMENT: 5,
  };

  return {
    year: currentYear,
    balances: {
      ANNUAL: { entitled: entitlements.ANNUAL, taken: annualTaken, remaining: entitlements.ANNUAL - annualTaken },
      SICK: { entitled: entitlements.SICK, taken: sickTaken, remaining: entitlements.SICK - sickTaken },
      CASUAL: { entitled: entitlements.CASUAL, taken: casualTaken, remaining: entitlements.CASUAL - casualTaken },
      MATERNITY: { entitled: entitlements.MATERNITY, taken: 0, remaining: entitlements.MATERNITY },
      PATERNITY: { entitled: entitlements.PATERNITY, taken: 0, remaining: entitlements.PATERNITY },
      BEREAVEMENT: { entitled: entitlements.BEREAVEMENT, taken: 0, remaining: entitlements.BEREAVEMENT },
    },
  };
}
}