import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateBillDto } from '../dto/create-bill.dto';

@Injectable()
export class BillsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBillDto) {
    const config = await this.prisma.billConfiguration.findUnique({
      where: { id: dto.billConfigId },
    });

    return this.prisma.bill.create({
      data: {
        studentId: dto.studentId,
        billConfigId: dto.billConfigId,
        billCode: `BILL-${Date.now()}`,
        totalAmount: config.amount,
        status: 'UNPAID',
        dueDate: new Date(dto.dueDate),
      },
    });
  }

  findByStudent(studentId: number) {
    return this.prisma.bill.findMany({
      where: { studentId },
      include: { payments: true },
    });
  }
}
