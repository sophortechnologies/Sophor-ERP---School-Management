import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a payment (supports partial payments)
   */
  async createPayment(dto: CreatePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const bill = await tx.bill.findUnique({
        where: { id: dto.billId },
      });

      if (!bill) {
        throw new BadRequestException('Bill not found');
      }

      const totalPaid = await tx.payment.aggregate({
        where: { billId: dto.billId },
        _sum: { amountPaid: true },
      });

      const paidSoFar = totalPaid._sum.amountPaid ?? new Prisma.Decimal(0);
      const newTotalPaid = paidSoFar.plus(dto.amountPaid);

      let billStatus = 'PARTIALLY_PAID';

      if (newTotalPaid.greaterThanOrEqualTo(bill.totalAmount)) {
        billStatus = 'PAID';
      }

      const payment = await tx.payment.create({
        data: {
          student: { connect: { id: dto.studentId } },
          bill: { connect: { id: dto.billId } },
          amountPaid: dto.amountPaid,
          paymentMethod: dto.paymentMethod,
          paymentDate: dto.paymentDate,
          status: dto.status ?? 'SUCCESS',
        },
      });

      await tx.bill.update({
        where: { id: dto.billId },
        data: { status: billStatus },
      });

      return payment;
    });
  }

  /**
   * Get payments by bill
   */
  async getPaymentsByBill(billId: number) {
    return this.prisma.payment.findMany({
      where: { billId },
      orderBy: { paymentDate: 'desc' },
    });
  }

  /**
   * Get payments by student
   */
  async getPaymentsByStudent(studentId: number) {
    return this.prisma.payment.findMany({
      where: { studentId },
      orderBy: { paymentDate: 'desc' },
    });
  }
}
