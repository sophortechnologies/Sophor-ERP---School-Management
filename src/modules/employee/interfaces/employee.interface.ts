export interface EmployeeWithRelations {
  id: number;
  employeeCode: string;
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  employeeType: string;
  designation: string;
  status: string;
  department: { id: number; name: string } | null;
  user: { email: string; phone: string } | null;
  teacher: { id: number } | null;
  staff: { id: number } | null;
}

export interface EmployeeDashboardStats {
  totalEmployees: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  activeCount: number;
  onLeaveCount: number;
  terminatedCount: number;
}