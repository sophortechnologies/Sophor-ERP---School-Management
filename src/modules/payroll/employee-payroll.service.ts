import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmployeePayrollService {
  constructor(private readonly prisma: PrismaService) {}

  async generatePayroll(month: number, year: number, processedBy: number) {
    // Get all active employees
    const employees = await this.prisma.employee.findMany({
      where: { status: 'ACTIVE' },
      include: {
        user: true,
        salaryStructure: {
          include: { components: true },
        },
      },
    });

    if (employees.length === 0) {
      throw new BadRequestException('No active employees found');
    }

    // Check if payroll already exists for this month
    const existingRun = await this.prisma.payrollRun.findFirst({
      where: { month, year, status: { not: 'CANCELLED' } },
    });

    if (existingRun) {
      throw new BadRequestException(`Payroll for ${month}/${year} already exists`);
    }

    // Create payroll run
    const payrollRun = await this.prisma.payrollRun.create({
      data: {
        runNumber: `PR-${year}${month.toString().padStart(2, '0')}-${Date.now()}`,
        month,
        year,
        status: 'DRAFT',
        processedBy,
      },
    });

    const records = [];

    for (const employee of employees) {
      // Get attendance for the month
      const attendance = await this.getAttendanceSummary(employee.id, month, year);
      
      // Get unpaid leave days
      const unpaidLeaveDays = await this.getUnpaidLeaveDays(employee.id, month, year);
      
      // Calculate salary
      const salary = await this.calculateSalary(employee, attendance.presentDays, attendance.halfDays, unpaidLeaveDays);
      
      // Create payroll record
      const record = await this.prisma.payrollRecord.create({
        data: {
          payrollRunId: payrollRun.id,
          employeeId: employee.id,
          presentDays: attendance.presentDays,
          absentDays: attendance.absentDays,
          lateDays: attendance.lateDays,
          overtimeHours: attendance.overtimeHours,
          basicSalary: salary.basic,
          allowances: salary.allowances,
          deductions: salary.deductions,
          netPay: salary.net,
          employeePension: salary.employeePension,
          employerPension: salary.employerPension,
          incomeTax: salary.incomeTax,
        },
      });
      
      records.push(record);
    }

    // Update totals
    const totalNetPay = records.reduce((sum, r) => sum + r.netPay.toNumber(), 0);
    
    await this.prisma.payrollRun.update({
      where: { id: payrollRun.id },
      data: { totalNetPay },
    });

    return { payrollRun, records: records.length };
  }

  private async getAttendanceSummary(employeeId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await this.prisma.employeeAttendance.findMany({
      where: {
        employeeId,
        date: { gte: startDate, lte: endDate },
      },
    });

    return {
      presentDays: attendance.filter(a => a.status === 'PRESENT').length,
      absentDays: attendance.filter(a => a.status === 'ABSENT').length,
      lateDays: attendance.filter(a => a.status === 'LATE').length,
      halfDays: attendance.filter(a => a.status === 'HALF_DAY').length,
      overtimeHours: attendance.reduce((sum, a) => sum + (a.overtimeHours?.toNumber() || 0), 0),
    };
  }

  private async getUnpaidLeaveDays(employeeId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const leaves = await this.prisma.employeeLeave.findMany({
      where: {
        employeeId,
        status: 'APPROVED',
        leaveType: 'UNPAID',
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    let totalDays = 0;
    for (const leave of leaves) {
      const leaveStart = new Date(Math.max(leave.startDate.getTime(), startDate.getTime()));
      const leaveEnd = new Date(Math.min(leave.endDate.getTime(), endDate.getTime()));
      const days = Math.ceil((leaveEnd.getTime() - leaveStart.getTime()) / (1000 * 3600 * 24)) + 1;
      totalDays += days;
    }

    return totalDays;
  }

  private async calculateSalary(employee: any, presentDays: number, halfDays: number, unpaidLeaveDays: number) {
    const structure = employee.salaryStructure;
    if (!structure) {
      throw new Error(`No salary structure for employee ${employee.id}`);
    }

    const workingDays = 22; // Standard working days per month
    const dailyRate = structure.basePay.toNumber() / workingDays;
    
    // Calculate effective days
    const effectiveDays = presentDays + (halfDays * 0.5);
    const absentDays = workingDays - effectiveDays;
    const totalAbsentDays = absentDays + unpaidLeaveDays;
    
    // Basic salary (pro-rated)
    const basicSalary = structure.basePay.toNumber() - (totalAbsentDays * dailyRate);
    
    // Calculate components
    let allowances = 0;
    let deductions = 0;
    
    for (const component of structure.components) {
      let amount = 0;
      
      if (component.calculationType === 'FIXED') {
        amount = component.value.toNumber();
      } else if (component.calculationType === 'PERCENTAGE_OF_BASIC') {
        amount = basicSalary * (component.value.toNumber() / 100);
      }
      
      if (component.type === 'EARNING') {
        allowances += amount;
      } else if (component.type === 'DEDUCTION') {
        deductions += amount;
      }
    }
    
    // Gross salary
    const grossSalary = basicSalary + allowances;
    
    // Ethiopian Pension (7% employee, 11% employer)
    const employeePension = grossSalary * 0.07;
    const employerPension = grossSalary * 0.11;
    
    // Ethiopian Income Tax (simplified - add proper slabs)
    let incomeTax = 0;
    if (grossSalary > 600) {
      incomeTax = (grossSalary - 600) * 0.1; // Simplified
    }
    
    // Total deductions
    const totalDeductions = deductions + employeePension + incomeTax;
    
    // Net salary
    const netSalary = grossSalary - totalDeductions;
    
    return {
      basic: basicSalary,
      allowances,
      deductions: totalDeductions,
      net: netSalary,
      employeePension,
      employerPension,
      incomeTax,
    };
  }

  async approvePayroll(runId: number, approvedBy: number) {
    const payrollRun = await this.prisma.payrollRun.findUnique({
      where: { id: runId },
    });

    if (!payrollRun) {
      throw new NotFoundException('Payroll run not found');
    }

    if (payrollRun.status !== 'DRAFT') {
      throw new BadRequestException(`Cannot approve payroll in status: ${payrollRun.status}`);
    }

    return this.prisma.payrollRun.update({
      where: { id: runId },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    });
  }

  async getPayrollRecords(runId: number) {
    return this.prisma.payrollRecord.findMany({
      where: { payrollRunId: runId },
      include: {
        employee: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });
  }
}