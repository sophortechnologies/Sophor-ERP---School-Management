// src/modules/billing/services/bills.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateBillDto } from '../dto/create-bill.dto';
import { FindBillsByStudentDto } from '../dto/find-bills-by-student.dto';
import { BillStatus } from '../enums/bill-status.enum';

@Injectable()
export class BillsService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateBillCode(): Promise<string> {
    return `BILL-${Date.now()}`;
  }

  async create(dto: CreateBillDto) {
    const config = await this.prisma.billConfiguration.findUnique({
      where: { id: dto.billConfigId },
    });

    if (!config || !config.isActive) {
      throw new NotFoundException('Bill configuration not found or inactive');
    }

    return this.prisma.bill.create({
      data: {
        studentId: dto.studentId,
        billConfigId: dto.billConfigId,
        billCode: await this.generateBillCode(),
        totalAmount: config.amount,
        status: BillStatus.UNPAID,
        dueDate: new Date(dto.dueDate),
      },
    });
  }

  async findByStudent(dto: FindBillsByStudentDto) {
    const { studentId, page, limit } = dto;

    return this.prisma.bill.findMany({
      where: { studentId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  

  /**  ADD THIS */
  findAll({ page, limit }: { page: number; limit: number }) {
    return this.prisma.bill.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**  ADD THIS */
  async findOne(id: number) {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
    });

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    return bill;
  }

  updateStatus(id: number, status: string) {
    return this.prisma.bill.update({
      where: { id },
      data: { status },
    });
  }

  /**  ADD THIS */
  remove(id: number) {
    return this.prisma.bill.delete({
      where: { id },
    });
  } 
}
