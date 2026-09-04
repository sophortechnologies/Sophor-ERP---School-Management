import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const hash = (pw: string) => bcrypt.hash(pw, 12);

// ─── 1. PERMISSIONS ───────────────────────────────────────────────────────────
// Unified format: resource:action  (all lowercase with colon separator)
const permissions = [
  // ── User Management ─────────────────────────────────────────────────────────
  { code: 'user:create',            resource: 'user',       action: 'create',     scope: 'all',   name: 'Create User' },
  { code: 'user:read',              resource: 'user',       action: 'read',       scope: 'all',   name: 'Read All Users' },
  { code: 'user:read:own',          resource: 'user',       action: 'read',       scope: 'own',   name: 'Read Own Profile' },
  { code: 'user:update',            resource: 'user',       action: 'update',     scope: 'all',   name: 'Update Any User' },
  { code: 'user:update:own',        resource: 'user',       action: 'update',     scope: 'own',   name: 'Update Own Profile' },
  { code: 'user:delete',            resource: 'user',       action: 'delete',     scope: 'all',   name: 'Delete User' },

  // ── Role & Permission Management ─────────────────────────────────────────────
  { code: 'role:create',            resource: 'role',       action: 'create',     scope: 'all',   name: 'Create Role' },
  { code: 'role:read',              resource: 'role',       action: 'read',       scope: 'all',   name: 'Read Roles' },
  { code: 'role:update',            resource: 'role',       action: 'update',     scope: 'all',   name: 'Update Role' },
  { code: 'role:delete',            resource: 'role',       action: 'delete',     scope: 'all',   name: 'Delete Role' },
  { code: 'permission:assign',      resource: 'permission', action: 'assign',     scope: 'all',   name: 'Assign Permission' },

  // ── School Configuration ──────────────────────────────────────────────────
  { code: 'config:read',            resource: 'config',     action: 'read',       scope: 'all',   name: 'Read School Config' },
  { code: 'config:manage',          resource: 'config',     action: 'manage',     scope: 'all',   name: 'Manage School Config' },

  // ── Academic Sessions ─────────────────────────────────────────────────────
  { code: 'session:create',         resource: 'session',    action: 'create',     scope: 'all',   name: 'Create Academic Session' },
  { code: 'session:read',           resource: 'session',    action: 'read',       scope: 'all',   name: 'Read Academic Sessions' },
  { code: 'session:update',         resource: 'session',    action: 'update',     scope: 'all',   name: 'Update Academic Session' },
  { code: 'session:delete',         resource: 'session',    action: 'delete',     scope: 'all',   name: 'Delete Academic Session' },

  // ── Classes & Sections ────────────────────────────────────────────────────
  { code: 'class:create',           resource: 'class',      action: 'create',     scope: 'all',   name: 'Create Class' },
  { code: 'class:read',             resource: 'class',      action: 'read',       scope: 'all',   name: 'Read Classes' },
  { code: 'class:update',           resource: 'class',      action: 'update',     scope: 'all',   name: 'Update Class' },
  { code: 'class:delete',           resource: 'class',      action: 'delete',     scope: 'all',   name: 'Delete Class' },
  { code: 'section:create',         resource: 'section',    action: 'create',     scope: 'all',   name: 'Create Section' },
  { code: 'section:read',           resource: 'section',    action: 'read',       scope: 'all',   name: 'Read Sections' },
  { code: 'section:update',         resource: 'section',    action: 'update',     scope: 'all',   name: 'Update Section' },
  { code: 'section:delete',         resource: 'section',    action: 'delete',     scope: 'all',   name: 'Delete Section' },

  // ── Subjects & Departments ────────────────────────────────────────────────
  { code: 'subject:create',         resource: 'subject',    action: 'create',     scope: 'all',   name: 'Create Subject' },
  { code: 'subject:read',           resource: 'subject',    action: 'read',       scope: 'all',   name: 'Read Subjects' },
  { code: 'subject:update',         resource: 'subject',    action: 'update',     scope: 'all',   name: 'Update Subject' },
  { code: 'subject:delete',         resource: 'subject',    action: 'delete',     scope: 'all',   name: 'Delete Subject' },
  { code: 'department:create',      resource: 'department', action: 'create',     scope: 'all',   name: 'Create Department' },
  { code: 'department:read',        resource: 'department', action: 'read',       scope: 'all',   name: 'Read Departments' },
  { code: 'department:update',      resource: 'department', action: 'update',     scope: 'all',   name: 'Update Department' },
  { code: 'department:delete',      resource: 'department', action: 'delete',     scope: 'all',   name: 'Delete Department' },

  // ── Students ──────────────────────────────────────────────────────────────
  { code: 'student:create',         resource: 'student',    action: 'create',     scope: 'all',   name: 'Create Student' },
  { code: 'student:read',           resource: 'student',    action: 'read',       scope: 'all',   name: 'Read All Students' },
  { code: 'student:read:class',     resource: 'student',    action: 'read',       scope: 'class', name: 'Read Class Students' },
  { code: 'student:read:own',       resource: 'student',    action: 'read',       scope: 'own',   name: 'Read Own Profile' },
  { code: 'student:update',         resource: 'student',    action: 'update',     scope: 'all',   name: 'Update Any Student' },
  { code: 'student:update:class',   resource: 'student',    action: 'update',     scope: 'class', name: 'Update Class Students' },
  { code: 'student:delete',         resource: 'student',    action: 'delete',     scope: 'all',   name: 'Delete Student' },

  // ── Teachers ──────────────────────────────────────────────────────────────
  { code: 'teacher:create',         resource: 'teacher',    action: 'create',     scope: 'all',   name: 'Register Teacher' },
  { code: 'teacher:read',           resource: 'teacher',    action: 'read',       scope: 'all',   name: 'Read Teachers' },
  { code: 'teacher:update',         resource: 'teacher',    action: 'update',     scope: 'all',   name: 'Update Teacher' },
  { code: 'teacher:delete',         resource: 'teacher',    action: 'delete',     scope: 'all',   name: 'Delete Teacher' },

  // ── Staff ─────────────────────────────────────────────────────────────────
  { code: 'staff:create',           resource: 'staff',      action: 'create',     scope: 'all',   name: 'Register Staff' },
  { code: 'staff:read',             resource: 'staff',      action: 'read',       scope: 'all',   name: 'Read Staff' },
  { code: 'staff:update',           resource: 'staff',      action: 'update',     scope: 'all',   name: 'Update Staff' },
  { code: 'staff:delete',           resource: 'staff',      action: 'delete',     scope: 'all',   name: 'Delete Staff' },

  // ── Employees ─────────────────────────────────────────────────────────────
  { code: 'employee:create',        resource: 'employee',   action: 'create',     scope: 'all',   name: 'Create Employee' },
  { code: 'employee:read',          resource: 'employee',   action: 'read',       scope: 'all',   name: 'Read Employees' },
  { code: 'employee:update',        resource: 'employee',   action: 'update',     scope: 'all',   name: 'Update Employee' },
  { code: 'employee:delete',        resource: 'employee',   action: 'delete',     scope: 'all',   name: 'Delete Employee' },

  // ── Attendance ────────────────────────────────────────────────────────────
  { code: 'attendance:create',      resource: 'attendance', action: 'create',     scope: 'class', name: 'Mark Student Attendance' },
  { code: 'attendance:read',        resource: 'attendance', action: 'read',       scope: 'class', name: 'Read Attendance' },
  { code: 'attendance:read:all',    resource: 'attendance', action: 'read',       scope: 'all',   name: 'Read All Attendance' },
  { code: 'attendance:update',      resource: 'attendance', action: 'update',     scope: 'class', name: 'Update Attendance' },
  { code: 'attendance:delete',      resource: 'attendance', action: 'delete',     scope: 'all',   name: 'Delete Attendance' },
  { code: 'attendance:mark',        resource: 'attendance', action: 'mark',       scope: 'all',   name: 'Mark Employee Attendance' },

  // ── Exams & Grading ───────────────────────────────────────────────────────
  { code: 'exam:create',            resource: 'exam',       action: 'create',     scope: 'all',   name: 'Create Exam' },
  { code: 'exam:read',              resource: 'exam',       action: 'read',       scope: 'all',   name: 'Read Exams' },
  { code: 'exam:read:class',        resource: 'exam',       action: 'read',       scope: 'class', name: 'Read Class Exams' },
  { code: 'exam:update',            resource: 'exam',       action: 'update',     scope: 'all',   name: 'Update Exam' },
  { code: 'exam:delete',            resource: 'exam',       action: 'delete',     scope: 'all',   name: 'Delete Exam' },
  { code: 'exam:publish',           resource: 'exam',       action: 'publish',    scope: 'all',   name: 'Publish Exam' },
  { code: 'grade:create',           resource: 'grade',      action: 'create',     scope: 'class', name: 'Enter Grades' },
  { code: 'grade:read',             resource: 'grade',      action: 'read',       scope: 'class', name: 'Read Grades' },
  { code: 'grade:read:own',         resource: 'grade',      action: 'read',       scope: 'own',   name: 'Read Own Grades' },
  { code: 'grade:update',           resource: 'grade',      action: 'update',     scope: 'class', name: 'Update Grades' },
  { code: 'grade:delete',           resource: 'grade',      action: 'delete',     scope: 'all',   name: 'Delete Grades' },
  { code: 'grade:verify',           resource: 'grade',      action: 'verify',     scope: 'all',   name: 'Verify Exam Results' },

  // ── Timetable ─────────────────────────────────────────────────────────────
  { code: 'timetable:create',       resource: 'timetable',  action: 'create',     scope: 'all',   name: 'Create Timetable' },
  { code: 'timetable:read',         resource: 'timetable',  action: 'read',       scope: 'all',   name: 'Read Timetable' },
  { code: 'timetable:update',       resource: 'timetable',  action: 'update',     scope: 'all',   name: 'Update Timetable' },
  { code: 'timetable:delete',       resource: 'timetable',  action: 'delete',     scope: 'all',   name: 'Delete Timetable' },

  // ── Billing & Payments ────────────────────────────────────────────────────
  { code: 'billing:create',         resource: 'billing',    action: 'create',     scope: 'all',   name: 'Create Bill' },
  { code: 'billing:read',           resource: 'billing',    action: 'read',       scope: 'all',   name: 'Read Bills' },
  { code: 'billing:read:own',       resource: 'billing',    action: 'read',       scope: 'own',   name: 'Read Own Bills' },
  { code: 'billing:update',         resource: 'billing',    action: 'update',     scope: 'all',   name: 'Update Bill' },
  { code: 'billing:delete',         resource: 'billing',    action: 'delete',     scope: 'all',   name: 'Delete Bill' },
  { code: 'payment:create',         resource: 'payment',    action: 'create',     scope: 'all',   name: 'Record Payment' },
  { code: 'payment:read',           resource: 'payment',    action: 'read',       scope: 'all',   name: 'Read Payments' },
  { code: 'payment:read:own',       resource: 'payment',    action: 'read',       scope: 'own',   name: 'Read Own Payments' },
  { code: 'payment:update',         resource: 'payment',    action: 'update',     scope: 'all',   name: 'Update Payment' },
  { code: 'payment:delete',         resource: 'payment',    action: 'delete',     scope: 'all',   name: 'Delete Payment' },

  // ── Budget ────────────────────────────────────────────────────────────────
  { code: 'budget:create',          resource: 'budget',     action: 'create',     scope: 'all',   name: 'Create Budget' },
  { code: 'budget:read',            resource: 'budget',     action: 'read',       scope: 'all',   name: 'Read Budgets' },
  { code: 'budget:update',          resource: 'budget',     action: 'update',     scope: 'all',   name: 'Update Budget' },
  { code: 'budget:delete',          resource: 'budget',     action: 'delete',     scope: 'all',   name: 'Delete Budget' },
  { code: 'budget:submit',          resource: 'budget',     action: 'submit',     scope: 'all',   name: 'Submit Budget' },
  { code: 'budget:approve',         resource: 'budget',     action: 'approve',    scope: 'all',   name: 'Approve Budget' },
  { code: 'budget:transfer',        resource: 'budget',     action: 'transfer',   scope: 'all',   name: 'Transfer Budget Funds' },
  { code: 'budget:manage',          resource: 'budget',     action: 'manage',     scope: 'all',   name: 'Full Budget Management' },

  // ── Assets ────────────────────────────────────────────────────────────────
  { code: 'asset:create',           resource: 'asset',      action: 'create',     scope: 'all',   name: 'Create Asset' },
  { code: 'asset:read',             resource: 'asset',      action: 'read',       scope: 'all',   name: 'Read Assets' },
  { code: 'asset:update',           resource: 'asset',      action: 'update',     scope: 'all',   name: 'Update Asset' },
  { code: 'asset:delete',           resource: 'asset',      action: 'delete',     scope: 'all',   name: 'Delete Asset' },
  { code: 'asset:assign',           resource: 'asset',      action: 'assign',     scope: 'all',   name: 'Assign Asset' },
  { code: 'asset:maintain',         resource: 'asset',      action: 'maintain',   scope: 'all',   name: 'Schedule Maintenance' },
  { code: 'asset:dispose',          resource: 'asset',      action: 'dispose',    scope: 'all',   name: 'Dispose Asset' },
  { code: 'asset:depreciate',       resource: 'asset',      action: 'depreciate', scope: 'all',   name: 'Run Depreciation' },

  // ── Payroll ───────────────────────────────────────────────────────────────
  { code: 'payroll:create',         resource: 'payroll',    action: 'create',     scope: 'all',   name: 'Generate Payroll' },
  { code: 'payroll:view',           resource: 'payroll',    action: 'view',       scope: 'all',   name: 'View Payroll' },
  { code: 'payroll:update',         resource: 'payroll',    action: 'update',     scope: 'all',   name: 'Update Payroll' },
  { code: 'payroll:delete',         resource: 'payroll',    action: 'delete',     scope: 'all',   name: 'Delete Payroll' },
  { code: 'payroll:approve',        resource: 'payroll',    action: 'approve',    scope: 'all',   name: 'Approve Payroll' },
  { code: 'payroll:process',        resource: 'payroll',    action: 'process',    scope: 'all',   name: 'Process Payroll' },
  { code: 'payroll:disburse',       resource: 'payroll',    action: 'disburse',   scope: 'all',   name: 'Disburse Payroll' },
  { code: 'payroll:manage',         resource: 'payroll',    action: 'manage',     scope: 'all',   name: 'Full Payroll Management' },

  // ── Salary Structure ──────────────────────────────────────────────────────
  { code: 'salary:create',          resource: 'salary',     action: 'create',     scope: 'all',   name: 'Create Salary Structure' },
  { code: 'salary:view',            resource: 'salary',     action: 'view',       scope: 'all',   name: 'View Salary Structure' },
  { code: 'salary:update',          resource: 'salary',     action: 'update',     scope: 'all',   name: 'Update Salary Structure' },
  { code: 'salary:delete',          resource: 'salary',     action: 'delete',     scope: 'all',   name: 'Delete Salary Structure' },

  // ── Payslips ──────────────────────────────────────────────────────────────
  { code: 'payslip:view',           resource: 'payslip',    action: 'view',       scope: 'all',   name: 'View Payslip' },
  { code: 'payslip:view:own',       resource: 'payslip',    action: 'view',       scope: 'own',   name: 'View Own Payslip' },
  { code: 'payslip:download',       resource: 'payslip',    action: 'download',   scope: 'all',   name: 'Download Payslip' },
  { code: 'payslip:send',           resource: 'payslip',    action: 'send',       scope: 'all',   name: 'Send Payslip via Email' },

  // ── Leave ─────────────────────────────────────────────────────────────────
  { code: 'leave:apply',            resource: 'leave',      action: 'apply',      scope: 'own',   name: 'Apply for Leave' },
  { code: 'leave:read',             resource: 'leave',      action: 'read',       scope: 'all',   name: 'Read All Leave Requests' },
  { code: 'leave:read:own',         resource: 'leave',      action: 'read',       scope: 'own',   name: 'Read Own Leave' },
  { code: 'leave:approve',          resource: 'leave',      action: 'approve',    scope: 'all',   name: 'Approve Leave' },
  { code: 'leave:cancel',           resource: 'leave',      action: 'cancel',     scope: 'own',   name: 'Cancel Own Leave' },

  // ── Reports ───────────────────────────────────────────────────────────────
  { code: 'report:read',            resource: 'report',     action: 'read',       scope: 'all',   name: 'Read Reports' },
  { code: 'report:export',          resource: 'report',     action: 'export',     scope: 'all',   name: 'Export Reports' },

  // ── Notifications & Communication ─────────────────────────────────────────
  { code: 'notification:create',    resource: 'notification', action: 'create',   scope: 'all',   name: 'Send Notification' },
  { code: 'notification:read',      resource: 'notification', action: 'read',     scope: 'own',   name: 'Read Own Notifications' },
  { code: 'communication:send',     resource: 'communication', action: 'send',    scope: 'all',   name: 'Send Message' },
  { code: 'communication:read',     resource: 'communication', action: 'read',    scope: 'own',   name: 'Read Messages' },

  // ── Calendar & Holidays ───────────────────────────────────────────────────
  { code: 'calendar:create',        resource: 'calendar',   action: 'create',     scope: 'all',   name: 'Create Calendar Event' },
  { code: 'calendar:read',          resource: 'calendar',   action: 'read',       scope: 'all',   name: 'Read Calendar' },
  { code: 'calendar:update',        resource: 'calendar',   action: 'update',     scope: 'all',   name: 'Update Calendar Event' },
  { code: 'calendar:delete',        resource: 'calendar',   action: 'delete',     scope: 'all',   name: 'Delete Calendar Event' },
  { code: 'holiday:create',         resource: 'holiday',    action: 'create',     scope: 'all',   name: 'Create Holiday' },
  { code: 'holiday:read',           resource: 'holiday',    action: 'read',       scope: 'all',   name: 'Read Holidays' },
  { code: 'holiday:update',         resource: 'holiday',    action: 'update',     scope: 'all',   name: 'Update Holiday' },
  { code: 'holiday:delete',         resource: 'holiday',    action: 'delete',     scope: 'all',   name: 'Delete Holiday' },
];

