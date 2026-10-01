// Attendance Status Constants
export const ATTENDANCE_STATUS = [
  { value: 'PRESENT', label: 'Present', color: '#10b981', bg: '#dcfce7', icon: '✓' },
  { value: 'ABSENT', label: 'Absent', color: '#ef4444', bg: '#fee2e2', icon: '✗' },
  { value: 'LATE', label: 'Late', color: '#f59e0b', bg: '#fef3c7', icon: '⏰' },
  { value: 'HALF_DAY', label: 'Half Day', color: '#3b82f6', bg: '#dbeafe', icon: '½' },
];

// Status Colors Map
export const STATUS_COLORS = {
  present: { text: '#10b981', bg: '#dcfce7', border: '#10b981' },
  absent: { text: '#ef4444', bg: '#fee2e2', border: '#ef4444' },
  late: { text: '#f59e0b', bg: '#fef3c7', border: '#f59e0b' },
  // leave: { text: '#8b5cf6', bg: '#f3e8ff', border: '#8b5cf6' },
  half_day: { text: '#3b82f6', bg: '#dbeafe', border: '#3b82f6' },
  // holiday: { text: '#6b7280', bg: '#f3f4f6', border: '#6b7280' },
};

// Attendance Types
export const ATTENDANCE_TYPE = {
  STUDENT: 'student',
  STAFF: 'staff',
};

// Report Types
export const REPORT_TYPES = [
  { value: 'daily', label: 'Daily Report' },
  { value: 'weekly', label: 'Weekly Report' },
  { value: 'monthly', label: 'Monthly Report' },
  { value: 'term', label: 'Term Report' },
  { value: 'annual', label: 'Annual Report' },
  { value: 'custom', label: 'Custom Report' },
];

// Export Formats
export const EXPORT_FORMATS = [
  { value: 'pdf', label: 'PDF', icon: '📄' },
  { value: 'excel', label: 'Excel', icon: '📊' },
  { value: 'csv', label: 'CSV', icon: '📋' },
];

// Bulk Upload Headers
export const BULK_UPLOAD_HEADERS = [
  'studentId',
  'studentName',
  'date',
  'status',
  'checkInTime',
  'checkOutTime',
  'remarks',
  'classId'
];

// Validation Rules
export const VALIDATION_RULES = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['text/csv', 'application/vnd.ms-excel'],
  MAX_RECORDS_PER_UPLOAD: 1000,
  MAX_MESSAGE_LENGTH: 1000,
  MAX_ATTACHMENT_SIZE: 10 * 1024 * 1024, // 10MB
};

// Notification Types
export const NOTIFICATION_TYPES = {
  ABSENTEE: 'absentee',
  LATE: 'late',
  LOW_ATTENDANCE: 'low_attendance',
  REMINDER: 'reminder',
};

// Time Constants
export const TIME_CONSTANTS = {
  CHECK_IN_START: '08:00',
  CHECK_IN_END: '09:00',
  CHECK_OUT_START: '15:00',
  CHECK_OUT_END: '16:00',
  LATE_THRESHOLD: '08:30',
};

export default {
  ATTENDANCE_STATUS,
  STATUS_COLORS,
  ATTENDANCE_TYPE,
  REPORT_TYPES,
  EXPORT_FORMATS,
  BULK_UPLOAD_HEADERS,
  VALIDATION_RULES,
  NOTIFICATION_TYPES,
  TIME_CONSTANTS,
};