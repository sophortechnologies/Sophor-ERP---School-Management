import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

const permissions = [
  // Users
  { code: 'USER_CREATE', name: 'Create User', resource: 'user', action: 'create', scope: 'all', description: 'Create users' },
  { code: 'USER_READ', name: 'Read User', resource: 'user', action: 'read', scope: 'all', description: 'Read all users' },
  { code: 'USER_READ_OWN', name: 'Read Own Profile', resource: 'user', action: 'read', scope: 'own', description: 'Read own profile' },
  { code: 'USER_UPDATE', name: 'Update User', resource: 'user', action: 'update', scope: 'all', description: 'Update any user' },
  { code: 'USER_UPDATE_OWN', name: 'Update Own Profile', resource: 'user', action: 'update', scope: 'own', description: 'Update own profile' },
  { code: 'USER_DELETE', name: 'Delete User', resource: 'user', action: 'delete', scope: 'all', description: 'Delete users' },

  // Students
  { code: 'STUDENT_CREATE', name: 'Create Student', resource: 'student', action: 'create', scope: 'all', description: 'Create students' },
  { code: 'STUDENT_READ', name: 'Read Student', resource: 'student', action: 'read', scope: 'all', description: 'Read all students' },
  { code: 'STUDENT_READ_CLASS', name: 'Read Class Students', resource: 'student', action: 'read', scope: 'class', description: 'Read students in assigned classes' },
  { code: 'STUDENT_UPDATE', name: 'Update Student', resource: 'student', action: 'update', scope: 'all', description: 'Update any student' },
  { code: 'STUDENT_UPDATE_CLASS', name: 'Update Class Students', resource: 'student', action: 'update', scope: 'class', description: 'Update students in assigned classes' },

  // Attendance
  { code: 'ATTENDANCE_CREATE', name: 'Create Attendance', resource: 'attendance', action: 'create', scope: 'class', description: 'Create attendance records' },
  { code: 'ATTENDANCE_READ', name: 'Read Attendance', resource: 'attendance', action: 'read', scope: 'class', description: 'Read attendance records' },
  { code: 'ATTENDANCE_UPDATE', name: 'Update Attendance', resource: 'attendance', action: 'update', scope: 'class', description: 'Update attendance records' },
  { code: 'ATTENDANCE_DELETE', name: 'Delete Attendance', resource: 'attendance', action: 'delete', scope: 'class', description: 'Delete attendance records' },

  // Exams
  { code: 'EXAM_CREATE', name: 'Create Exam', resource: 'exam', action: 'create', scope: 'all', description: 'Create exams' },
  { code: 'EXAM_READ', name: 'Read Exam', resource: 'exam', action: 'read', scope: 'all', description: 'Read exams' },
  { code: 'EXAM_UPDATE', name: 'Update Exam', resource: 'exam', action: 'update', scope: 'all', description: 'Update exams' },
  { code: 'EXAM_DELETE', name: 'Delete Exam', resource: 'exam', action: 'delete', scope: 'all', description: 'Delete exams' },

  // Grades
  { code: 'GRADE_CREATE', name: 'Create Grade', resource: 'grade', action: 'create', scope: 'class', description: 'Create grades' },
  { code: 'GRADE_READ', name: 'Read Grade', resource: 'grade', action: 'read', scope: 'class', description: 'Read grades' },
  { code: 'GRADE_UPDATE', name: 'Update Grade', resource: 'grade', action: 'update', scope: 'class', description: 'Update grades' },
  { code: 'GRADE_DELETE', name: 'Delete Grade', resource: 'grade', action: 'delete', scope: 'class', description: 'Delete grades' },

  // Roles & Permissions
  { code: 'ROLE_CREATE', name: 'Create Role', resource: 'role', action: 'create', scope: 'all', description: 'Create roles' },
  { code: 'ROLE_READ', name: 'Read Role', resource: 'role', action: 'read', scope: 'all', description: 'Read roles' },
  { code: 'ROLE_UPDATE', name: 'Update Role', resource: 'role', action: 'update', scope: 'all', description: 'Update roles' },
  { code: 'ROLE_DELETE', name: 'Delete Role', resource: 'role', action: 'delete', scope: 'all', description: 'Delete roles' },
  { code: 'PERMISSION_ASSIGN', name: 'Assign Permission', resource: 'permission', action: 'assign', scope: 'all', description: 'Assign permissions to roles/users' },

  // Budget
  { code: 'budget:create', name: 'Create Budget', resource: 'budget', action: 'create', scope: 'all', description: 'Create new budgets' },
  { code: 'budget:view', name: 'View Budget', resource: 'budget', action: 'view', scope: 'all', description: 'View budgets' },
  { code: 'budget:update', name: 'Update Budget', resource: 'budget', action: 'update', scope: 'all', description: 'Update budgets' },
  { code: 'budget:delete', name: 'Delete Budget', resource: 'budget', action: 'delete', scope: 'all', description: 'Delete budgets' },
  { code: 'budget:submit', name: 'Submit Budget', resource: 'budget', action: 'submit', scope: 'all', description: 'Submit budget for approval' },
  { code: 'budget:approve', name: 'Approve Budget', resource: 'budget', action: 'approve', scope: 'all', description: 'Approve budgets' },
  { code: 'budget:transfer', name: 'Transfer Budget', resource: 'budget', action: 'transfer', scope: 'all', description: 'Transfer budget funds' },
  { code: 'budget:manage', name: 'Manage Budget', resource: 'budget', action: 'manage', scope: 'all', description: 'Full budget management' },

  // Assets
  { code: 'asset:create', name: 'Create Asset', resource: 'asset', action: 'create', scope: 'all', description: 'Create new assets' },
  { code: 'asset:view', name: 'View Asset', resource: 'asset', action: 'view', scope: 'all', description: 'View assets' },
  { code: 'asset:update', name: 'Update Asset', resource: 'asset', action: 'update', scope: 'all', description: 'Update assets' },
  { code: 'asset:delete', name: 'Delete Asset', resource: 'asset', action: 'delete', scope: 'all', description: 'Delete assets' },
  { code: 'asset:assign', name: 'Assign Asset', resource: 'asset', action: 'assign', scope: 'all', description: 'Assign assets to users' },
  { code: 'asset:maintain', name: 'Maintain Asset', resource: 'asset', action: 'maintain', scope: 'all', description: 'Schedule asset maintenance' },
  { code: 'asset:dispose', name: 'Dispose Asset', resource: 'asset', action: 'dispose', scope: 'all', description: 'Dispose assets' },
  { code: 'asset:depreciate', name: 'Depreciate Asset', resource: 'asset', action: 'depreciate', scope: 'all', description: 'Run asset depreciation' },

  // Employees
  { code: 'employee:create', name: 'Create Employee', resource: 'employee', action: 'create', scope: 'all', description: 'Create employee' },
  { code: 'employee:view', name: 'View Employee', resource: 'employee', action: 'view', scope: 'all', description: 'View employee' },
  { code: 'employee:update', name: 'Update Employee', resource: 'employee', action: 'update', scope: 'all', description: 'Update employee' },
  { code: 'employee:delete', name: 'Delete Employee', resource: 'employee', action: 'delete', scope: 'all', description: 'Delete employee' },

  // Attendance (employee)
  { code: 'attendance:mark', name: 'Mark Attendance', resource: 'attendance', action: 'mark', scope: 'all', description: 'Mark employee attendance' },
  { code: 'attendance:view', name: 'View Attendance', resource: 'attendance', action: 'view', scope: 'all', description: 'View attendance records' },
  { code: 'attendance:update', name: 'Update Attendance', resource: 'attendance', action: 'update', scope: 'all', description: 'Update attendance records' },
  { code: 'attendance:delete', name: 'Delete Attendance', resource: 'attendance', action: 'delete', scope: 'all', description: 'Delete attendance records' },

  // Leave
  { code: 'leave:apply', name: 'Apply Leave', resource: 'leave', action: 'apply', scope: 'all', description: 'Apply for leave' },
  { code: 'leave:view', name: 'View Leave', resource: 'leave', action: 'view', scope: 'all', description: 'View leave requests' },
  { code: 'leave:approve', name: 'Approve Leave', resource: 'leave', action: 'approve', scope: 'all', description: 'Approve leave requests' },
  { code: 'leave:cancel', name: 'Cancel Leave', resource: 'leave', action: 'cancel', scope: 'all', description: 'Cancel leave requests' },

  // Add to permissions array
{ code: 'payroll:create', name: 'Create Payroll', resource: 'payroll', action: 'create', scope: 'all' },
{ code: 'payroll:view', name: 'View Payroll', resource: 'payroll', action: 'view', scope: 'all' },
{ code: 'payroll:update', name: 'Update Payroll', resource: 'payroll', action: 'update', scope: 'all' },
{ code: 'payroll:delete', name: 'Delete Payroll', resource: 'payroll', action: 'delete', scope: 'all' },
{ code: 'payroll:approve', name: 'Approve Payroll', resource: 'payroll', action: 'approve', scope: 'all' },
{ code: 'payroll:manage', name: 'Manage Payroll', resource: 'payroll', action: 'manage', scope: 'all' },
  // Salary Structure
  { code: 'salary:create', name: 'Create Salary Structure', resource: 'salary', action: 'create', scope: 'all', description: 'Create salary structure' },
  { code: 'salary:view', name: 'View Salary Structure', resource: 'salary', action: 'view', scope: 'all', description: 'View salary structure' },
  { code: 'salary:update', name: 'Update Salary Structure', resource: 'salary', action: 'update', scope: 'all', description: 'Update salary structure' },
  { code: 'salary:delete', name: 'Delete Salary Structure', resource: 'salary', action: 'delete', scope: 'all', description: 'Delete salary structure' },

  // Payslip
  { code: 'payslip:view', name: 'View Payslip', resource: 'payslip', action: 'view', scope: 'all', description: 'View payslip' },
  { code: 'payslip:download', name: 'Download Payslip', resource: 'payslip', action: 'download', scope: 'all', description: 'Download payslip PDF' },
  { code: 'payslip:send', name: 'Send Payslip', resource: 'payslip', action: 'send', scope: 'all', description: 'Send payslip via email' },


];