// ─── 2. ROLES ─────────────────────────────────────────────────────────────────
const roles = [
  { code: 'SUPER_ADMIN', name: 'SUPER_ADMIN', description: 'Full unrestricted system access',                           isSystem: true  },
  { code: 'ADMIN',       name: 'ADMIN',       description: 'School administrator — full academic and operational access', isSystem: true  },
  { code: 'FINANCE',     name: 'FINANCE',     description: 'Finance officer — billing, payments, payroll, budget',       isSystem: false },
  { code: 'HR',          name: 'HR',          description: 'HR officer — employees, attendance, leave, payroll',         isSystem: false },
  { code: 'HOD',         name: 'HOD',         description: 'Head of department — budget, staff, department management',  isSystem: false },
  { code: 'TEACHER',     name: 'TEACHER',     description: 'Teacher — class management, attendance, grading',           isSystem: false },
  { code: 'STAFF',       name: 'STAFF',       description: 'Support staff — limited operational access',                isSystem: false },
  { code: 'STUDENT',     name: 'STUDENT',     description: 'Student — own profile, grades, attendance, bills',          isSystem: false },
  { code: 'PARENT',      name: 'PARENT',      description: 'Parent — children\'s profile, grades, attendance, bills',   isSystem: false },
];

// ─── 3. ROLE → PERMISSION MAPPING ────────────────────────────────────────────
const rolePermissions: Record<string, string[]> = {

  // SUPER_ADMIN → everything (assigned dynamically below)
  SUPER_ADMIN: ['*'],

  ADMIN: [
    // Full user & role management
    'user:create', 'user:read', 'user:update', 'user:delete',
    'role:create', 'role:read', 'role:update', 'role:delete', 'permission:assign',
    // School setup
    'config:read', 'config:manage',
    'session:create', 'session:read', 'session:update', 'session:delete',
    'class:create', 'class:read', 'class:update', 'class:delete',
    'section:create', 'section:read', 'section:update', 'section:delete',
    'subject:create', 'subject:read', 'subject:update', 'subject:delete',
    'department:create', 'department:read', 'department:update', 'department:delete',
    'timetable:create', 'timetable:read', 'timetable:update', 'timetable:delete',
    'holiday:create', 'holiday:read', 'holiday:update', 'holiday:delete',
    'calendar:create', 'calendar:read', 'calendar:update', 'calendar:delete',
    // People
    'student:create', 'student:read', 'student:update', 'student:delete',
    'teacher:create', 'teacher:read', 'teacher:update', 'teacher:delete',
    'staff:create', 'staff:read', 'staff:update', 'staff:delete',
    'employee:create', 'employee:read', 'employee:update', 'employee:delete',
    // Academic
    'exam:create', 'exam:read', 'exam:update', 'exam:delete', 'exam:publish',
    'grade:create', 'grade:read', 'grade:update', 'grade:delete', 'grade:verify',
    // Operations
    'attendance:create', 'attendance:read', 'attendance:read:all', 'attendance:update', 'attendance:delete', 'attendance:mark',
    'leave:apply', 'leave:read', 'leave:read:own', 'leave:approve', 'leave:cancel',
    // Finance
    'billing:create', 'billing:read', 'billing:update', 'billing:delete',
    'payment:create', 'payment:read', 'payment:update', 'payment:delete',
    'budget:create', 'budget:read', 'budget:update', 'budget:submit', 'budget:approve', 'budget:transfer', 'budget:manage',
    'asset:create', 'asset:read', 'asset:update', 'asset:delete', 'asset:assign', 'asset:maintain', 'asset:dispose', 'asset:depreciate',
    'payroll:create', 'payroll:view', 'payroll:update', 'payroll:approve', 'payroll:process', 'payroll:disburse', 'payroll:manage',
    'salary:create', 'salary:view', 'salary:update', 'salary:delete',
    'payslip:view', 'payslip:download', 'payslip:send',
    // Reports
    'report:read', 'report:export',
    // Communication
    'notification:create', 'notification:read',
    'communication:send', 'communication:read',
  ],

  FINANCE: [
    'config:read',
    'student:read',
    'billing:create', 'billing:read', 'billing:update', 'billing:delete',
    'payment:create', 'payment:read', 'payment:update', 'payment:delete',
    'budget:create', 'budget:read', 'budget:update', 'budget:submit', 'budget:approve', 'budget:transfer', 'budget:manage',
    'asset:create', 'asset:read', 'asset:update', 'asset:assign', 'asset:maintain', 'asset:dispose', 'asset:depreciate',
    'payroll:create', 'payroll:view', 'payroll:approve', 'payroll:process', 'payroll:disburse', 'payroll:manage',
    'salary:create', 'salary:view', 'salary:update',
    'payslip:view', 'payslip:download', 'payslip:send',
    'report:read', 'report:export',
    'notification:read', 'communication:send', 'communication:read',
    'leave:read',
  ],

  HR: [
    'config:read',
    'employee:create', 'employee:read', 'employee:update',
    'staff:create', 'staff:read', 'staff:update',
    'teacher:read',
    'attendance:mark', 'attendance:read:all', 'attendance:update',
    'leave:read', 'leave:approve',
    'payroll:create', 'payroll:view', 'payroll:approve', 'payroll:process', 'payroll:manage',
    'salary:create', 'salary:view', 'salary:update', 'salary:delete',
    'payslip:view', 'payslip:download', 'payslip:send',
    'department:read', 'department:update',
    'report:read', 'report:export',
    'notification:create', 'notification:read',
    'communication:send', 'communication:read',
  ],

  HOD: [
    'config:read',
    'department:read', 'department:update',
    'teacher:read', 'teacher:update',
    'staff:read',
    'student:read',
    'class:read', 'section:read', 'subject:read', 'timetable:read',
    'attendance:read:all',
    'exam:read', 'grade:read',
    'budget:create', 'budget:read', 'budget:update', 'budget:submit',
    'leave:read', 'leave:approve',
    'report:read', 'report:export',
    'notification:read', 'communication:send', 'communication:read',
  ],

  TEACHER: [
    'config:read',
    'session:read', 'class:read', 'section:read', 'subject:read',
    'timetable:read', 'calendar:read', 'holiday:read',
    'student:read:class',
    'attendance:create', 'attendance:read', 'attendance:update',
    'exam:create', 'exam:read:class', 'exam:update',
    'grade:create', 'grade:read', 'grade:update',
    'leave:apply', 'leave:read:own', 'leave:cancel',
    'payroll:view', 'payslip:view:own', 'payslip:download', 'salary:view',
    'report:read',
    'notification:read', 'communication:send', 'communication:read',
    'user:read:own', 'user:update:own',
  ],

  STAFF: [
    'config:read',
    'session:read', 'class:read', 'section:read',
    'calendar:read', 'holiday:read',
    'leave:apply', 'leave:read:own', 'leave:cancel',
    'payroll:view', 'payslip:view:own', 'payslip:download', 'salary:view',
    'notification:read', 'communication:send', 'communication:read',
    'user:read:own', 'user:update:own',
  ],

  STUDENT: [
    'config:read',
    'session:read', 'class:read', 'timetable:read', 'calendar:read', 'holiday:read',
    'student:read:own',
    'attendance:read',
    'exam:read:class',
    'grade:read:own',
    'billing:read:own', 'payment:read:own',
    'payslip:view:own',
    'notification:read', 'communication:send', 'communication:read',
    'user:read:own', 'user:update:own',
  ],

  PARENT: [
    'config:read',
    'calendar:read', 'holiday:read',
    'student:read:own',
    'attendance:read',
    'exam:read:class',
    'grade:read:own',
    'billing:read:own', 'payment:read:own',
    'notification:read', 'communication:send', 'communication:read',
    'user:read:own', 'user:update:own',
  ],
};

