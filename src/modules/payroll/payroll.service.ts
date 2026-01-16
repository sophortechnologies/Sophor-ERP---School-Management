import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from '@prisma/client';

import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { CreateSalaryComponentDto } from './dto/create-salary-component.dto';
import { GeneratePayrollDto } from './dto/generate-payroll.dto';
import { UpdateSalaryComponentDto } from './dto/update-salary-component.dto';

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  // ===========================
  // Salary Structure
  // ===========================

  async createSalaryStructure(dto: CreateSalaryStructureDto) {
    const staff = await this.prisma.staff.findUnique({
      where: { userId: dto.userId },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

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

    if (!structure) {
      throw new NotFoundException('Salary structure not found');
    }

    return this.prisma.salaryComponent.create({
      data: dto,
    });
  }

  // ===========================
  // Payroll Generation (CORE)
  // ===========================

  async generatePayroll(dto: GeneratePayrollDto, userId: number) {
    const staffList = dto.staffId
      ? [await this.getStaffWithActiveStructure(dto.staffId)]
      : await this.prisma.staff.findMany({
          where: { status: 'ACTIVE' },
          include: {
            user: {
              include: {
                salaryStructures: { where: { isActive: true } },
              },
            },
          },
        });

    const results = [];

    for (const staff of staffList) {
      const structure = staff.user.salaryStructures[0];
      if (!structure) continue;

      // Prevent duplicate payroll for same month
      const exists = await this.prisma.payroll.findFirst({
        where: {
          staffId: staff.id,
          salaryMonth: dto.salaryMonth,
        },
      });

      if (exists) {
        throw new BadRequestException(
          `Payroll already exists for staff ${staff.id} (${dto.salaryMonth})`,
        );
      }

      const basePay = structure.basePay.toNumber();

      const workingDays = 22;
      const presentDays = await this.getPresentDays(
        staff.userId,
        dto.salaryMonth,
      );

      const dailyRate = basePay / workingDays;
      const absentDays = workingDays - presentDays;
      const leaveDeduction = absentDays * dailyRate;

      const components = await this.prisma.salaryComponent.findMany({
        where: { structureId: structure.id },
      });

      let allowances = 0;
      let deductions = leaveDeduction;

      for (const comp of components) {
        const amount = comp.amount.toNumber();
        if (comp.type === 'ALLOWANCE') allowances += amount;
        if (comp.type === 'DEDUCTION') deductions += amount;
      }

      const netSalary = basePay + allowances - deductions;

      // TRANSACTION: Payroll + Payslip
      const payroll = await this.prisma.$transaction(async (tx) => {
        const payrollRecord = await tx.payroll.create({
          data: {
            staffId: staff.id,
            salaryMonth: dto.salaryMonth,
            basicSalary: structure.basePay,
            allowances: new Prisma.Decimal(allowances),
            deductions: new Prisma.Decimal(deductions),
            netSalary: new Prisma.Decimal(netSalary),
            status: 'PENDING',
          },
        });

        await tx.payslip.create({
          data: {
            payrollId: payrollRecord.id,
            userId: staff.userId,
            amount: payrollRecord.netSalary,
          },
        });

        return payrollRecord;
      });

      results.push(payroll);
    }

    return results;
  }

  // ===========================
  // Queries
  // ===========================

  async getStaffPayrolls(staffId: number) {
    return this.prisma.payroll.findMany({
      where: { staffId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStaffPayslips(staffId: number) {
    return this.prisma.payslip.findMany({
      where: {
        payroll: { staffId },
      },
      include: {
        payroll: true,
      },
    });
  }

  async getPayslip(payrollId: number) {
    const payslip = await this.prisma.payslip.findFirst({
      where: { payrollId },
      include: {
        payroll: true,
        user: true,
      },
    });

    if (!payslip) {
      throw new NotFoundException('Payslip not found');
    }

    return payslip;
  }

  // ===========================
  // Approval
  // ===========================

  async approvePayroll(payrollId: number) {
    const payroll = await this.prisma.payroll.findUnique({
      where: { id: payrollId },
    });

    if (!payroll) {
      throw new NotFoundException('Payroll not found');
    }

    return this.prisma.payroll.update({
      where: { id: payrollId },
      data: {
        status: 'APPROVED',
        paymentDate: new Date(),
      },
    });
  }

  // ===========================
  // Payslip PDF (placeholder)
  // ===========================

  async generatePayslipPdf(payrollId: number) {
    const payslip = await this.getPayslip(payrollId);

    /**
     * PDF generation will go here
     * (PDFKit / Puppeteer)
     */

    return {
      message: 'Payslip PDF generation not implemented yet',
      payslip,
    };
  }

  // ===========================
  // Helpers
  // ===========================

  private async getStaffWithActiveStructure(staffId: number) {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        user: {
          include: {
            salaryStructures: { where: { isActive: true } },
          },
        },
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    return staff;
  }

  private async getPresentDays(userId: number, salaryMonth: string) {
    // Placeholder until staff attendance / leave module is integrated
    return 20;
  }

  
async createSalaryComponent(dto: CreateSalaryComponentDto) {
  return this.addSalaryComponent(dto); // reuse existing logic
}

async getComponentsByStructure(structureId: number) {
  return this.prisma.salaryComponent.findMany({
    where: { structureId },
  });
}

async updateSalaryComponent(
  id: number,
  dto: UpdateSalaryComponentDto,
) {
  return this.prisma.salaryComponent.update({
    where: { id },
    data: dto,
  });
}

async deleteSalaryComponent(id: number) {
  return this.prisma.salaryComponent.delete({
    where: { id },
  });
}

// ===========================
// PAYROLL QUERIES
// ===========================

async getAllPayrolls() {
  return this.prisma.payroll.findMany({
    include: { payslips: true },
  });
}

async getPayrollById(payrollId: number) {
  return this.prisma.payroll.findUnique({
    where: { id: payrollId },
    include: { payslips: true },
  });
}

// ===========================
// PAYSLIPS
// ===========================

async getPayslipByPayroll(payrollId: number) {
  return this.prisma.payslip.findFirst({
    where: { payrollId },
  });
}
}