const roles = [
  { code: 'SUPER_ADMIN', name: 'SUPER_ADMIN', description: 'Full system access', isSystem: true },
  { code: 'ADMIN', name: 'ADMIN', description: 'School administrator', isSystem: true },
  { code: 'TEACHER', name: 'TEACHER', description: 'Teacher role', isSystem: false },
  { code: 'STUDENT', name: 'STUDENT', description: 'Student role', isSystem: false },
  { code: 'PARENT', name: 'PARENT', description: 'Parent role', isSystem: false },
  { code: 'STAFF', name: 'STAFF', description: 'Staff role', isSystem: false },
  // Additional operational roles used by controllers
  { code: 'FINANCE', name: 'FINANCE', description: 'Finance officer — billing, payments, payroll', isSystem: false },
  { code: 'HR', name: 'HR', description: 'HR officer — employees, attendance, leave, payroll', isSystem: false },
  { code: 'HOD', name: 'HOD', description: 'Head of department — budget and department management', isSystem: false },
];



async function main() {
  console.log(' Seeding database...');

  /* -------------------- 1. PERMISSIONS ------------------------------------ */
  // Replace the permission upsert loop with this:
for (const p of permissions) {
  try {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: {
        name: p.name,
        description: p.description ?? null,
        resource: p.resource,
        action: p.action,
        scope: p.scope,
      },
      create: {
        code: p.code,
        name: p.name,
        description: p.description ?? null,
        resource: p.resource,
        action: p.action,
        scope: p.scope,
      },
    });
    console.log(` Permission: ${p.code}`);
  } catch (error:any) {
    if (error.code === 'P2002') {
      console.log(` ⚠️ Skipped duplicate: ${p.code}`);
    } else {
      throw error;
    }
  }
}

  for (const r of roles) {
  await prisma.role.upsert({
    where: { code: r.code },
    update: {
      name: r.name,
      description: r.description ?? null,
      isSystem: r.isSystem,
      // REMOVE: permissions: r.permissions, // This doesn't exist in your seed data anyway
    },
    create: {
      code: r.code,
      name: r.name,
      description: r.description ?? null,
      isSystem: r.isSystem,
      // REMOVE: permissions: r.permissions, // This doesn't exist in your seed data
    },
  });
  console.log(` Role: ${r.code}`);
}

  /* -------------------- 3. ROLE ↔ PERMISSIONS ----------------------------- */
  const allPermissions = await prisma.permission.findMany();
  const allRoles = await prisma.role.findMany();

  const roleByCode = (code: string) => {
    const role = allRoles.find(r => r.code === code);
    if (!role) throw new Error(`Role ${code} not found`);
    return role;
  };

  // SUPER_ADMIN → all permissions
  const superAdmin = roleByCode('SUPER_ADMIN');
  for (const p of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdmin.id,
          permissionId: p.id,
        },
      },
      update: {},
      create: {
        roleId: superAdmin.id,
        permissionId: p.id,
      },
    });
  }

  /// ADMIN gets all payroll permissions
