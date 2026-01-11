// // src/modules/billing/billing.service.ts
// import { Injectable, BadRequestException } from '@nestjs/common';
// import { PrismaService } from '../../database/prisma.service';

// @Injectable()
// export class BillingService {
//   constructor(private readonly prisma: PrismaService) {}

//   // =======================
//   // BILL CONFIGURATION
//   // =======================

//   async createBillConfig(data: {
//     classId: number;
//     feeType: string;
//     amount: number;
//     paymentMethodOptions: string[]; // REQUIRED by schema
//     description?: string;
//   }) {
//     return this.prisma.billConfiguration.create({
//       data: {
//         feeType: data.feeType,
//         amount: data.amount,
//         description: data.description,
//         paymentMethodOptions: data.paymentMethodOptions, 

//         class: {
//           connect: { id: data.classId },
//         },
//       },
//     });
//   }

//   async getBillConfigsByClass(classId: number) {
//     return this.prisma.billConfiguration.findMany({
//       where: {
//         class: { id: classId },
//         // ⚠️ temporarily removed isActive filter until client regenerated
//       },
//     });
//   }

//   // =======================
//   // BILLS
//   // =======================

//   async generateBill(data: {
//     studentId: number;
//     billConfigId: number;
//     dueDate: Date;
//   }) {
//     const config = await this.prisma.billConfiguration.findUnique({
//       where: { id: data.billConfigId },
//     });

//     if (!config) {
//       throw new BadRequestException('Bill configuration not found');
//     }

//     return this.prisma.bill.create({
//       data: {
//         billCode: `BILL-${Date.now()}`,
//         totalAmount: config.amount,
//         dueDate: data.dueDate,
//         status: 'UNPAID', // ✅ REQUIRED by schema

//         student: {
//           connect: { id: data.studentId },
//         },

//         config: {
//           connect: { id: data.billConfigId },
//         },
//       },
//     });
//   }

//   async getStudentBills(studentId: number) {
//     return this.prisma.bill.findMany({
//       where: {
//         student: { id: studentId },
//       },
//       include: {
//         payments: true,
//         config: true,
//       },
//     });
//   }

//   async updateBillStatus(billId: number, status: string) {
//     return this.prisma.bill.update({
//       where: { id: billId },
//       data: { status },
//     });
//   }

//   // =======================
//   // PAYMENTS
//   // =======================

//   async recordPayment(data: {
//     studentId: number;
//     billId: number;
//     amountPaid: number;
//     paymentMethod: string;
//   }) {
//     const bill = await this.prisma.bill.findUnique({
//       where: { id: data.billId },
//       include: { payments: true },
//     });

//     if (!bill) {
//       throw new BadRequestException('Bill not found');
//     }

//     const totalPaid = bill.payments.reduce(
//       (sum, p) => sum + Number(p.amountPaid),
//       0,
//     );

//     const remaining = Number(bill.totalAmount) - totalPaid;

//     if (data.amountPaid > remaining) {
//       throw new BadRequestException('Payment exceeds remaining balance');
//     }

//     const payment = await this.prisma.payment.create({
//       data: {
//         amountPaid: data.amountPaid,
//         paymentMethod: data.paymentMethod,
//         paymentDate: new Date(),
//         status: 'SUCCESS',

//         student: {
//           connect: { id: data.studentId },
//         },

//         bill: {
//           connect: { id: data.billId },
//         },
//       },
//     });

//     await this.prisma.bill.update({
//       where: { id: bill.id },
//       data: {
//         status: data.amountPaid === remaining ? 'PAID' : 'PARTIAL',
//       },
//     });

//     return payment;
//   }
// }


// src/modules/billing/billing.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

// =======================
// ENUMS (match your intended values)
// =======================
export enum BillStatus {
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK = 'BANK',
  ONLINE = 'ONLINE',
}

// =======================
// DTOs (use with ValidationPipe)
// =======================
export class CreateBillConfigDto {
  classId: number;
  feeType: string;
  amount: number;
  paymentMethodOptions: PaymentMethod[];
  description?: string;
}

export class GenerateCompositeBillDto {
  studentId: number;
  billConfigIds: number[]; // multiple configs
  dueDate: Date;
}

export class RecordPaymentDto {
  studentId: number;
  billId: number;
  amountPaid: number;
  paymentMethod: PaymentMethod;
}

export class GetStudentBillsDto {
  studentId: number;
  page?: number;
  limit?: number;
}

