import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { RegisterStaffDto } from './dto/register-staff.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private staffSelect = {
    id: true,
    designation: true,
    employmentType: true,
    joiningDate: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    user: {
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        role: {
          select: {
            id: true,
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
        code: true,
      },
    },
  };

  async register(dto: RegisterStaffDto) {
  const existingUser = await this.prisma.user.findFirst({
    where: {
      OR: [
        { username: dto.username },
        { email: dto.email },
      ],
    },
  });

  if (existingUser) {
    throw new ConflictException('Username or email already exists');
  }

  const role = await this.prisma.role.findUnique({
    where: { code: 'STAFF' },
  });

  if (!role) {
    throw new BadRequestException('STAFF role does not exist');
  }

  if (dto.departmentId) {
    const department = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });
    if (!department) {
      throw new BadRequestException('Department not found');
    }
  }

  return this.prisma.$transaction(async (tx) => {
    // 1. Create User
    const user = await tx.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        passwordHash: await this.hashPassword(dto.password),
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        roleId: role.id,
        isActive: true,
      },
    });

    // 2. Create Employee (ADD THIS BLOCK)
    const employee = await tx.employee.create({
      data: {
        employeeCode: `EMP-STF-${user.id}-${Date.now()}`,
        userId: user.id,
        firstName: dto.firstName ?? '',
        lastName: dto.lastName ?? '',
        employeeType: 'STAFF',
        departmentId: dto.departmentId ?? null,
        designation: dto.designation,
        joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : new Date(),
        employmentType: dto.employmentType ?? 'full_time',
        status: 'ACTIVE',
        // Banking fields
        bankName: dto.bankName ?? null,
        accountNumber: dto.accountNumber ?? null,
        ifscCode: dto.ifscCode ?? null,
        panNumber: dto.panNumber ?? null,
        uanNumber: dto.uanNumber ?? null,
        esiNumber: dto.esiNumber ?? null,
      },
    });

    // 3. Create Staff (with employeeId)
    const staff = await tx.staff.create({
      data: {
        userId: user.id,
        employeeId: employee.id,  // ← ADD THIS
        designation: dto.designation,
        employmentType: dto.employmentType,
        joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : new Date(),
        departmentId: dto.departmentId,
        status: 'ACTIVE',
        bankName: dto.bankName ?? null,
        accountNumber: dto.accountNumber ?? null,
        ifscCode: dto.ifscCode ?? null,
        panNumber: dto.panNumber ?? null,
        uanNumber: dto.uanNumber ?? null,
        esiNumber: dto.esiNumber ?? null,
      },
      select: this.staffSelect,
    });

    // 4. Update Employee with staffId (ADD THIS)
    await tx.employee.update({
      where: { id: employee.id },
      data: { staffId: staff.id },
    });

    return {
      userId: user.id,
      employeeId: employee.id,
      staffId: staff.id,
    };
  });
}
  async create(dto: CreateStaffDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { role: { select: { code: true } }, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role.code !== 'STAFF') {
      throw new BadRequestException('User must have STAFF role');
    }

    if (!user.isActive) {
      throw new BadRequestException('User account is inactive');
    }

    const existingStaff = await this.prisma.staff.findUnique({
      where: { userId: dto.userId },
    });

    if (existingStaff) {
      throw new ConflictException('Staff already exists for this user');
    }

    if (dto.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: dto.departmentId },
      });
      if (!department) {
        throw new BadRequestException('Department not found');
      }
    }

    return this.prisma.staff.create({
      data: {
        userId: dto.userId,
        designation: dto.designation,
        employmentType: dto.employmentType,
        joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : new Date(),
        departmentId: dto.departmentId,
        status: 'ACTIVE',
      },
      select: this.staffSelect,
    });
  }

  async findAll(
    page = 1,
    pageSize = 10,
    baseUrl?: string,
    status?: string,
    departmentId?: number,
    search?: string,
  ) {
    const skip = (page - 1) * pageSize;
    const take = Math.min(pageSize, 50);

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { designation: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [count, data] = await Promise.all([
      this.prisma.staff.count({ where }),
      this.prisma.staff.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: this.staffSelect,
      }),
    ]);

    const totalPages = Math.ceil(count / take);

    const response: any = {
      count,
      total_pages: totalPages,
      current_page: page,
      page_size: take,
      data,
    };

    if (baseUrl && totalPages > 0) {
      let url = baseUrl;
      const params = [];
      if (status) params.push(`status=${status}`);
      if (departmentId) params.push(`departmentId=${departmentId}`);
      if (search) params.push(`search=${search}`);

      const queryString = params.length > 0 ? `?${params.join('&')}` : '';

      if (page < totalPages) {
        response.next = `${url}${queryString}&page=${page + 1}&page_size=${take}`;
      }
      if (page > 1) {
        response.previous = `${url}${queryString}&page=${page - 1}&page_size=${take}`;
      }
    }

    return response;
  }

  async findOne(id: number) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
      select: {
        ...this.staffSelect,
        payrolls: {
          select: {
            id: true,
            salaryMonth: true,
            netSalary: true,
            status: true,
            paymentDate: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 6,
        },
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    return staff;
  }

  async update(id: number, dto: UpdateStaffDto) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    if (dto.departmentId !== undefined) {
      if (dto.departmentId !== null) {
        const department = await this.prisma.department.findUnique({
          where: { id: dto.departmentId },
        });
        if (!department) {
          throw new BadRequestException('Department not found');
        }
      }
    }

    return this.prisma.staff.update({
      where: { id },
      data: {
        designation: dto.designation,
        employmentType: dto.employmentType,
        joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : undefined,
        departmentId: dto.departmentId === null ? null : dto.departmentId,
        status: dto.status,
      },
      select: this.staffSelect,
    });
  }

  async deactivate(id: number) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    if (staff.status === 'INACTIVE') {
      throw new BadRequestException('Staff is already inactive');
    }

    const hasActivePayroll = await this.prisma.payroll.findFirst({
      where: {
        staffId: id,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (hasActivePayroll) {
      throw new BadRequestException(
        'Cannot deactivate staff with pending or approved payroll'
      );
    }

    return this.prisma.$transaction(async (tx) => {
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

      return { message: 'Staff deactivated successfully' };
    });
  }

  async remove(id: number) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    if (staff.status === 'INACTIVE') {
      return { message: 'Staff already inactive' };
    }

    return this.deactivate(id);
  }

  async hardDelete(id: number) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
      include: {
        payrolls: { select: { id: true } },
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    if (staff.payrolls.length > 0) {
      throw new BadRequestException(
        `Cannot delete staff with ${staff.payrolls.length} payroll records. Archive instead.`
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.staff.delete({ where: { id } });

      if (staff.userId) {
        await tx.user.delete({ where: { id: staff.userId } });
      }

      return { message: 'Staff permanently deleted' };
    });
  }

  async findStaffByUserId(userId: number) {
    return this.prisma.staff.findUnique({
      where: { userId },
      select: { id: true, status: true },
    });
  }

  async getStaffDashboard(staffId: number) {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        department: { select: { name: true } },
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    const [attendanceCount, leaveCount, payrollCount] = await Promise.all([
      this.prisma.staffAttendance.count({
        where: { userId: staff.userId, status: 'PRESENT' },
      }),
      this.prisma.staffLeave.count({
        where: { userId: staff.userId, status: 'APPROVED' },
      }),
      this.prisma.payroll.count({
        where: { staffId: staff.id },
      }),
    ]);

    const recentAttendance = await this.prisma.staffAttendance.findMany({
      where: { userId: staff.userId },
      orderBy: { date: 'desc' },
      take: 10,
    });

    const recentPayrolls = await this.prisma.payroll.findMany({
      where: { staffId: staff.id },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    return {
      staff: {
        id: staff.id,
        name: `${staff.user.firstName} ${staff.user.lastName}`,
        email: staff.user.email,
        designation: staff.designation,
        department: staff.department?.name,
        employmentType: staff.employmentType,
        joiningDate: staff.joiningDate,
        status: staff.status,
      },
      statistics: {
        totalAttendance: attendanceCount,
        totalLeavesTaken: leaveCount,
        totalPayrolls: payrollCount,
      },
      recentAttendance,
      recentPayrolls,
      lastUpdated: new Date(),
    };
  }

  async getWeeklyReport(userId: number) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const attendance = await this.prisma.staffAttendance.findMany({
      where: {
        userId,
        date: { gte: weekStart, lte: weekEnd },
      },
      orderBy: { date: 'asc' },
    });

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);
      const record = attendance.find(a => a.date.toDateString() === currentDate.toDateString());

      weeklyData.push({
        day: daysOfWeek[i],
        date: currentDate,
        status: record?.status || 'NOT_MARKED',
        checkIn: record?.checkIn,
        checkOut: record?.checkOut,
      });
    }

    const presentCount = attendance.filter(a => a.status === 'PRESENT').length;
    const absentCount = attendance.filter(a => a.status === 'ABSENT').length;
    const lateCount = attendance.filter(a => a.status === 'LATE').length;

    return {
      weekStart,
      weekEnd,
      weeklyData,
      summary: {
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        totalDays: 7,
        attendanceRate: Math.round((presentCount / 7) * 100),
      },
    };
  }
}