const admin = roleByCode('ADMIN');
const adminPayrollPerms = [
  'payroll:create',
  'payroll:view',
  'payroll:update',
  'payroll:delete',
  'payroll:approve',
  'payroll:process',
  'payroll:disburse',
  'salary:create',
  'salary:view',
  'salary:update',
  'salary:delete',
  'payslip:view',
  'payslip:download',
  'payslip:send',
];

for (const code of adminPayrollPerms) {
  const p = allPermissions.find(x => x.code === code);
  if (!p) continue;
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: admin.id,
        permissionId: p.id,
      },
    },
    update: {},
    create: {
      roleId: admin.id,
      permissionId: p.id,
    },
  });
}
  // TEACHER → limited
const teacher = roleByCode('TEACHER');
const teacherPerms = [
  'STUDENT_READ_CLASS',
  'ATTENDANCE_CREATE',
  'ATTENDANCE_READ',
  'ATTENDANCE_UPDATE',
  'EXAM_READ',
  'GRADE_CREATE',
  'GRADE_READ',
  'GRADE_UPDATE',
  'attendance:mark',
  'attendance:view',
  'leave:apply',
  'leave:view',
  'leave:cancel',
  // PAYROLL FOR TEACHERS (view only)
  'payroll:view',
  'payslip:view',
  'payslip:download',
  'salary:view',
];
 

