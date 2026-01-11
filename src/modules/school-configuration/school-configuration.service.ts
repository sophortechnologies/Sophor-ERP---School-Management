import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSchoolConfigurationDto } from './dto/create-school-configuration.dto';
import { UpdateSchoolConfigurationDto } from './dto/update-school-configuration.dto';
import { buildPaginatedResponse } from 'src/common/pagination/pagination.util';

@Injectable()
export class SchoolConfigurationService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE
  async create(createDto: CreateSchoolConfigurationDto) {
    return this.prisma.schoolConfiguration.create({
      data: createDto,
    });
  }

  // FIND ALL (PAGINATED)
  async findAll(page: number, pageSize: number, baseUrl: string) {
    const skip = (page - 1) * pageSize;

    const [count, data] = await this.prisma.$transaction([
      this.prisma.schoolConfiguration.count(),
      this.prisma.schoolConfiguration.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return buildPaginatedResponse(
      data,
      count,
      page,
      pageSize,
      baseUrl,
    );
  }

  // FIND "ACTIVE" → fallback to latest configuration
  async findActive() {
    const config = await this.prisma.schoolConfiguration.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!config) {
      throw new NotFoundException('School configuration not found');
    }

    return config;
  }

  // CURRENT ACADEMIC YEAR
  async getCurrentAcademicYear() {
    const config = await this.prisma.schoolConfiguration.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!config) {
      throw new NotFoundException('Academic year not found');
    }

    return {
      academicYear: config.academicYear,
      startDate: config.startDate,
      endDate: config.endDate,
    };
  }

  // FIND ONE
  async findOne(id: number) {
    const config = await this.prisma.schoolConfiguration.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException(
        `School configuration with ID ${id} not found`,
      );
    }

    return config;
  }

  // UPDATE
  async update(id: number, updateDto: UpdateSchoolConfigurationDto) {
    await this.findOne(id);

    return this.prisma.schoolConfiguration.update({
      where: { id },
      data: updateDto,
    });
  }

  // DELETE
  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.schoolConfiguration.delete({
      where: { id },
    });
  }
}
