import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateSalaryStructureDto } from './dto/create-salary-component.dto';
import { CreateSalaryComponentDto } from './dto/create-salary-structure.dto';
import { Prisma } from '@prisma/client';
import { GeneratePayrollDto } from './dto/generate-payroll.dto';

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  // FR4.1 + FR4.4
  async createSalaryStructure(dto: CreateSalaryStructureDto) {
    const staff = await this.prisma.staff.findUnique({
      where: { userId: dto.userId },
    });
    if (!staff) throw new NotFoundException('Staff not found');

    return this.prisma.salaryStructure.create({
      data: {
        userId: dto.userId,
        basePay: dto.basePay,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async addSalaryComponent(dto: CreateSalaryComponentDto) {
    const structure = await this.prisma.salaryStructure.findUnique({
      where: { id: dto.structureId },
    });
    if (!structure) throw new NotFoundException('Salary structure not found');

    return this.prisma.salaryComponent.create({
      data: dto,
    });
  }

  // FR4.5 – Core payroll calculation
async generatePayroll(dto: GeneratePayrollDto, userId: number) {
  const staffList = dto.staffId
    ? [await this.getStaffWithStructure(dto.staffId)]
    : await this.prisma.staff.findMany({
        where: { status: 'ACTIVE' },
        include: {
          user: {
            include: { salaryStructures: { where: { isActive: true } } },
          },
        },
      });

  const payrollRecords = [];

  for (const staff of staffList) {
    const structures = staff.user?.salaryStructures;
    if (!structures || structures.length === 0) continue;

    const structure = structures[0]; // Use the active one (you can add logic to pick latest if multiple)

    // Convert Decimal fields to number for arithmetic
    const basePay = structure.basePay.toNumber();

    const workingDays = 22; // You can make this dynamic later (e.g., from config or calendar)
    const presentDays = await this.getPresentDays(staff.userId, dto.salaryMonth);

    // Daily rate = basePay / workingDays
    const dailyRate = basePay / workingDays;
    const absentDays = workingDays - presentDays;
    const leaveDeduction = absentDays * dailyRate;

    // Fetch salary components
    const components = await this.prisma.salaryComponent.findMany({
      where: { structureId: structure.id },
    });

    let allowances = 0;
    let deductions = leaveDeduction; // Start with leave-based deduction

    for (const comp of components) {
      const amount = comp.amount.toNumber();
      if (comp.type === 'ALLOWANCE') {
        allowances += amount;
      } else if (comp.type === 'DEDUCTION') {
        deductions += amount;
      }
    }

    // Final net salary calculation
    const grossSalary = basePay + allowances;
    const netSalary = grossSalary - deductions;

    // Create payroll record – convert numbers back to Prisma.Decimal where needed
    const payroll = await this.prisma.payroll.create({
      data: {
        staffId: staff.id,
        salaryMonth: dto.salaryMonth,
        basicSalary: structure.basePay, // Already Decimal
        allowances: new Prisma.Decimal(allowances),
        deductions: new Prisma.Decimal(deductions),
        netSalary: new Prisma.Decimal(netSalary),
        status: 'PENDING',
      },
    });

    payrollRecords.push(payroll);
  }

  return payrollRecords;
}

  private async getStaffWithStructure(staffId: number) {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
      include: { user: { include: { salaryStructures: true } } },
    });
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  private async getPresentDays(userId: number, salaryMonth: string) {
    // Example: count PRESENT days in given month
    // You'll need to adjust based on how attendance is stored for staff
    // Currently your schema has Attendance only for students
    // → You might need to extend schema or use Leave model
    return 20; // placeholder
  }

  // ... other methods: getPayslips, approvePayroll, generatePayslipPdf, etc.
}