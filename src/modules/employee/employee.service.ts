import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationService } from '../../common/pagination/pagination.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { EmployeeStatus } from './enums/employee.enum';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async create(dto: CreateEmployeeDto) {
    // Check if employee code exists
    const existingEmployee = await this.prisma.employee.findUnique({
      where: { employeeCode: dto.employeeCode },
    });
    if (existingEmployee) {
      throw new ConflictException(`Employee code ${dto.employeeCode} already exists`);
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    // Check teacher if provided
    if (dto.teacherId) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { id: dto.teacherId },
      });
      if (!teacher) {
        throw new NotFoundException(`Teacher with ID ${dto.teacherId} not found`);
      }
    }

    // Check staff if provided
    if (dto.staffId) {
      const staff = await this.prisma.staff.findUnique({
        where: { id: dto.staffId },
      });
      if (!staff) {
        throw new NotFoundException(`Staff with ID ${dto.staffId} not found`);
      }
    }

    // Create employee with salaryStructureId
    const employee = await this.prisma.employee.create({
      data: {
        employeeCode: dto.employeeCode,
        userId: dto.userId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        employeeType: dto.employeeType,
        departmentId: dto.departmentId,
        designation: dto.designation,
        joiningDate: new Date(dto.joiningDate),
        employmentType: dto.employmentType,
        status: dto.status,
        teacherId: dto.teacherId,
        staffId: dto.staffId,
        salaryStructureId: dto.salaryStructureId,  // ← KEY: Include this
      },
      include: {
        user: { select: { email: true, phone: true, username: true } },
        department: true,
        teacher: true,
        staff: true,
      },
    });

    return employee;
  }


  async findAll(query: EmployeeQueryDto, baseUrl: string) {
  const where: any = {};

  if (query.employeeType) where.employeeType = query.employeeType;
  if (query.status) where.status = query.status;
  if (query.departmentId) where.departmentId = query.departmentId;

  if (query.search) {
    where.OR = [
      { firstName: { contains: query.search, mode: 'insensitive' } },
      { lastName: { contains: query.search, mode: 'insensitive' } },
      { employeeCode: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const page = query.page || 1;
  const pageSize = query.limit || 10;
  const skip = (page - 1) * pageSize;

  const [data, total] = await Promise.all([
    this.prisma.employee.findMany({
      where,
      skip,
      take: pageSize,
      include: {
        user: { select: { email: true, phone: true, username: true } },
        department: true,
        teacher: true,
        staff: true,
      },
      // Remove orderBy or use a field that exists
      // orderBy: { id: 'desc' },  // Optional
    }),
    this.prisma.employee.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    count: total,
    total_pages: totalPages,
    current_page: page,
    page_size: pageSize,
    next: page < totalPages ? `${baseUrl}?page=${page + 1}&page_size=${pageSize}` : null,
    previous: page > 1 ? `${baseUrl}?page=${page - 1}&page_size=${pageSize}` : null,
    data,
  };
}
  async findOne(id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, phone: true, username: true } },
        department: true,
        teacher: true,
        staff: true,
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async findByUserId(userId: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true, phone: true, username: true } },
        department: true,
        teacher: true,
        staff: true,
      },
    });

    return employee;
  }

  async update(id: number, dto: UpdateEmployeeDto) {
    await this.findOne(id);

    const employee = await this.prisma.employee.update({
      where: { id },
      data: {
        employeeCode: dto.employeeCode,
        firstName: dto.firstName,
        lastName: dto.lastName,
        employeeType: dto.employeeType,
        departmentId: dto.departmentId,
        designation: dto.designation,
        joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : undefined,
        employmentType: dto.employmentType,
        status: dto.status,
        teacherId: dto.teacherId,
        staffId: dto.staffId,
        // salaryStructureId: dto.salaryStructureId,
        // baseSalary: dto.baseSalary,
      },
      include: {
        user: { select: { email: true, phone: true, username: true } },
        department: true,
        teacher: true,
        staff: true,
      },
    });

    return employee;
  }

  async updateStatus(id: number, status: EmployeeStatus) {
    await this.findOne(id);

    const employee = await this.prisma.employee.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { email: true, phone: true, username: true } },
        department: true,
        teacher: true,
        staff: true,
      },
    });

    return employee;
  }

  async remove(id: number) {
    const employee = await this.findOne(id);

    const payrollCount = await this.prisma.payrollRecord.count({
      where: { employeeId: id },
    });

    if (payrollCount > 0) {
      await this.prisma.employee.update({
        where: { id },
        data: { status: EmployeeStatus.TERMINATED },
      });
      return { message: 'Employee marked as terminated due to existing payroll records' };
    }

    await this.prisma.employee.delete({ where: { id } });
    return { message: 'Employee deleted successfully' };
  }

  async getDashboardStats() {
    const employees = await this.prisma.employee.findMany({
      select: { employeeType: true, status: true },
    });

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    for (const emp of employees) {
      byType[emp.employeeType] = (byType[emp.employeeType] || 0) + 1;
      byStatus[emp.status] = (byStatus[emp.status] || 0) + 1;
    }

    return {
      totalEmployees: employees.length,
      byType,
      byStatus,
      activeCount: byStatus[EmployeeStatus.ACTIVE] || 0,
      onLeaveCount: byStatus[EmployeeStatus.ON_LEAVE] || 0,
      terminatedCount: byStatus[EmployeeStatus.TERMINATED] || 0,
    };
  }
}