for (const code of teacherPerms) {
    const p = allPermissions.find(x => x.code === code);
    if (!p) continue;
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: teacher.id,
          permissionId: p.id,
        },
      },
      update: {},
      create: {
        roleId: teacher.id,
        permissionId: p.id,
      },
    });
  }

  /* -------------------- 4. DEFAULT USERS ---------------------------------- */
  const users = [
    { username: 'superadmin', email: 'superadmin@school.com', password: 'Admin123!', role: 'SUPER_ADMIN' },
    { username: 'admin',      email: 'admin@school.com',      password: 'Admin123!', role: 'ADMIN' },
    { username: 'teacher',    email: 'teacher@school.com',    password: 'Teacher123!', role: 'TEACHER' },
  ];

  for (const u of users) {
    const role = roleByCode(u.role);
    const passwordHash = await hashPassword(u.password);

    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        username: u.username,
        passwordHash,
        roleId: role.id,
        isActive: true,
      },
      create: {
        username: u.username,
        email: u.email,
        passwordHash,
        roleId: role.id,
        isActive: true,
      },
    });

    console.log(` User: ${u.email}`);
  }

  /* -------------------- 5. SCHOOL CONFIG ---------------------------------- */
  const now = new Date();

  await prisma.schoolConfiguration.upsert({
    where: { id: 1 },
    update: {
      schoolName: 'Demo School ERP',
      academicYear: `${now.getFullYear()}-${now.getFullYear() + 1}`,
      startDate: new Date(now.getFullYear(), 8, 1),
      endDate: new Date(now.getFullYear() + 1, 6, 31),
      address: 'Addis Ababa',
      currency: 'ETB',
      isActive: true,
    },
    create: {
      schoolName: 'Demo School ERP',
      academicYear: `${now.getFullYear()}-${now.getFullYear() + 1}`,
      startDate: new Date(now.getFullYear(), 8, 1),
      endDate: new Date(now.getFullYear() + 1, 6, 31),
      address: 'Addis Ababa',
      currency: 'ETB',
      isActive: true,
    },
  });

  console.log(' Seeding completed successfully.');
}

/* -------------------------------------------------------------------------- */
main()
  .catch((e) => {
    console.error(' Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
