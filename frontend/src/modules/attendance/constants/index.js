// src/modules/attendance/constants/index.js
// Attendance status options
export const ATTENDANCE_STATUS = [
 { value: "PRESENT", label: "Present", color: "#10b981", icon: "✓" },
  { value: "ABSENT", label: "Absent", color: "#ef4444", icon: "✗" },
  { value: "LATE", label: "Late", color: "#f59e0b", icon: "⏰" },
];

// Report types
export const REPORT_TYPES = [
  { value: "daily", label: "Daily Report" },
  { value: "weekly", label: "Weekly Report" },
  { value: "monthly", label: "Monthly Report" },
  { value: "term", label: "Term Report" },
  { value: "annual", label: "Annual Report" },
  { value: "custom", label: "Custom Period" },
];

// Bulk upload template headers
export const BULK_UPLOAD_HEADERS = [
  "studentId", "studentName", "date", "status", "checkInTime", "checkOutTime", "remarks"
];

// Export formats
export const EXPORT_FORMATS = [
  { value: "csv", label: "CSV", icon: "📊" },
  { value: "pdf", label: "PDF", icon: "📄" },
  { value: "excel", label: "Excel", icon: "📈" },
];

// ADD TIME_CONSTANTS HERE
export const TIME_CONSTANTS = {
  CHECK_IN_START: '08:00',
  CHECK_IN_END: '09:00',
  CHECK_OUT_START: '15:00',
  CHECK_OUT_END: '16:00',
  LATE_THRESHOLD: '08:30',
};

// Status colors using your brand colors
export const STATUS_COLORS = {
  present: { 
    bg: "#dcfce7", 
    text: "#166534", 
    border: "#86efac",
    primary: "#1b633b" // Your primary brand color
  },
  absent: { 
    bg: "#fee2e2", 
    text: "#991b1b", 
    border: "#fca5a5" 
  },
  late: { 
    bg: "#fef3c7", 
    text: "#92400e", 
    border: "#fde68a" 
  },
 
};

// ADD THESE ADDITIONAL CONSTANTS IF NEEDED
export const ATTENDANCE_TYPE = {
  STUDENT: 'student',
  STAFF: 'staff',
};

export const VALIDATION_RULES = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['text/csv', 'application/vnd.ms-excel'],
  MAX_RECORDS_PER_UPLOAD: 1000,
  MAX_MESSAGE_LENGTH: 1000,
  MAX_ATTACHMENT_SIZE: 10 * 1024 * 1024, // 10MB
};
// In src/modules/attendance/constants/index.js, add:

// Staff Attendance Status
export const STAFF_ATTENDANCE_STATUS = [
  { value: "PRESENT", label: "Present", color: "#10b981", icon: "✓" },
  { value: "ABSENT", label: "Absent", color: "#ef4444", icon: "✗" },
  { value: "LATE", label: "Late", color: "#f59e0b", icon: "⏰" },
  { value: "HALF_DAY", label: "Half Day", color: "#3b82f6", icon: "½" },
  { value: "LEAVE", label: "On Leave", color: "#8b5cf6", icon: "📋" },
  { value: "HOLIDAY", label: "Holiday", color: "#6b7280", icon: "🎉" },
  { value: "WEEK_OFF", label: "Week Off", color: "#94a3b8", icon: "📅" },
];

// Staff Leave Status
export const LEAVE_STATUS = [
  { value: "PENDING", label: "Pending", color: "#f59e0b", icon: "⏳" },
  { value: "APPROVED", label: "Approved", color: "#10b981", icon: "✓" },
  { value: "REJECTED", label: "Rejected", color: "#ef4444", icon: "✗" },
  { value: "CANCELLED", label: "Cancelled", color: "#6b7280", icon: "🚫" },
];

// Leave Types
export const LEAVE_TYPES = [
  { value: "CASUAL", label: "Casual Leave", color: "#3b82f6", maxDays: 12 },
  { value: "SICK", label: "Sick Leave", color: "#ef4444", maxDays: 15 },
  { value: "EARNED", label: "Earned Leave", color: "#10b981", maxDays: 30 },
  { value: "MATERNITY", label: "Maternity Leave", color: "#ec4899", maxDays: 180 },
  { value: "PATERNITY", label: "Paternity Leave", color: "#8b5cf6", maxDays: 7 },
  { value: "STUDY", label: "Study Leave", color: "#6366f1", maxDays: 30 },
  { value: "EMERGENCY", label: "Emergency Leave", color: "#f97316", maxDays: 5 },
];

// Department list for staff
export const DEPARTMENTS = [
  "Administration",
  "Academics", 
  "Finance",
  "Human Resources",
  "IT",
  "Maintenance",
  "Security",
  "Transport",
  "Library",
  "Sports",
  "Medical",
  "Kitchen",
  "Housekeeping"
];

// Add to existing STATUS_COLORS:
// export const STATUS_COLORS = {
//   // ... existing colors ...
//   leave: { 
//     bg: "#f3e8ff", 
//     text: "#6b21a8", 
//     border: "#d8b4fe" 
//   },
//   week_off: { 
//     bg: "#f1f5f9", 
//     text: "#475569", 
//     border: "#cbd5e1" 
//   },
// };