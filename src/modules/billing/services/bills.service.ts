import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateBillDto } from '../dto/create-bill.dto';
import { BillStatus } from '../enums/bill-status.enum';

@Injectable()
export class BillsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBillDto, userId: number) {
    const { studentId, billConfigIds, dueDate } = dto;

    const configs = await this.prisma.billConfiguration.findMany({
      where: {
        id: { in: billConfigIds },
        isActive: true,
      },
    });

    if (configs.length === 0) {
      throw new BadRequestException('No valid bill configurations found');
    }

    const totalAmount = configs.reduce((sum, c) => sum + Number(c.amount), 0);
    const billCode = 'BILL-' + Date.now();

    return this.prisma.bill.create({
      data: {
        studentId,
        billConfigId: configs[0].id,
        billCode,
        totalAmount,
        status: BillStatus.UNPAID,
        dueDate: new Date(dueDate),
        createdBy: userId,
      },
    });
  }

  async findAll({ page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.bill.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.bill.count(),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      include: { payments: true, config: true },
    });

    if (!bill) {
      throw new NotFoundException('Bill with ID ' + id + ' not found');
    }

    return bill;
  }

  async findByStudent({ studentId, page, limit }: { studentId: number; page: number; limit: number }) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.bill.findMany({
        where: { studentId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.bill.count({ where: { studentId } }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateStatus(id: number, status: string) {
    return this.prisma.bill.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: number) {
    return this.prisma.bill.delete({ where: { id } });
  }
}