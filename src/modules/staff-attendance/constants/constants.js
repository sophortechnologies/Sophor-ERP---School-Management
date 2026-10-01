// src/modules/staff-attendance/constants/constants.js
// Staff Attendance Constants

// Staff Attendance Statuses
export const STAFF_ATTENDANCE_STATUS = [
  { value: 'PRESENT', label: 'Present', color: '#10b981', icon: '✓' },
  { value: 'ABSENT', label: 'Absent', color: '#ef4444', icon: '✗' },
  { value: 'LATE', label: 'Late', color: '#f59e0b', icon: '⏰' },
  { value: 'HALF_DAY', label: 'Half Day', color: '#3b82f6', icon: '½' },
  { value: 'LEAVE', label: 'On Leave', color: '#8b5cf6', icon: '📝' },
  { value: 'HOLIDAY', label: 'Holiday', color: '#6b7280', icon: '🎉' },
  { value: 'REMOTE', label: 'Remote Work', color: '#06b6d4', icon: '🏠' },
];

// Status Colors
export const STATUS_COLORS = {
  present: { text: '#10b981', bg: '#dcfce7', border: '#10b981' },
  absent: { text: '#ef4444', bg: '#fee2e2', border: '#ef4444' },
  late: { text: '#f59e0b', bg: '#fef3c7', border: '#f59e0b' },
  half_day: { text: '#3b82f6', bg: '#dbeafe', border: '#3b82f6' },
  leave: { text: '#8b5cf6', bg: '#f3e8ff', border: '#8b5cf6' },
  holiday: { text: '#6b7280', bg: '#f3f4f6', border: '#6b7280' },
  remote: { text: '#06b6d4', bg: '#cffafe', border: '#06b6d4' },
};

// Update LEAVE_TYPES in your constants file
export const LEAVE_TYPES = [
  { value: 'ANNUAL', label: 'Annual Leave', maxDays: 30, color: '#10b981' },
  { value: 'SICK', label: 'Sick Leave', maxDays: 15, color: '#ef4444' },
  { value: 'CASUAL', label: 'Casual Leave', maxDays: 12, color: '#3b82f6' },
  { value: 'MATERNITY', label: 'Maternity Leave', maxDays: 180, color: '#ec4899' },
  { value: 'PATERNITY', label: 'Paternity Leave', maxDays: 15, color: '#06b6d4' },
  { value: 'BEREAVEMENT', label: 'Bereavement Leave', maxDays: 7, color: '#6b7280' },
  { value: 'UNPAID', label: 'Unpaid Leave', maxDays: 0, color: '#6b7280' },
  { value: 'COMPENSATORY', label: 'Compensatory Leave', maxDays: 5, color: '#f59e0b' },
  { value: 'HALF_DAY', label: 'Half Day Leave', maxDays: 0.5, color: '#8b5cf6' },
  { value: 'WORK_FROM_HOME', label: 'Work From Home', maxDays: 1, color: '#06b6d4' },
  { value: 'OTHER', label: 'Other Leave', maxDays: 30, color: '#9ca3af' },
];
// Leave Status
export const LEAVE_STATUS = [
  { value: 'PENDING', label: 'Pending', color: '#f59e0b' },
  { value: 'APPROVED', label: 'Approved', color: '#10b981' },
  { value: 'REJECTED', label: 'Rejected', color: '#ef4444' },
  { value: 'CANCELLED', label: 'Cancelled', color: '#6b7280' },
];

// Departments (matching your ERP modules)
export const DEPARTMENTS = [
  { value: 'TEACHING', label: 'Teaching', color: '#3b82f6' },
  { value: 'ADMINISTRATION', label: 'Administration', color: '#10b981' },
  { value: 'HR', label: 'Human Resources', color: '#8b5cf6' },
  { value: 'FINANCE', label: 'Finance & Accounting', color: '#ef4444' },
  { value: 'ADMISSIONS', label: 'Admissions', color: '#06b6d4' },
  { value: 'ACADEMICS', label: 'Academics', color: '#f59e0b' },
  { value: 'LIBRARY', label: 'Library', color: '#ec4899' },
  { value: 'IT', label: 'IT Support', color: '#6b7280' },
  { value: 'MAINTENANCE', label: 'Maintenance', color: '#92400e' },
  { value: 'SECURITY', label: 'Security', color: '#374151' },
];

// Report Types
export const REPORT_TYPES = [
  { value: 'daily', label: 'Daily Report' },
  { value: 'weekly', label: 'Weekly Report' },
  { value: 'monthly', label: 'Monthly Report' },
  { value: 'quarterly', label: 'Quarterly Report' },
  { value: 'yearly', label: 'Yearly Report' },
  { value: 'custom', label: 'Custom Period' },
];

// Time Constants
export const TIME_CONSTANTS = {
  DEFAULT_CHECK_IN: '09:00',
  DEFAULT_CHECK_OUT: '17:00',
  LATE_THRESHOLD: '09:30',
  EARLY_THRESHOLD: '08:30',
  WORKING_HOURS: 8,
  MIN_WORKING_HOURS: 4,
  MAX_WORKING_HOURS: 12,
};

// Attendance Rules
export const ATTENDANCE_RULES = {
  LATE_DEDUCTION: 0.5, // 0.5 hours deduction for being late
  HALF_DAY_HOURS: 4,   // Half day if worked less than 4 hours
  MAX_LEAVE_DAYS: 30,  // Maximum consecutive leave days
  NOTICE_PERIOD: 1,    // Days notice required for leave
};

// File Upload Constants
export const UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  MAX_FILES: 5,
};

// Notification Types
export const NOTIFICATION_TYPES = {
  ATTENDANCE_MARKED: 'ATTENDANCE_MARKED',
  LEAVE_APPLIED: 'LEAVE_APPLIED',
  LEAVE_APPROVED: 'LEAVE_APPROVED',
  LEAVE_REJECTED: 'LEAVE_REJECTED',
  ATTENDANCE_REMINDER: 'ATTENDANCE_REMINDER',
  PAYROLL_REMINDER: 'PAYROLL_REMINDER',
};

// Default Values
export const DEFAULT_VALUES = {
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  PERCENTAGE_FORMAT: '0.00%',
  CURRENCY_FORMAT: '₹0,0.00',
};

// API Response Messages
export const API_MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  ERROR: 'An error occurred',
  VALIDATION_ERROR: 'Please check your input',
  NOT_FOUND: 'Record not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
};

// User Roles for Attendance Module
export const ATTENDANCE_ROLES = {
  ADMIN: ['admin', 'Admin'],
  HR: ['hr', 'HR'],
  TEACHER: ['teacher', 'Teacher'],
  STAFF: ['staff', 'Staff'],
  VIEWER: ['viewer', 'Viewer'],
};

// Export everything
export default {
  STAFF_ATTENDANCE_STATUS,
  STATUS_COLORS,
  LEAVE_TYPES,
  LEAVE_STATUS,
  DEPARTMENTS,
  REPORT_TYPES,
  TIME_CONSTANTS,
  ATTENDANCE_RULES,
  UPLOAD_CONSTANTS,
  NOTIFICATION_TYPES,
  DEFAULT_VALUES,
  API_MESSAGES,
  ATTENDANCE_ROLES,
};