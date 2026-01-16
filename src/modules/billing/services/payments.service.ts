// src/modules/billing/services/payments.service.ts

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../database/prisma.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { BillStatus } from '../enums/bill-status.enum';

export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
}

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  // ========================= CREATE =========================

  async record(dto: CreatePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const bill = await tx.bill.findUnique({
        where: { id: dto.billId },
        include: { payments: true },
      });

      if (!bill) {
        throw new NotFoundException('Bill not found');
      }

      if (bill.studentId !== dto.studentId) {
        throw new BadRequestException('Bill does not belong to student');
      }

      const totalPaid = bill.payments.reduce(
        (sum, p) => sum + Number(p.amountPaid),
        0,
      );

      const remaining = Number(bill.totalAmount) - totalPaid;

      if (dto.amountPaid <= 0) {
        throw new BadRequestException('Amount must be greater than zero');
      }

      if (dto.amountPaid > remaining) {
        throw new BadRequestException(
          `Payment exceeds remaining balance (${remaining})`,
        );
      }

      const payment = await tx.payment.create({
        data: {
          studentId: dto.studentId,
          billId: dto.billId,
          amountPaid: dto.amountPaid,
          paymentMethod: dto.paymentMethod,
          paymentDate: new Date(),
          status: PaymentStatus.SUCCESS,
        },
      });

      const newRemaining = remaining - dto.amountPaid;

      let newStatus =
        newRemaining === 0
          ? BillStatus.PAID
          : BillStatus.PARTIAL;

      if (newStatus !== BillStatus.PAID && bill.dueDate < new Date()) {
        newStatus = BillStatus.OVERDUE;
      }

      await tx.bill.update({
        where: { id: bill.id },
        data: { status: newStatus },
      });

      return {
        payment,
        remainingBalance: newRemaining,
        billStatus: newStatus,
      };
    });
  }

  // ========================= READ =========================

  async findAll() {
    return this.prisma.payment.findMany({
      orderBy: { paymentDate: 'desc' },
    });
  }

  async findOne(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  // ========================= UPDATE =========================

  async update(id: number, dto: UpdatePaymentDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.prisma.payment.update({
      where: { id },
      data: {
        amountPaid: dto.amountPaid,
        paymentMethod: dto.paymentMethod,
        paymentDate: dto.paymentDate
          ? new Date(dto.paymentDate)
          : undefined,
        status: dto.status,
      },
    });
  }

  // ========================= DELETE =========================
async remove(id: number) {
  const payment = await this.prisma.payment.findUnique({
    where: { id },
  });

  if (!payment) {
    throw new NotFoundException('Payment not found');
  }

  await this.prisma.payment.delete({
    where: { id },
  });
}

}
