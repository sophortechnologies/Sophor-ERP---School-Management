import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { RegisterStaffDto } from './dto/register-staff.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  /* ----------------------------- helpers ----------------------------- */

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * ✅ SAFE RESPONSE SHAPE
   * Prevents Prisma errors if schema changes
   */
  private staffSelect = {
    id: true,
    designation: true,
    employmentType: true,
    joiningDate: true,
    status: true,
    createdAt: true,
    user: {
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    },
    department: {
      select: {
        id: true,
        name: true,
      },
    },
  };

  /* ----------------------------- register ---------------------------- */

  // async register(dto: RegisterStaffDto) {
  //   return this.prisma.$transaction(async (tx) => {
  //     const user = await tx.user.create({
  //       data: {
  //         username: dto.username,
  //         email: dto.email,
  //         passwordHash: await this.hashPassword(dto.password),
  //         firstName: dto.firstName,
  //         lastName: dto.lastName,
  //         phone: dto.phone,
  //         role: {
  //           connect: { code: 'STAFF' },
  //         },
  //       },
  //       select: { id: true },
  //     });

  //     return tx.staff.create({
  //       data: {
  //         userId: user.id,
  //         designation: dto.designation,
  //         employmentType: dto.employmentType,
  //         joiningDate: dto.joiningDate
  //           ? new Date(dto.joiningDate)
  //           : undefined,
  //         departmentId: dto.departmentId,
  //       },
  //       select: this.staffSelect,
  //     });
  //   });
  // }
/* ----------------------------- REGISTER STAFF ----------------------------- */
async register(dto: RegisterStaffDto) {
  try {
    return await this.prisma.$transaction(async (tx) => {
      // 1️⃣ Check username or email already exists
      const existingUser = await tx.user.findFirst({
        where: {
          OR: [
            { username: dto.username },
            { email: dto.email },
          ],
        },
        select: { id: true },
      });

      if (existingUser) {
        throw new BadRequestException(
          'Username or email already exists',
        );
      }

      // 2️⃣ Check STAFF role exists
      const role = await tx.role.findUnique({
        where: { code: 'STAFF' },
        select: { id: true },
      });

      if (!role) {
        throw new BadRequestException('STAFF role does not exist');
      }

      // 3️⃣ Validate department (optional)
      if (dto.departmentId) {
        const department = await tx.department.findUnique({
          where: { id: dto.departmentId },
          select: { id: true },
        });

        if (!department) {
          throw new BadRequestException('Department not found');
        }
      }

      // 4️⃣ Create user
      const user = await tx.user.create({
        data: {
          username: dto.username,
          email: dto.email,
          passwordHash: await this.hashPassword(dto.password),
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          roleId: role.id,
        },
        select: { id: true },
      });

      // 5️⃣ Create staff
      return tx.staff.create({
        data: {
          userId: user.id,
          designation: dto.designation,
          employmentType: dto.employmentType,
          joiningDate: dto.joiningDate
            ? new Date(dto.joiningDate)
            : undefined,
          departmentId: dto.departmentId,
        },
        select: this.staffSelect,
      });
    });
  } catch (error) {
    console.error('Register staff failed:', error);

    if (error instanceof BadRequestException) {
      throw error;
    }

    // Prisma unique constraint fallback
    if (error.code === 'P2002') {
      throw new BadRequestException(
        'Username or email already exists',
      );
    }

    throw new BadRequestException(
      'Failed to register staff',
    );
  }
}


  /* ----------------------------- create ------------------------------ */

  // async create(dto: CreateStaffDto) {
  //   const user = await this.prisma.user.findUnique({
  //     where: { id: dto.userId },
  //     select: { role: { select: { code: true } } },
  //   });

  //   if (!user) throw new NotFoundException('User not found');
  //   if (user.role.code !== 'STAFF') {
  //     throw new BadRequestException('User must have STAFF role');
  //   }

  //   const exists = await this.prisma.staff.findUnique({
  //     where: { userId: dto.userId },
  //     select: { id: true },
  //   });

  //   if (exists) {
  //     throw new BadRequestException('Staff already exists for this user');
  //   }

  //   return this.prisma.staff.create({
  //     data: {
  //       userId: dto.userId,
  //       designation: dto.designation,
  //       employmentType: dto.employmentType,
  //       joiningDate: dto.joiningDate
  //         ? new Date(dto.joiningDate)
  //         : undefined,
  //       departmentId: dto.departmentId,
  //     },
  //     select: this.staffSelect,
  //   });
  // }
