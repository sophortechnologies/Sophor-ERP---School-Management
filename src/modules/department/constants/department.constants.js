// modules/department/constants/department.constants.js

// Department statuses
export const DEPARTMENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

// Validation constants
export const VALIDATION = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_CODE_LENGTH: 2,
  MAX_CODE_LENGTH: 10,
  CODE_REGEX: /^[A-Z0-9\-]+$/, // Uppercase letters, numbers, and hyphens
  NAME_REGEX: /^[a-zA-Z\s\-]+$/ // Letters, spaces, and hyphens
};

// Default values
export const DEFAULT_VALUES = {
  status: 'active'
};

// Department statistics labels
export const STATISTICS_LABELS = {
  TOTAL_TEACHERS: 'Total Teachers',
  TOTAL_STUDENTS: 'Total Students',
  TOTAL_SUBJECTS: 'Total Subjects',
  ACTIVE_CLASSES: 'Active Classes',
  TOTAL_DEPARTMENTS: 'Total Departments'
};

// Department export headers
export const EXPORT_HEADERS = [
  'Code',
  'Name',
  'Head ID',
  'Status',
  'Description',
  'Created Date'
];