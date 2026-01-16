import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStaffLeaveDto } from './dto/create-leave.dto';
import { UpdateStaffLeaveDto } from './dto/update-leave.dto';
import { GetStaffLeavesDto } from './dto/get-leaves.dto';

@Injectable()
export class StaffLeaveService {
  constructor(private readonly prisma: PrismaService) {}

  /* ================= CREATE ================= */

  async applyLeave(
    currentUserId: number,
    currentUserRole: string,
    dto: CreateStaffLeaveDto,
  ) {
    const targetUserId = dto.userId ?? currentUserId;

    // 🔐 Only ADMIN / HR can apply for others
    if (
      targetUserId !== currentUserId &&
      !['ADMIN', 'SUPER_ADMIN'].includes(currentUserRole)
    ) {
      throw new ForbiddenException('You can only apply leave for yourself');
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start > end) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    // 🔴 Overlapping leave protection
    const overlapping = await this.prisma.staffLeave.findFirst({
      where: {
        userId: targetUserId,
        status: { in: ['PENDING', 'APPROVED'] },
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });

    if (overlapping) {
      throw new BadRequestException(
        'Leave already exists for the selected period',
      );
    }

    return this.prisma.staffLeave.create({
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
          select: { firstName: true, lastName: true, username: true },
        },
      },
    });
  }

  /* ================= READ ================= */

  async getMyLeaves(userId: number, dto: GetStaffLeavesDto) {
    const { page, limit, status } = dto;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) where.status = status;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.staffLeave.findMany({
        where,
        skip,
        take: limit,
        orderBy: { appliedAt: 'desc' },
        include: {
          approver: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.staffLeave.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getAllPendingLeaves() {
    return this.prisma.staffLeave.findMany({
      where: { status: 'PENDING' },
      orderBy: { appliedAt: 'asc' },
      include: {
        user: {
          select: { firstName: true, lastName: true, username: true },
        },
      },
    });
  }

  async getLeaveById(
    leaveId: number,
    currentUserId: number,
    currentUserRole: string,
  ) {
    const leave = await this.prisma.staffLeave.findUnique({
      where: { id: leaveId },
      include: {
        user: {
          select: { firstName: true, lastName: true, username: true },
        },
        approver: {
          select: { firstName: true, lastName: true, username: true },
        },
      },
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    if (
      leave.userId !== currentUserId &&
      !['ADMIN', 'SUPER_ADMIN', 'HR'].includes(currentUserRole)
    ) {
      throw new ForbiddenException('Not authorized to view this leave');
    }

    return leave;
  }

  /* ================= UPDATE ================= */

  async updateLeave(
    leaveId: number,
    userId: number,
    dto: UpdateStaffLeaveDto,
  ) {
    const leave = await this.prisma.staffLeave.findUnique({
      where: { id: leaveId },
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    if (leave.userId !== userId) {
      throw new ForbiddenException('You can only update your own leave');
    }

    if (leave.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending leaves can be updated',
      );
    }

    return this.prisma.staffLeave.update({
      where: { id: leaveId },
      data: {
        leaveType: dto.leaveType ?? leave.leaveType,
        startDate: dto.startDate
          ? new Date(dto.startDate)
          : leave.startDate,
        endDate: dto.endDate
          ? new Date(dto.endDate)
          : leave.endDate,
        halfDay: dto.halfDay ?? leave.halfDay,
        reason: dto.reason ?? leave.reason,
      },
    });
  }

  async approveOrReject(
    leaveId: number,
    dto: UpdateStaffLeaveDto,
    approverId: number,
  ) {
    const leave = await this.prisma.staffLeave.findUnique({
      where: { id: leaveId },
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    if (leave.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending leaves can be approved or rejected',
      );
    }

    if (!['APPROVED', 'REJECTED'].includes(dto.status)) {
      throw new BadRequestException('Invalid leave status');
    }

    return this.prisma.staffLeave.update({
      where: { id: leaveId },
      data: {
        status: dto.status,
        approvedBy: approverId,
        notes: dto.notes ?? null,
        approvedAt: dto.status === 'APPROVED' ? new Date() : null,
        rejectedAt: dto.status === 'REJECTED' ? new Date() : null,
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
        approver: { select: { firstName: true, lastName: true } },
      },
    });
  }

  /* ================= DELETE ================= */

  async deleteLeave(leaveId: number, userId: number) {
    const leave = await this.prisma.staffLeave.findUnique({
      where: { id: leaveId },
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    if (leave.userId !== userId) {
      throw new ForbiddenException('You can only delete your own leave');
    }

    if (leave.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending leaves can be deleted',
      );
    }

    await this.prisma.staffLeave.delete({
      where: { id: leaveId },
    });

    return { message: 'Leave request deleted successfully' };
  }
}
