import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { QueryDepartmentDto } from './dto/query-department.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger(DepartmentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new department
   */
  async create(createDto: CreateDepartmentDto) {
    try {
      // unique name
      const existingByName = await this.prisma.department.findFirst({
        where: { name: createDto.name },
      });
      if (existingByName) {
        throw new ConflictException(
          `Department with name '${createDto.name}' already exists`,
        );
      }

      // unique code (optional)
      if (createDto.code) {
        const existingByCode = await this.prisma.department.findFirst({
          where: { code: createDto.code },
        });
        if (existingByCode) {
          throw new ConflictException(
            `Department with code '${createDto.code}' already exists`,
          );
        }
      }

      // validate head if provided (assumes head is a Teacher)
      if (createDto.headId) {
        const head = await this.prisma.teacher.findUnique({
          where: { id: createDto.headId },
        });
        if (!head) {
          throw new BadRequestException(
            `Teacher with ID ${createDto.headId} not found`,
          );
        }
      }

      // create using relation connect for head (Prisma-safe)
      const department = await this.prisma.department.create({
        data: {
          name: createDto.name,
          code: createDto.code,
          description: createDto.description,
          isActive: createDto.isActive ?? true,
          ...(createDto.headId && {
            head: { connect: { id: createDto.headId } }, // only works if schema has head relation
          }),
        },
        include: {
          _count: {
            select: { teachers: true, staff: true, subjects: true },
          },
        },
      });

      this.logger.log(`Department created (id=${department.id})`);
      return department;
    } catch (err) {
      this.logger.error('create() failed', err as any);
      throw err;
    }
  }

  /**
   * Find departments with filtering, pagination, sorting
   */
  async findAll(query: QueryDepartmentDto) {
    const { search, isActive, page = 1, limit = 10, sortBy, sortOrder } = query;

    const where: Prisma.DepartmentWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (typeof isActive !== 'undefined') {
      where.isActive = isActive;
    }

    const take = Math.max(1, Math.min(100, limit)); // safe bounds
    const skip = Math.max(0, (page - 1) * take);

    const orderBy =
      sortBy && sortOrder
        ? { [sortBy]: sortOrder as Prisma.SortOrder }
        : { name: 'asc' as const };

    const [data, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          _count: { select: { teachers: true, staff: true, subjects: true } },
        },
      }),
      this.prisma.department.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit: take,
        totalPages: Math.max(1, Math.ceil(total / take)),
      },
    };
  }

  /**
   * Simple list of active departments
   */
  async findAllActive() {
    return this.prisma.department.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true, description: true },
    });
  }

  /**
   * Get single department with related lists & counts
   * NOTE: 'head' include is NOT present here to avoid errors unless your Prisma schema defines it.
   * If your schema has `head` relation, change `include` to add `head: true`.
   */
  async findOne(id: number) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        subjects: true,
        teachers: {
          include: {
            user: { select: { id: true, username: true, firstName: true, lastName: true, email: true, phone: true } },
          },
        },
        staff: {
          include: {
            user: { select: { id: true, username: true, firstName: true, lastName: true, email: true, phone: true } },
          },
        },
        _count: { select: { teachers: true, staff: true, subjects: true } },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  /**
   * Update department
   */
  async update(id: number, updateDto: UpdateDepartmentDto) {
    // ensure exists
    await this.findOne(id);

    // validate head if provided
    if (typeof updateDto.headId !== 'undefined' && updateDto.headId !== null) {
      const head = await this.prisma.teacher.findUnique({
        where: { id: updateDto.headId },
      });
      if (!head) {
        throw new BadRequestException(
          `Teacher with ID ${updateDto.headId} not found`,
        );
      }
    }

    const data: Prisma.DepartmentUpdateInput = {
      name: updateDto.name,
      code: updateDto.code,
      description: updateDto.description,
      isActive: updateDto.isActive,
      ...(typeof updateDto.headId !== 'undefined' && updateDto.headId !== null
        ? {
            head: { connect: { id: updateDto.headId } }, // requires head relation
          }
        : {}),
    };

    const department = await this.prisma.department.update({
      where: { id },
      data,
      include: { _count: { select: { teachers: true, staff: true, subjects: true } } },
    });

    this.logger.log(`Department updated (id=${id})`);
    return department;
  }

  /**
   * Deactivate department (soft delete)
   */
  async deactivate(id: number) {
    await this.findOne(id);
    return this.prisma.department.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Activate department
   */
  async activate(id: number) {
    await this.findOne(id);
    return this.prisma.department.update({
      where: { id },
      data: { isActive: true },
    });
  }

  /**
   * Hard delete (only if no related records)
   */
  async remove(id: number) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { teachers: true, staff: true, subjects: true } } },
    });

    if (!dept) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    if (dept._count.teachers || dept._count.staff || dept._count.subjects) {
      throw new BadRequestException(
        'Cannot delete department with related teachers, staff or subjects. Please deactivate instead.',
      );
    }

    await this.prisma.department.delete({ where: { id } });
    this.logger.log(`Department deleted (id=${id})`);
    return { message: 'Department deleted successfully' };
  }

  /**
   * Get statistics for a single department
   */
  async getStatistics(id: number) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { teachers: true, staff: true, subjects: true } } },
    });

    if (!dept) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return {
      id: dept.id,
      name: dept.name,
      code: dept.code,
      totalTeachers: dept._count.teachers,
      totalStaff: dept._count.staff,
      totalSubjects: dept._count.subjects,
      totalMembers: dept._count.teachers + dept._count.staff,
      isActive: dept.isActive,
    };
  }

  /**
   * Get statistics for all departments
   */
  async getAllStatistics() {
    const departments = await this.prisma.department.findMany({
      include: { _count: { select: { teachers: true, staff: true, subjects: true } } },
      orderBy: { name: 'asc' },
    });

    return departments.map((d) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      totalTeachers: d._count.teachers,
      totalStaff: d._count.staff,
      totalSubjects: d._count.subjects,
      totalMembers: d._count.teachers + d._count.staff,
      isActive: d.isActive,
    }));
  }
}
