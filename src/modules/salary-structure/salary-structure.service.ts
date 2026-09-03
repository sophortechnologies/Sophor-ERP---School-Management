import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { UpdateSalaryStructureDto } from './dto/update-salary-structure.dto';

@Injectable()
export class SalaryStructureService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSalaryStructureDto) {
    return this.prisma.salaryStructure.create({
      data: {
        userId: dto.userId,
        basePay: dto.basePay,
        components: dto.components ? {
          create: dto.components.map(comp => ({
            name: comp.name,
            type: comp.type,
            calculationType: comp.calculationType || 'FIXED',
            value: comp.value || 0,
            dependsOn: comp.dependsOn,
            isTaxable: comp.isTaxable || false,
            isStatutory: comp.isStatutory || false,
            order: comp.order || 0,
          }))
        } : undefined,
      },
      include: { components: true },
    });
  }

  async findByUser(userId: number) {
    return this.prisma.salaryStructure.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        components: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const structure = await this.prisma.salaryStructure.findUnique({
      where: { id },
      include: { components: true },
    });

    if (!structure) {
      throw new NotFoundException('Salary structure not found');
    }

    return structure;
  }

  async update(id: number, dto: UpdateSalaryStructureDto) {
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      if (dto.components) {
        await tx.salaryComponent.deleteMany({
          where: { structureId: id },
        });
      }

      return tx.salaryStructure.update({
        where: { id },
        data: {
          basePay: dto.basePay,
          isActive: dto.isActive,
          components: dto.components ? {
            create: dto.components.map((c) => ({
              name: c.name,
              type: c.type,
              calculationType: c.calculationType || 'FIXED',
              value: c.value || 0,
              dependsOn: c.dependsOn,
              isTaxable: c.isTaxable || false,
              isStatutory: c.isStatutory || false,
              order: c.order || 0,
            })),
          } : undefined,
        },
        include: { components: true },
      });
    });
  }

  async deactivate(id: number) {
    return this.prisma.salaryStructure.update({
      where: { id },
      data: { isActive: false },
    });
  }
}