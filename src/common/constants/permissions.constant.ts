export const PERMISSIONS = { 
// Student permissions 
STUDENT_CREATE: 'student:create', 
STUDENT_READ: 'student:read', 
STUDENT_UPDATE: 'student:update', 
STUDENT_DELETE: 'student:delete', 
// Attendance permissions 
ATTENDANCE_MARK: 'attendance:mark', 
ATTENDANCE_VIEW: 'attendance:view', 
ATTENDANCE_EDIT: 'attendance:edit', 
// Exam permissions 
EXAM_CREATE: 'exam:create', 
EXAM_GRADE: 'exam:grade', 
EXAM_VIEW: 'exam:view', 
// Finance permissions 
FEE_MANAGE: 'fee:manage', 
PAYMENT_COLLECT: 'payment:collect', 
FINANCE_VIEW: 'finance:view', 
// HR permissions 
PAYROLL_MANAGE: 'payroll:manage', 
EMPLOYEE_MANAGE: 'employee:manage', 
// Library permissions 
LIBRARY_MANAGE: 'library:manage', 
BOOK_ISSUE: 'book:issue', 
// Reports 
REPORT_GENERATE: 'report:generate', 
REPORT_VIEW: 'report:view', 
} as const; 