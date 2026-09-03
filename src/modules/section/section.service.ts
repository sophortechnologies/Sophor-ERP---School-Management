import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { PaginationDto } from '../../common/pagination/pagination.dto';  // ← ADD THIS
import { buildPaginatedResponse } from '../../common/pagination/pagination.util';  // ← ADD THIS
import { PaginationService } from '../../common/pagination/pagination.service';  // ← ADD THIS


@Injectable()
export class SectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,  // ← ADD THIS
  ) {}

  async create(dto: CreateSectionDto) {
    const existing = await this.prisma.section.findFirst({
      where: {
        name: dto.name,
        classId: dto.classId,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Section "${dto.name}" already exists in this class`
      );
    }

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

  // ✅ NEW - Using master pagination
  async findAll(paginationDto: PaginationDto) {
    return this.paginationService.paginate(
      this.prisma.section,
      paginationDto,
      {
        include: {
          class: {
            select: { id: true, name: true },
          },
          _count: {
            select: { students: true },
          },
        },
        searchFields: ['name'],  // Search by section name
      }
    );
  }

  // ✅ OLD METHOD - Keep for backward compatibility if needed
  async findAllLegacy() {
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
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: {
        _count: {
          select: { students: true },
        },
      },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    // Check for duplicate section name in the same class
    if (dto.name && dto.name !== section.name) {
      const existingSection = await this.prisma.section.findFirst({
        where: {
          name: dto.name,
          classId: section.classId,
          id: { not: id },
        },
      });

      if (existingSection) {
        throw new ConflictException(
          `Section with name "${dto.name}" already exists in this class`
        );
      }
    }

    // Validate capacity cannot be less than current student count
    if (dto.capacity !== undefined && dto.capacity < section._count.students) {
      throw new BadRequestException(
        `Cannot reduce capacity to ${dto.capacity} because section currently has ${section._count.students} students`
      );
    }

    // Validate capacity cannot be negative
    if (dto.capacity !== undefined && dto.capacity < 0) {
      throw new BadRequestException('Capacity cannot be negative');
    }

    return this.prisma.section.update({
      where: { id },
      data: {
        name: dto.name,
        capacity: dto.capacity,
      },
      include: {
        class: {
          select: { id: true, name: true },
        },
        _count: {
          select: { students: true },
        },
      },
    });
  }

  async remove(id: number, transferToSectionId?: number) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: {
        _count: {
          select: { students: true, timetables: true, sectionSubjects: true },
        },
      },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    // Check if section has students
    if (section._count.students > 0) {
      if (!transferToSectionId) {
        throw new BadRequestException(
          `Section has ${section._count.students} students. Please provide transferToSectionId to move students before deletion.`
        );
      }

      // Verify target section exists
      const targetSection = await this.prisma.section.findUnique({
        where: { id: transferToSectionId },
      });

      if (!targetSection) {
        throw new NotFoundException('Target section not found for student transfer');
      }

      // Verify target section is in same class
      if (targetSection.classId !== section.classId) {
        throw new BadRequestException(
          'Cannot transfer students to a section in a different class'
        );
      }

      // Transfer students to target section
      await this.prisma.student.updateMany({
        where: { sectionId: id },
        data: { sectionId: transferToSectionId },
      });
    }

    // Check if section has timetables
    if (section._count.timetables > 0) {
      await this.prisma.classTimetable.deleteMany({
        where: { sectionId: id },
      });
    }

    // Check if section has subject assignments
    if (section._count.sectionSubjects > 0) {
      await this.prisma.sectionSubject.deleteMany({
        where: { sectionId: id },
      });
    }

    return this.prisma.section.delete({
      where: { id },
    });
  }
}