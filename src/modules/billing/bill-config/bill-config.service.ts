import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateBillConfigDto } from '../dto/create-bill-config.dto';
import { UpdateBillConfigDto } from '../dto/update-bill-config.dto';

@Injectable()
export class BillConfigService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateBillConfigDto) {
    return this.prisma.billConfiguration.create({
      data: {
        ...dto,
        paymentMethodOptions: dto.paymentMethodOptions,
      },
    });
  }

  findAll() {
    return this.prisma.billConfiguration.findMany({
      include: { class: true },
    });
  }

  update(id: number, dto: UpdateBillConfigDto) {
    return this.prisma.billConfiguration.update({
      where: { id },
      data: dto,
    });
  }
}
