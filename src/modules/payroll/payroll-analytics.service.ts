import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PayrollAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPayrollDashboard(year?: number, month?: number) {
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || new Date().getMonth() + 1;

    // Get all payroll records for the period
    const records = await this.prisma.payrollRecord.findMany({
      where: {
        payrollRun: {
          year: targetYear,
          month: targetMonth,
        },
      },
      include: {
        employee: {
          include: {
            user: true,
            department: true,
          },
        },
      },
    });

    const totalNetPay = records.reduce((sum, r) => sum + r.netPay.toNumber(), 0);
    const totalEmployees = records.length;
    const totalTax = records.reduce((sum, r) => sum + (r.incomeTax?.toNumber() || 0), 0);
    const totalPension = records.reduce((sum, r) => sum + (r.employeePension?.toNumber() || 0), 0);

    return {
      period: { year: targetYear, month: targetMonth },
      summary: {
        totalEmployees,
        totalNetPay,
        averageSalary: totalEmployees > 0 ? totalNetPay / totalEmployees : 0,
        totalTaxCollected: totalTax,
        totalPensionCollected: totalPension,
      },
      records: records.map(r => ({
        employeeName: `${r.employee.user.firstName} ${r.employee.user.lastName}`,
        netPay: r.netPay.toNumber(),
        department: r.employee.department?.name || 'N/A',
      })),
    };
  }
}