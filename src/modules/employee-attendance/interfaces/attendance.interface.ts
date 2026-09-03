export interface AttendanceSummary {
  date: string;
  totalEmployees: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  onLeave: number;
  attendancePercentage: number;
}

export interface MonthlyAttendanceReport {
  year: number;
  month: number;
  totalWorkingDays: number;
  totalEmployees: number;
  summary: {
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    averagePercentage: number;
  };
  details: EmployeeAttendanceDetail[];
}

export interface EmployeeAttendanceDetail {
  employeeId: number;
  employeeCode: string;
  name: string;
  employeeType: string;
  department: string;
  attendance: {
    present: number;
    absent: number;
    late: number;
    halfDay: number;
    onLeave: number;
    totalWorkingDays: number;
    percentage: number;
  };
}