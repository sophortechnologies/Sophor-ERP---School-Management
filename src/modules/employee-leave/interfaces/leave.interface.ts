export interface LeaveBalance {
  year: number;
  balances: Record<string, {
    entitled: number;
    taken: number;
    remaining: number;
  }>;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: string;
  appliedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}