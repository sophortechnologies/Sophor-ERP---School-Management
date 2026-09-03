// src/modules/budget/interfaces/budget.interface.ts
export interface AvailabilityResult {
  available: boolean;
  availableAmount: number;
  requestedAmount: number;
  usedPercentage: number;
  requiresApproval: boolean;
  level: 'OK' | 'SOFT_STOP' | 'HARD_STOP';
  message?: string;
}

export interface BudgetUtilization {
  budgetId: number;
  budgetCode: string;
  allocatedAmount: number;
  committedAmount: number;
  actualAmount: number;
  availableAmount: number;
  utilizationPercentage: number;
  softStopThreshold: number;
  hardStopThreshold: number;
  status: 'SAFE' | 'WARNING' | 'CRITICAL' | 'EXCEEDED';
}

export interface VarianceReport {
  budgetId: number;
  budgetCode: string;
  allocatedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  type: 'FAVORABLE' | 'UNFAVORABLE';
  period: string;
}

export interface DepartmentBudgetSummary {
  departmentId: number;
  departmentName: string;
  totalAllocated: number;
  totalCommitted: number;
  totalActual: number;
  totalAvailable: number;
  utilizationPercentage: number;
  categories: BudgetUtilization[];
}

export interface BudgetDashboardStats {
  fiscalYear: string;
  totalBudget: number;
  totalCommitted: number;
  totalActual: number;
  totalAvailable: number;
  overallUtilization: number;
  departmentsAtRisk: number;
  activeAlerts: number;
}

export interface BudgetUtilization {
  budgetId: number;
  budgetCode: string;
  allocatedAmount: number;
  committedAmount: number;
  actualAmount: number;
  availableAmount: number;
  utilizationPercentage: number;
  softStopThreshold: number;
  hardStopThreshold: number;
  status: 'SAFE' | 'WARNING' | 'CRITICAL' | 'EXCEEDED';
}

export interface BudgetUtilization {
  budgetId: number;
  budgetCode: string;
  allocatedAmount: number;
  committedAmount: number;
  actualAmount: number;
  availableAmount: number;
  utilizationPercentage: number;
  softStopThreshold: number;
  hardStopThreshold: number;
  status: 'SAFE' | 'WARNING' | 'CRITICAL' | 'EXCEEDED';
}