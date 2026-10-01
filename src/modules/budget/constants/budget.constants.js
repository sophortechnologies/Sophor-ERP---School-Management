export const BUDGET_CATEGORIES = [
  {
    value: "SALARIES",
    label: "Salaries & Wages",
    icon: "💰",
    color: "#10b981",
  },
  { value: "OPERATIONAL", label: "Operational", icon: "📋", color: "#3b82f6" },
  { value: "CAPITAL", label: "Capital", icon: "🏗️", color: "#8b5cf6" },
  { value: "REVENUE", label: "Revenue", icon: "📈", color: "#f59e0b" },
  { value: "RESEARCH", label: "Research", icon: "🔬", color: "#ec4899" },
  { value: "DEVELOPMENT", label: "Development", icon: "💻", color: "#06b6d4" },
  { value: "MAINTENANCE", label: "Maintenance", icon: "🔧", color: "#ef4444" },
  { value: "UTILITIES", label: "Utilities", icon: "💡", color: "#f97316" },
  { value: "TRAINING", label: "Training", icon: "📚", color: "#14b8a6" },
  { value: "TECHNOLOGY", label: "Technology", icon: "🖥️", color: "#6366f1" },
  {
    value: "STUDENT_WELFARE",
    label: "Student Welfare",
    icon: "🎓",
    color: "#f43f5e",
  },
  { value: "SPORTS", label: "Sports", icon: "⚽", color: "#22c55e" },
  { value: "LIBRARY", label: "Library", icon: "📖", color: "#a855f7" },
  {
    value: "ADMINISTRATION",
    label: "Administration",
    icon: "🏛️",
    color: "#64748b",
  },
];

export const BUDGET_TYPES = [
  { value: "ANNUAL", label: "Annual" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "PROJECT_BASED", label: "Project Based" },
];

export const BUDGET_STATUSES = [
  { value: "DRAFT", label: "Draft", color: "#6b7280" },
  { value: "SUBMITTED", label: "Submitted", color: "#f59e0b" },
  { value: "UNDER_REVIEW", label: "Under Review", color: "#3b82f6" },
  { value: "APPROVED", label: "Approved", color: "#10b981" },
  { value: "REJECTED", label: "Rejected", color: "#ef4444" },
  { value: "FROZEN", label: "Frozen", color: "#8b5cf6" },
];

export const TRANSFER_STATUSES = [
  { value: "PENDING", label: "Pending", color: "#f59e0b" },
  { value: "APPROVED", label: "Approved", color: "#3b82f6" },
  { value: "REJECTED", label: "Rejected", color: "#ef4444" },
  { value: "EXECUTED", label: "Executed", color: "#10b981" },
];

export const FISCAL_YEARS = [
  "2022-2023",
  "2023-2024",
  "2024-2025",
  "2025-2026",
  "2026-2027",
];

export const DEFAULT_BUDGET_FORM = {
  budgetCode: "",
  fiscalYear: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
  departmentId: "",
  costCenter: "",
  category: "OPERATIONAL",
  subCategory: "",
  budgetType: "ANNUAL",
  allocatedAmount: "",
  softStopPercent: 80,
  hardStopPercent: 100,
  alertEmail: "",
  allowRollover: false,
  rolloverToNextYear: false,
  notes: "",
};

export const BUDGET_TABLE_COLUMNS = [
  { key: "budgetCode", label: "Budget Code", sortable: true },
  { key: "category", label: "Category", sortable: true },
  { key: "department", label: "Department", sortable: true },
  { key: "allocatedAmount", label: "Allocated", sortable: true },
  { key: "actualAmount", label: "Actual", sortable: true },
  { key: "availableAmount", label: "Available", sortable: true },
  { key: "utilization", label: "Utilization", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "actions", label: "Actions", sortable: false },
];

export default {
  BUDGET_CATEGORIES,
  BUDGET_TYPES,
  BUDGET_STATUSES,
  TRANSFER_STATUSES,
  FISCAL_YEARS,
  DEFAULT_BUDGET_FORM,
  BUDGET_TABLE_COLUMNS,
};
