// src/constants/roles.js - COMPLETE FILE
export const USER_ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
  STAFF: 'staff',
  HR: 'hr',
  ACCOUNTANT: 'accountant',
  LIBRARIAN: 'librarian',
  EXAM_OFFICER: 'exam_officer',
  PRINCIPAL: 'principal',
  VICE_PRINCIPAL: 'vice_principal',
  CLASS_TEACHER: 'class_teacher',
  SUBJECT_TEACHER: 'subject_teacher',
  CLERK: 'clerk',
  DRIVER: 'driver',
  SECURITY: 'security',
  CLEANER: 'cleaner',
};

export const DASHBOARD_ROUTES = {
  [USER_ROLES.ADMIN]: '/admin/dashboard',
  [USER_ROLES.SUPER_ADMIN]: '/admin/dashboard',
  [USER_ROLES.TEACHER]: '/teacher/dashboard',
  [USER_ROLES.STUDENT]: '/student/dashboard',
  [USER_ROLES.PARENT]: '/parent/dashboard',
  [USER_ROLES.STAFF]: '/staff/dashboard',
  [USER_ROLES.HR]: '/hr/dashboard',
  [USER_ROLES.ACCOUNTANT]: '/admin/fee-accounting/collection', // CHANGED
  [USER_ROLES.LIBRARIAN]: '/library/dashboard',
  [USER_ROLES.EXAM_OFFICER]: '/exam/dashboard',
  [USER_ROLES.PRINCIPAL]: '/principal/dashboard',
  [USER_ROLES.VICE_PRINCIPAL]: '/vice-principal/dashboard',
  [USER_ROLES.CLASS_TEACHER]: '/teacher/dashboard',
  [USER_ROLES.SUBJECT_TEACHER]: '/teacher/dashboard',
  [USER_ROLES.CLERK]: '/staff/dashboard',
  [USER_ROLES.DRIVER]: '/staff/dashboard',
  [USER_ROLES.SECURITY]: '/staff/dashboard',
  [USER_ROLES.CLEANER]: '/staff/dashboard',
};

// Role-based module access permissions
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
    modules: ['all'],
    canManageUsers: true,
    canManageSystem: true,
    canViewReports: true,
    canManageSettings: true,
  },
  [USER_ROLES.ACCOUNTANT]: { // ADD NEW ROLE
    modules: ['fee_accounting', 'financial_reports', 'invoicing'],
    canManageUsers: false,
    canManageSystem: false,
    canViewReports: true,
    canManageSettings: false,
    allowedPages: [
      '/admin/fee-accounting/collection',
      '/admin/fee-accounting/configuration',
      '/admin/fee-accounting/history',
      '/admin/fee-accounting/reports'
    ]
  },
  [USER_ROLES.TEACHER]: {
    modules: ['attendance', 'grades', 'timetable', 'students', 'examination'],
    canManageUsers: false,
    canManageSystem: false,
    canViewReports: true,
    canManageSettings: false,
    allowedPages: [
      '/teacher/dashboard',
      '/attendance',
      '/grades',
      '/timetable',
      '/students/view',
      '/examination/enter-marks'
    ]
  },
  [USER_ROLES.STUDENT]: {
    modules: ['profile', 'grades', 'attendance', 'timetable', 'fee'],
    canManageUsers: false,
    canManageSystem: false,
    canViewReports: false,
    canManageSettings: false,
    allowedPages: [
      '/student/dashboard',
      '/student/profile',
      '/student/grades',
      '/student/attendance',
      '/student/timetable',
      '/student/fees'
    ]
  },
  [USER_ROLES.PARENT]: {
    modules: ['child_profile', 'child_grades', 'child_attendance', 'fee', 'communications'],
    canManageUsers: false,
    canManageSystem: false,
    canViewReports: false,
    canManageSettings: false,
    allowedPages: [
      '/parent/dashboard',
      '/parent/children',
      '/parent/attendance',
      '/parent/grades',
      '/parent/fees',
      '/parent/communications'
    ]
  },
  [USER_ROLES.STAFF]: {
    modules: ['profile', 'attendance', 'leave', 'salary'],
    canManageUsers: false,
    canManageSystem: false,
    canViewReports: false,
    canManageSettings: false,
    allowedPages: [
      '/staff/dashboard',
      '/staff/profile',
      '/staff/attendance',
      '/staff/leave',
      '/staff/salary'
    ]
  },
  [USER_ROLES.HR]: {
    modules: ['staff_management', 'payroll', 'leave_management', 'recruitment'],
    canManageUsers: true,
    canManageSystem: false,
    canViewReports: true,
    canManageSettings: false,
    allowedPages: [
      '/hr/dashboard',
      '/staff/manage',
      '/payroll',
      '/leave/manage',
      '/recruitment'
    ]
  },
};

// Get display name for role
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [USER_ROLES.ADMIN]: 'Administrator',
    [USER_ROLES.SUPER_ADMIN]: 'Super Admin',
    [USER_ROLES.TEACHER]: 'Teacher',
    [USER_ROLES.STUDENT]: 'Student',
    [USER_ROLES.PARENT]: 'Parent',
    [USER_ROLES.STAFF]: 'Staff Member',
    [USER_ROLES.HR]: 'HR Manager',
    [USER_ROLES.ACCOUNTANT]: 'Accountant',
    [USER_ROLES.LIBRARIAN]: 'Librarian',
    [USER_ROLES.EXAM_OFFICER]: 'Exam Officer',
    [USER_ROLES.PRINCIPAL]: 'Principal',
    [USER_ROLES.VICE_PRINCIPAL]: 'Vice Principal',
    [USER_ROLES.CLASS_TEACHER]: 'Class Teacher',
    [USER_ROLES.SUBJECT_TEACHER]: 'Subject Teacher',
    [USER_ROLES.CLERK]: 'Clerk',
    [USER_ROLES.DRIVER]: 'Driver',
    [USER_ROLES.SECURITY]: 'Security',
    [USER_ROLES.CLEANER]: 'Cleaner',
  };
  return roleNames[role] || role;
};

// Check if role has permission to access a module
export const hasPermission = (role, module) => {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  
  if (ROLE_PERMISSIONS[role].modules.includes('all')) {
    return true;
  }
  
  return ROLE_PERMISSIONS[role].modules.includes(module);
};