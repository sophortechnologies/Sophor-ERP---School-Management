import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateStaffLeaveDto } from './dto/create-leave.dto';
import { UpdateStaffLeaveDto } from './dto/update-leave.dto';
// import { GetStaffLeavesDto } from './dto/get-leaves.dto';
import { PrismaService } from '../../database/prisma.service';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetStaffLeavesDto {
  @IsInt()
  userId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @IsOptional()
  status?: string;
}
@Injectable()
export class StaffLeaveService {
  constructor(private readonly prisma: PrismaService) {}

 async applyLeave(currentUserId: number, currentUserRole: string, dto: CreateStaffLeaveDto) {
  // Determine who the leave is for
  const targetUserId = dto.userId || currentUserId;

  // Security: Only allow admin/HR to apply on behalf of others
  if (dto.userId && dto.userId !== currentUserId) {
    if (!['ADMIN', 'SUPER_ADMIN', 'HR'].includes(currentUserRole)) {
      throw new ForbiddenException('You can only apply leave for yourself');
    }
  }

  const start = new Date(dto.startDate);
  const end = new Date(dto.endDate);

  if (start > end) {
    throw new BadRequestException('Start date cannot be after end date');
  }

  // Check for overlapping approved/pending leaves
  const overlapping = await this.prisma.staffLeave.findFirst({
    where: {
      userId: targetUserId,
      status: { in: ['PENDING', 'APPROVED'] },
      OR: [
        { startDate: { lte: end }, endDate: { gte: start } },
      ],
    },
  });

  if (overlapping) {
    throw new BadRequestException('This staff member already has a leave overlapping these dates');
  }

  return this.prisma.staffLeave.create({
    data: {
      userId: targetUserId,
      leaveType: dto.leaveType,
      startDate: start,
      endDate: end,
      halfDay: dto.halfDay || null,
      reason: dto.reason,
      status: 'PENDING',
      // Optional: Record who applied it (useful for audit)
      // notes: `Applied by ${currentUserRole} (ID: ${currentUserId})`
    },
    include: {
      user: {
        select: { firstName: true, lastName: true, username: true },
      },
    },
  });
}

  async getMyLeaves(userId: number, dto: GetStaffLeavesDto) {
    const { page, limit, status } = dto;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) where.status = status;

    const [leaves, total] = await this.prisma.$transaction([
      this.prisma.staffLeave.findMany({
        where,
        orderBy: { appliedAt: 'desc' },
        skip,
        take: limit,
        include: {
          approver: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.staffLeave.count({ where }),
    ]);

    return {
      data: leaves,
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
      include: {
        user: { select: { firstName: true, lastName: true, username: true } },
      },
      orderBy: { appliedAt: 'asc' },
    });
  }
async getLeaveById(leaveId: number, currentUserId: number, currentUserRole: string) {
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

  // Security: Non-admin users can only view their own leaves
  if (leave.userId !== currentUserId) {
    if (!['ADMIN', 'SUPER_ADMIN', 'HR'].includes(currentUserRole)) {
      throw new ForbiddenException('You are not authorized to view this leave request');
    }
  }

  return leave;
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
      throw new BadRequestException('Only pending leaves can be approved/rejected');
    }

    if (!dto.status || !['APPROVED', 'REJECTED'].includes(dto.status)) {
      throw new BadRequestException('Status must be APPROVED or REJECTED');
    }

    const updateData: any = {
      status: dto.status,
      approvedBy: approverId,
      notes: dto.notes || null,
    };

    if (dto.status === 'APPROVED') {
      updateData.approvedAt = new Date();
    } else if (dto.status === 'REJECTED') {
      updateData.rejectedAt = new Date();
    }

    return this.prisma.staffLeave.update({
      where: { id: leaveId },
      data: updateData,
      include: {
        user: { select: { firstName: true, lastName: true } },
        approver: { select: { firstName: true, lastName: true } },
      },
    });
  }
}