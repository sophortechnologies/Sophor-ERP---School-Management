import { PrismaService } from '../../database/prisma.service';

export class LeaveBalanceHelper {
  static calculateLeaveDays(startDate: Date, endDate: Date, halfDay?: string): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (halfDay) {
      return 0.5;
    }
    
    return diffDays;
  }

  static async getLeaveBalance(prisma: PrismaService, employeeId: number, year?: number) {
    const targetYear = year || new Date().getFullYear();

    const approvedLeaves = await prisma.employeeLeave.findMany({
      where: {
        employeeId,
        status: 'APPROVED',
        startDate: { gte: new Date(targetYear, 0, 1) },
        endDate: { lte: new Date(targetYear, 11, 31) },
      },
    });

    const entitlements: Record<string, number> = {
      ANNUAL: 22,
      SICK: 12,
      CASUAL: 10,
      MATERNITY: 90,
      PATERNITY: 15,
      BEREAVEMENT: 5,
      UNPAID: 0,
    };

    const taken: Record<string, number> = {};

    for (const leave of approvedLeaves) {
      const days = this.calculateLeaveDays(leave.startDate, leave.endDate, (leave as any).halfDay);
      taken[leave.leaveType] = (taken[leave.leaveType] || 0) + days;
    }

    const balances: Record<string, { entitled: number; taken: number; remaining: number }> = {};

    for (const [type, entitled] of Object.entries(entitlements)) {
      const takenDays = taken[type] || 0;
      balances[type] = {
        entitled,
        taken: takenDays,
        remaining: entitled - takenDays,
      };
    }

    return { year: targetYear, balances };
  }
}