/* ----------------------------- CREATE STAFF ----------------------------- */

async create(dto: CreateStaffDto) {
  try {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { role: { select: { code: true } } },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role.code !== 'STAFF') {
      throw new BadRequestException('User must have STAFF role');
    }

    const exists = await this.prisma.staff.findUnique({
      where: { userId: dto.userId },
      select: { id: true },
    });

    if (exists) {
      throw new BadRequestException(
        'Staff already exists for this user',
      );
    }

    if (dto.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: dto.departmentId },
        select: { id: true },
      });

      if (!department) {
        throw new BadRequestException('Department not found');
      }
    }

    return await this.prisma.staff.create({
      data: {
        userId: dto.userId,
        designation: dto.designation,
        employmentType: dto.employmentType,
        joiningDate: dto.joiningDate
          ? new Date(dto.joiningDate)
          : undefined,
        departmentId: dto.departmentId,
      },
      select: this.staffSelect,
    });
  } catch (error) {
    console.error('Create staff failed:', error);

    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    ) {
      throw error;
    }

    throw new BadRequestException(
      error?.message || 'Failed to create staff',
    );
  }
}

  /* ----------------------------- FIND ALL (PAGINATED) ----------------------------- */

  async findAll(
    page = 1,
    pageSize = 10,
    baseUrl = 'http://localhost:5000/staff',
  ) {
    const skip = (page - 1) * pageSize;

    const [count, data] = await Promise.all([
      this.prisma.staff.count(),
      this.prisma.staff.findMany({
        skip,
        take: pageSize,
        orderBy: { id: 'desc' },
        select: this.staffSelect,
      }),
    ]);

    const totalPages = Math.ceil(count / pageSize);

    return {
      count,
      total_pages: totalPages,
      current_page: page,
      page_size: pageSize,
      next:
        page < totalPages
          ? `${baseUrl}?page=${page + 1}&page_size=${pageSize}`
          : null,
      previous:
        page > 1
          ? `${baseUrl}?page=${page - 1}&page_size=${pageSize}`
          : null,
      data,
    };
  }

  /* ----------------------------- FIND ONE ----------------------------- */

  async findOne(id: number) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
      select: this.staffSelect,
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    return staff;
  }

  /* ----------------------------- UPDATE ----------------------------- */

  async update(id: number, dto: UpdateStaffDto) {
    await this.findOne(id);

    return this.prisma.staff.update({
      where: { id },
      data: {
        designation: dto.designation,
        employmentType: dto.employmentType,
        joiningDate: dto.joiningDate
          ? new Date(dto.joiningDate)
          : undefined,
        departmentId: dto.departmentId,
        status: dto.status,
      },
      select: this.staffSelect,
    });
  }

  /* ----------------------------- DEACTIVATE ----------------------------- */

  async deactivate(id: number) {
    await this.findOne(id);

    return this.prisma.staff.update({
      where: { id },
      data: { status: 'INACTIVE' },
      select: { id: true, status: true },
    });
  }

  /* ----------------------------- SOFT DELETE ----------------------------- */

  async remove(id: number) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
      select: { status: true, userId: true },
    });

    if (!staff) throw new NotFoundException('Staff not found');

    if (staff.status === 'INACTIVE') {
      return { message: 'Staff already inactive' };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.staff.update({
        where: { id },
        data: { status: 'INACTIVE' },
      });

      if (staff.userId) {
        await tx.user.update({
          where: { id: staff.userId },
          data: { isActive: false },
        });
      }
    });

    return { message: 'Staff deactivated successfully' };
  }

  /* ----------------------------- HARD DELETE ----------------------------- */

  async hardDelete(id: number) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!staff) throw new NotFoundException('Staff not found');

    return this.prisma.$transaction(async (tx) => {
      await tx.staff.delete({ where: { id } });

      if (staff.userId) {
        await tx.user.delete({ where: { id: staff.userId } });
      }

      return { message: 'Staff permanently deleted' };
    });
  }
}
