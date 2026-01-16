// src/modules/billing/services/bill-config.service.ts

import { Injectable, BadRequestException,NotFoundException} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateBillConfigDto } from '../dto/create-bill-config.dto';
import { UpdateBillConfigDto } from '../dto/update-bill-config.dto';

@Injectable()
export class BillConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBillConfigDto) {
    return this.prisma.billConfiguration.create({
      data: {
        classId: dto.classId,
        feeType: dto.feeType,
        amount: dto.amount,
        description: dto.description,
        paymentMethodOptions: dto.paymentMethodOptions,
      },
    });
  }
async findOne(id: number) {
    const config = await this.prisma.billConfiguration.findUnique({
      where: { id },
      include: {
        class: true,
      },
    });

    if (!config) {
      throw new NotFoundException('Bill configuration not found');
    }

    return config;
  }

  async findAll() {
    return this.prisma.billConfiguration.findMany({
      include: { class: true },
    });
  }

  async findByClass(classId: number) {
    return this.prisma.billConfiguration.findMany({
      where: {
        classId,
        isActive: true,
      },
    });
  }

  async update(id: number, dto: UpdateBillConfigDto) {
    return this.prisma.billConfiguration.update({
      where: { id },
      data: dto,
    });
  }
async remove(id: number) {
  const config = await this.prisma.billConfiguration.findUnique({
    where: { id },
  });

  if (!config) {
    throw new NotFoundException('Bill configuration not found');
  }

  await this.prisma.billConfiguration.delete({
    where: { id },
  });
}


}
