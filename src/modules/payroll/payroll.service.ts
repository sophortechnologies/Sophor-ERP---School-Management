import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { CreateSalaryComponentDto } from './dto/create-salary-component.dto';
import { GeneratePayrollDto } from './dto/generate-payroll.dto';
import { UpdateSalaryComponentDto } from './dto/update-salary-component.dto';
import { BudgetService } from '../budget/budget.service';

@Injectable()
export class PayrollService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly budgetService: BudgetService,
  ) {}

  // ===========================
  // Salary Structure
  // ===========================
private async getTotalSalary(payrollRunId: number): Promise<number> {
  const records = await this.prisma.payrollRecord.findMany({
    where: { payrollRunId },
  });
  return records.reduce((sum, r) => sum + r.netPay.toNumber(), 0);
}
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
    data: {
      name: dto.name,
      type: dto.type,
      calculationType: dto.calculationType || 'FIXED',
      value: dto.value || dto.amount || 0,
      dependsOn: dto.dependsOn,
      isTaxable: dto.isTaxable || false,
      isStatutory: dto.isStatutory || false,
      structureId: dto.structureId,
      order: dto.order || 0,
    },
  });
}
  // ===========================
  // Payroll Generation (CORE)
  // ===========================

  // src/modules/payroll/payroll.service.ts

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
  
  const [year, month] = dto.salaryMonth.split('-').map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  for (const staff of staffList) {
    const structure = staff.user.salaryStructures[0];
    if (!structure) continue;

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
    const presentDays = await this.getPresentDays(staff.userId, dto.salaryMonth);

    const unpaidLeaves = await this.prisma.staffLeave.findMany({
      where: {
        userId: staff.userId,
        status: 'APPROVED',
        leaveType: 'UNPAID',
        startDate: { lte: monthEnd },
        endDate: { gte: monthStart },
      },
    });

    let unpaidLeaveDays = 0;
    for (const leave of unpaidLeaves) {
      const leaveStart = new Date(Math.max(leave.startDate.getTime(), monthStart.getTime()));
      const leaveEnd = new Date(Math.min(leave.endDate.getTime(), monthEnd.getTime()));
      const days = Math.ceil((leaveEnd.getTime() - leaveStart.getTime()) / (1000 * 3600 * 24)) + 1;
      unpaidLeaveDays += days;
    }

    const dailyRate = basePay / workingDays;
    const absentDays = workingDays - presentDays;
    const absentDeduction = absentDays * dailyRate;
    const leaveDeduction = unpaidLeaveDays * dailyRate;
    const totalDeductions = absentDeduction + leaveDeduction;

    const components = await this.prisma.salaryComponent.findMany({
      where: { structureId: structure.id },
    });

    let allowances = 0;
    let deductions = totalDeductions;

    for (const comp of components) {
      const amount = comp.value.toNumber();
      if (comp.type === 'ALLOWANCE') allowances += amount;
      if (comp.type === 'DEDUCTION') deductions += amount;
    }

    const netSalary = basePay + allowances - deductions;

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

  for (const payroll of results) {
    await this.recordPayrollToBudgetFromPayroll(payroll.id, userId);
  }

  return results;
}
  

  async getStaffPayrolls(staffId: number) {
    return this.prisma.payroll.findMany({
      where: { staffId },
      orderBy: { createdAt: 'desc' },
    });
  }

 async getStaffPayslips(staffId: number) {
  // First find all payrolls for this staff
  const payrolls = await this.prisma.payroll.findMany({
    where: { staffId: staffId },
    select: { id: true },
  });

  const payrollIds = payrolls.map(p => p.id);

  if (payrollIds.length === 0) {
    return [];
  }

  // Then find payslips for those payrolls
  return this.prisma.payslip.findMany({
    where: {
      payrollId: { in: payrollIds },
    },
    include: {
      payroll: {
        include: {
          staff: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
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


  async generatePayslipPdf(payrollId: number) {
    // Fetch full payroll + staff + payslip data
    const payroll = await this.prisma.payroll.findUnique({
      where: { id: payrollId },
      include: {
        staff: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        payslips: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!payroll) {
      throw new NotFoundException('Payroll not found');
    }

    // Build file path
    const [year, month] = payroll.salaryMonth.split('-');
    const staffCode = payroll.staffId;
    const fileName = `payslip_staff_${staffCode}_${month}_${year}.pdf`;
    const filePath = path.join(process.cwd(), 'uploads', 'payslips', fileName);

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Build PDF with pdfkit
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const name = `${payroll.staff.user.firstName} ${payroll.staff.user.lastName}`;
    const basicSalary  = payroll.basicSalary.toNumber();
    const allowances   = payroll.allowances.toNumber();
    const deductions   = payroll.deductions.toNumber();
    const netSalary    = payroll.netSalary.toNumber();
    const grossSalary  = basicSalary + allowances;

    // Header
    doc.fontSize(20).text('SCHOOL ERP', { align: 'center' });
    doc.fontSize(10).text('Official Payslip', { align: 'center' });
    doc.moveDown();

    doc.fontSize(16).text('PAYSLIP', { align: 'center' });
    doc.moveDown();

    // Employee details
    doc.fontSize(10);
    doc.text(`Employee Name  : ${name}`);
    doc.text(`Staff ID       : ${payroll.staffId}`);
    doc.text(`Salary Month   : ${payroll.salaryMonth}`);
    doc.text(`Payment Date   : ${payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString() : 'Pending'}`);
    doc.text(`Status         : ${payroll.status}`);
    doc.moveDown();

    // Earnings
    doc.text('EARNINGS', { underline: true });
    doc.moveDown(0.5);
    doc.text(`Basic Salary    : ${basicSalary.toFixed(2)} ETB`);
    doc.text(`Allowances      : ${allowances.toFixed(2)} ETB`);
    doc.moveDown();
    doc.text(`Gross Salary    : ${grossSalary.toFixed(2)} ETB`, { underline: true });
    doc.moveDown();

    // Deductions
    doc.text('DEDUCTIONS', { underline: true });
    doc.moveDown(0.5);
    doc.text(`Total Deductions: ${deductions.toFixed(2)} ETB`);
    doc.moveDown();

    // Net pay
    doc.fontSize(14);
    doc.text(`NET PAY: ${netSalary.toFixed(2)} ETB`, { align: 'center', underline: true });
    doc.moveDown();

    // Footer
    doc.fontSize(8);
    doc.text('This is a computer-generated document. No signature required.', { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });

    doc.end();

    // Wait for write to finish then return the file path
    await new Promise<void>((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    return {
      message: 'Payslip PDF generated successfully',
      filePath,
      fileUrl: `/uploads/payslips/${fileName}`,
    };
  }

 

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

// REPLACE IT WITH THIS:
private async getPresentDays(userId: number, salaryMonth: string): Promise<number> {
  const [year, month] = salaryMonth.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  // Count PRESENT days from staff attendance
  const presentCount = await this.prisma.staffAttendance.count({
    where: {
      userId: userId,
      status: 'PRESENT',
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Count HALF_DAY as 0.5 day
  const halfDayCount = await this.prisma.staffAttendance.count({
    where: {
      userId: userId,
      status: 'HALF_DAY',
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Calculate total working days in month (excluding weekends)
  const workingDays = await this.calculateWorkingDays(startDate, endDate);

  // Effective present days (half day counts as 0.5)
  const effectivePresentDays = presentCount + (halfDayCount * 0.5);

  return Math.min(effectivePresentDays, workingDays);
}

// ALSO ADD THIS HELPER METHOD (put it right after getPresentDays)
private async calculateWorkingDays(startDate: Date, endDate: Date): Promise<number> {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const day = current.getDay();
    // Exclude Saturdays (6) and Sundays (0)
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
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



async getPayslipByPayroll(payrollId: number) {
  return this.prisma.payslip.findFirst({
    where: { payrollId },
  });
}

private async recordPayrollToBudget(payrollRunId: number, totalSalary: number, month: number, year: number) {
  // Find SALARIES budget for current fiscal year
  const currentYear = new Date().getFullYear();
  const salaryBudget = await this.prisma.budget.findFirst({
    where: {
      fiscalYear: `${currentYear}-${currentYear + 1}`,
      category: 'SALARIES',
      status: 'APPROVED',
    },
  });

  if (!salaryBudget) {
    return;
  }

  // Record actual expense to budget
  await this.prisma.budgetActual.create({
    data: {
      budgetId: salaryBudget.id,
      actualNumber: `PAY-${payrollRunId}`,
      referenceType: 'PAYROLL',
      referenceId: payrollRunId,
      amount: totalSalary,
      description: `Monthly salary for ${month}/${year}`,
      recordedBy: 1, // or pass userId
    },
  });

  // Update budget actualAmount and availableAmount
  await this.prisma.budget.update({
    where: { id: salaryBudget.id },
    data: {
      actualAmount: { increment: totalSalary },
      availableAmount: { decrement: totalSalary },
    },
  });
}

async recordPayrollToBudgetFromPayroll(payrollId: number, userId: number) {
  const payroll = await this.prisma.payroll.findUnique({
    where: { id: payrollId },
  });

  if (!payroll) {
    throw new NotFoundException('Payroll not found');
  }

  const totalSalary = payroll.netSalary.toNumber();
  const [year, month] = payroll.salaryMonth.split('-').map(Number);

  const salaryBudget = await this.prisma.budget.findFirst({
    where: {
      fiscalYear: '2025-2026',
      category: 'SALARIES',
      status: 'APPROVED',
    },
  });

  if (salaryBudget) {
    await this.budgetService.recordActual(
      salaryBudget.id,
      totalSalary,
      'PAYROLL',
      payroll.id,
      `Monthly salary for ${month}/${year}`,
      userId,
    );
  }

  return { message: 'Payroll recorded to budget', totalSalary };
}
}
