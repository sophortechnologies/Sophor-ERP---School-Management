import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSectionDto) {
    const classExists = await this.prisma.class.findUnique({
      where: { id: dto.classId },
    });

    if (!classExists) {
      throw new NotFoundException('Class not found');
    }

    return this.prisma.section.create({
      data: {
        name: dto.name,
        classId: dto.classId,
        capacity: dto.capacity,
      },
    });
  }

  async findAll() {
    return this.prisma.section.findMany({
      include: {
        class: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: {
        class: true,
        students: true,
      },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    return section;
  }

  async findByClass(classId: number) {
    return this.prisma.section.findMany({
      where: { classId },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: number, dto: UpdateSectionDto) {
    const exists = await this.prisma.section.findUnique({ where: { id } });

    if (!exists) {
      throw new NotFoundException('Section not found');
    }

    return this.prisma.section.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    const exists = await this.prisma.section.findUnique({ where: { id } });

    if (!exists) {
      throw new NotFoundException('Section not found');
    }

    return this.prisma.section.delete({
      where: { id },
    });
  }
}