// ─── 4. DEFAULT USERS ─────────────────────────────────────────────────────────
const defaultUsers = [
  { username: 'superadmin', email: 'superadmin@school.com', password: 'Admin123!',   role: 'SUPER_ADMIN', firstName: 'Super',   lastName: 'Admin'   },
  { username: 'admin',      email: 'admin@school.com',      password: 'Admin123!',   role: 'ADMIN',       firstName: 'School',  lastName: 'Admin'   },
  { username: 'finance',    email: 'finance@school.com',    password: 'Finance123!', role: 'FINANCE',     firstName: 'Finance', lastName: 'Officer' },
  { username: 'hr',         email: 'hr@school.com',         password: 'Hr@123456!',  role: 'HR',          firstName: 'HR',      lastName: 'Officer' },
  { username: 'teacher',    email: 'teacher@school.com',    password: 'Teacher123!', role: 'TEACHER',     firstName: 'Demo',    lastName: 'Teacher' },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding database...\n');

  // ── Step 1: Permissions ────────────────────────────────────────────────────
  console.log('📋 Seeding permissions...');
  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: { name: p.name, resource: p.resource, action: p.action, scope: p.scope },
      create: { code: p.code, name: p.name, resource: p.resource, action: p.action, scope: p.scope },
    });
  }
  console.log(`   ✓ ${permissions.length} permissions seeded\n`);

  // ── Step 2: Roles ──────────────────────────────────────────────────────────
  console.log('🎭 Seeding roles...');
  for (const r of roles) {
    await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name, description: r.description, isSystem: r.isSystem },
      create: { code: r.code, name: r.name, description: r.description, isSystem: r.isSystem },
    });
  }
  console.log(`   ✓ ${roles.length} roles seeded\n`);

  // ── Step 3: Role ↔ Permission assignments ─────────────────────────────────
  console.log('🔗 Assigning permissions to roles...');
  const allPermissions = await prisma.permission.findMany();
  const allRoles       = await prisma.role.findMany();
  const byCode         = (code: string) => allRoles.find(r => r.code === code)!;
  const permByCode     = (code: string) => allPermissions.find(p => p.code === code);

  for (const [roleCode, permCodes] of Object.entries(rolePermissions)) {
    const role = byCode(roleCode);
    if (!role) continue;

    const permsToAssign = permCodes[0] === '*'
      ? allPermissions                      // SUPER_ADMIN gets everything
      : permCodes.map(permByCode).filter(Boolean) as typeof allPermissions;

    for (const perm of permsToAssign) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
    console.log(`   ✓ ${roleCode}: ${permsToAssign.length} permissions assigned`);
  }
  console.log();

  // ── Step 4: Default users ──────────────────────────────────────────────────
  console.log('👤 Seeding default users...');
  for (const u of defaultUsers) {
    const role = byCode(u.role);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { username: u.username, passwordHash: await hash(u.password), roleId: role.id, isActive: true },
      create: {
        username: u.username, email: u.email,
        passwordHash: await hash(u.password),
        firstName: u.firstName, lastName: u.lastName,
        phone: '', roleId: role.id, isActive: true,
      },
    });
    console.log(`   ✓ ${u.email} (${u.role})`);
  }
  console.log();

  // ── Step 5: School configuration ──────────────────────────────────────────
  console.log('🏫 Seeding school configuration...');
  const now = new Date();
  await prisma.schoolConfiguration.upsert({
    where: { id: 1 },
    update: {
      schoolName: 'Sophor Academy',
      academicYear: `${now.getFullYear()}-${now.getFullYear() + 1}`,
      startDate: new Date(now.getFullYear(), 8, 1),
      endDate:   new Date(now.getFullYear() + 1, 6, 31),
      address:   'Addis Ababa, Ethiopia',
      currency:  'ETB',
      isActive:  true,
    },
    create: {
      schoolName: 'Sophor Academy',
      academicYear: `${now.getFullYear()}-${now.getFullYear() + 1}`,
      startDate: new Date(now.getFullYear(), 8, 1),
      endDate:   new Date(now.getFullYear() + 1, 6, 31),
      address:   'Addis Ababa, Ethiopia',
      currency:  'ETB',
      isActive:  true,
    },
  });
  console.log('   ✓ School configuration seeded\n');

  // ── Step 6: Default academic session ──────────────────────────────────────
  console.log('📅 Seeding default academic session...');
  await prisma.academicSession.upsert({
    where: { name: `${now.getFullYear()}-${now.getFullYear() + 1}` },
    update: { isActive: true },
    create: {
      name:      `${now.getFullYear()}-${now.getFullYear() + 1}`,
      startDate: new Date(now.getFullYear(), 8, 1),
      endDate:   new Date(now.getFullYear() + 1, 6, 31),
      isActive:  true,
    },
  });
  console.log('   ✓ Academic session seeded\n');

  console.log('✅ Seeding completed successfully.\n');
  console.log('─────────────────────────────────────────────');
  console.log('Default Login Credentials:');
  console.log('─────────────────────────────────────────────');
  for (const u of defaultUsers) {
    console.log(`  ${u.role.padEnd(12)} ${u.email.padEnd(30)} ${u.password}`);
  }
  console.log('─────────────────────────────────────────────');
  console.log('⚠️  Change all passwords after first login!\n');
}

main()
  .catch(e => { console.error('❌ Seeding failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