// =======================
// SERVICE
// =======================
@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  // =======================
  // BILL CONFIGURATION
  // =======================

  async createBillConfig(data: CreateBillConfigDto) {
    return this.prisma.billConfiguration.create({
      data: {
        feeType: data.feeType,
        amount: data.amount,
        description: data.description,
        paymentMethodOptions: data.paymentMethodOptions,
        class: { connect: { id: data.classId } },
      },
    });
  }

  async getBillConfigsByClass(classId: number) {
    return this.prisma.billConfiguration.findMany({
      where: {
        classId,
        isActive: true,
      },
    });
  }

  // =======================
  // BILLS
  // =======================

  private async generateUniqueBillCode(): Promise<string> {
    const today = new Date();
    const prefix = `BILL-${today.toISOString().slice(0, 10).replace(/-/g, '')}`;

    const lastBill = await this.prisma.bill.findFirst({
      where: { billCode: { startsWith: prefix } },
      orderBy: { billCode: 'desc' },
    });

    let seq = 1;
    if (lastBill) {
      const match = lastBill.billCode.match(/-(\d+)$/);
      if (match) seq = parseInt(match[1]) + 1;
    }

    return `${prefix}-${seq.toString().padStart(4, '0')}`;
  }

  /**
   * Generate a composite bill from multiple configurations
   */
 
  async generateBill(data: GenerateCompositeBillDto) {
  if (data.billConfigIds.length === 0) {
    throw new BadRequestException('At least one bill configuration is required');
  }

  const configs = await this.prisma.billConfiguration.findMany({
    where: {
      id: { in: data.billConfigIds },
      isActive: true,
    },
  });

  if (configs.length !== data.billConfigIds.length) {
    throw new NotFoundException('One or more bill configurations not found or inactive');
  }

  if (configs.length === 0) {
    throw new BadRequestException('No valid configurations provided');
  }

  const totalAmount = configs.reduce((sum, c) => sum + Number(c.amount), 0);
  const billCode = await this.generateUniqueBillCode();

  // Use the FIRST config as the required "primary" config
  // You can change this logic (e.g., find one with feeType === 'Tuition')
  const primaryConfig = configs[0];

  return this.prisma.bill.create({
    data: {
      billCode,
      totalAmount,
      dueDate: data.dueDate,
      status: BillStatus.UNPAID,

      student: { connect: { id: data.studentId } },

      // Satisfy the required relation without schema change
      config: { connect: { id: primaryConfig.id } },
    },
    include: {
      config: true,
    },
  });
}

  async getStudentBills(dto: GetStudentBillsDto) {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 20, 50);
    const skip = (page - 1) * limit;

    const [bills, total] = await this.prisma.$transaction([
      this.prisma.bill.findMany({
        where: { studentId: dto.studentId },
        include: {
          payments: true,
          // config: true, // if single relation
        },
        orderBy: { dueDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.bill.count({ where: { studentId: dto.studentId } }),
    ]);

    // Auto-mark overdue bills
    const now = new Date();
    const updatedBills = bills.map((bill) => {
      if (bill.status === BillStatus.UNPAID && bill.dueDate < now) {
        return { ...bill, status: BillStatus.OVERDUE };
      }
      return bill;
    });

    return {
      data: updatedBills,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateBillStatus(billId: number, status: BillStatus) {
    if (!Object.values(BillStatus).includes(status)) {
      throw new BadRequestException('Invalid bill status');
    }

    return this.prisma.bill.update({
      where: { id: billId },
      data: { status },
    });
  }

  // =======================
  // PAYMENTS
  // =======================

  async recordPayment(data: RecordPaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const bill = await tx.bill.findUnique({
        where: { id: data.billId },
        include: { payments: true },
      });

      if (!bill) {
        throw new NotFoundException('Bill not found');
      }

      if (bill.studentId !== data.studentId) {
        throw new BadRequestException('Bill does not belong to this student');
      }

      const totalPaid = bill.payments.reduce(
        (sum, p) => sum + Number(p.amountPaid),
        0,
      );

      const remaining = Number(bill.totalAmount) - totalPaid;

      if (data.amountPaid <= 0) {
        throw new BadRequestException('Amount paid must be greater than zero');
      }

      if (data.amountPaid > remaining) {
        throw new BadRequestException(
          `Payment exceeds remaining balance of ${remaining}`,
        );
      }

      // Optional: Validate payment method against allowed options from config(s)
      // (requires config relation or stored options on bill)

      const payment = await tx.payment.create({
        data: {
          amountPaid: data.amountPaid,
          paymentMethod: data.paymentMethod,
          paymentDate: new Date(),
          status: PaymentStatus.SUCCESS,
          student: { connect: { id: data.studentId } },
          bill: { connect: { id: data.billId } },
        },
      });

      const newTotalPaid = totalPaid + data.amountPaid;
      const newRemaining = Number(bill.totalAmount) - newTotalPaid;

      let newStatus: BillStatus;
      if (newRemaining <= 0) {
        newStatus = BillStatus.PAID;
      } else if (newTotalPaid > 0) {
        newStatus = BillStatus.PARTIAL;
      } else {
        newStatus = bill.status as BillStatus;
      }

      // Auto-mark as OVERDUE if past due and not fully paid
      if (newStatus !== BillStatus.PAID && bill.dueDate < new Date()) {
        newStatus = BillStatus.OVERDUE;
      }

      await tx.bill.update({
        where: { id: bill.id },
        data: { status: newStatus },
      });

      return {
        payment,
        bill: {
          ...bill,
          status: newStatus,
          remainingBalance: newRemaining,
        },
      };
    });
  }
}