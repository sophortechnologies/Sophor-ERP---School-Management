
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log(' Starting database seeding...');

  // Clear existing data (optional - for development)
  if (process.env.NODE_ENV === 'development') {
    console.log(' Clearing existing data...');
    await prisma.auditLog.deleteMany();
    await prisma.userSession.deleteMany();
    await prisma.modulePermission.deleteMany();
    await prisma.user.deleteMany();
    await prisma.module.deleteMany();
    await prisma.role.deleteMany();
  }

  // Create system roles with explicit IDs
  console.log('👥 Creating system roles...');
  
  const superAdminRole = await prisma.role.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      permissions: {
        '*': ['create', 'read', 'update', 'delete', 'manage', 'export'],
      },
      isSystem: true,
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: 'Admin',
      description: 'Administrative access for school management',
      permissions: {
        users: ['create', 'read', 'update', 'delete'],
        students: ['create', 'read', 'update', 'delete'],
        teachers: ['create', 'read', 'update', 'delete'],
        courses: ['create', 'read', 'update', 'delete'],
        attendance: ['create', 'read', 'update', 'delete'],
        grades: ['create', 'read', 'update', 'delete'],
        fees: ['create', 'read', 'update', 'delete'],
        library: ['create', 'read', 'update', 'delete'],
        inventory: ['create', 'read', 'update', 'delete'],
        reports: ['create', 'read', 'update', 'delete', 'export'],
      },
      isSystem: true,
    },
  });

  const teacherRole = await prisma.role.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      name: 'Teacher',
      description: 'Teacher access for academic activities',
      permissions: {
        students: ['read'],
        attendance: ['create', 'read', 'update'],
        grades: ['create', 'read', 'update'],
        library: ['read'],
        timetable: ['read', 'update'],
        communication: ['create', 'read'],
      },
      isSystem: true,
    },
  });

  const studentRole = await prisma.role.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      name: 'Student',
      description: 'Student access for personal information',
      permissions: {
        profile: ['read', 'update'],
        grades: ['read'],
        attendance: ['read'],
        timetable: ['read'],
        fees: ['read'],
        library: ['read'],
      },
      isSystem: true,
    },
  });

  const parentRole = await prisma.role.upsert({
    where: { id: 5 },
    update: {},
    create: {
      id: 5,
      name: 'Parent',
      description: 'Parent access for student monitoring',
      permissions: {
        student_profile: ['read'],
        grades: ['read'],
        attendance: ['read'],
        fees: ['read'],
        communication: ['create', 'read'],
      },
      isSystem: true,
    },
  });

  const accountantRole = await prisma.role.upsert({
    where: { id: 6 },
    update: {},
    create: {
      id: 6,
      name: 'Accountant',
      description: 'Financial management access',
      permissions: {
        fees: ['create', 'read', 'update', 'delete', 'export'],
        payroll: ['create', 'read', 'update', 'delete'],
        reports: ['read', 'export'],
      },
      isSystem: true,
    },
  });

  const librarianRole = await prisma.role.upsert({
    where: { id: 7 },
    update: {},
    create: {
      id: 7,
      name: 'Librarian',
      description: 'Library management access',
      permissions: {
        library: ['create', 'read', 'update', 'delete'],
        inventory: ['read', 'update'],
      },
      isSystem: true,
    },
  });

  const allRoles = [superAdminRole, adminRole, teacherRole, studentRole, parentRole, accountantRole, librarianRole];

  console.log('Roles created');

  // Create system modules
  console.log(' Creating system modules...');
  
  const dashboardModule = await prisma.module.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Dashboard',
      description: 'System dashboard and overview',
      path: '/dashboard',
      icon: 'mdi-view-dashboard',
      order: 1,
      isSystem: true,
    },
  });

  const userModule = await prisma.module.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: 'User Management',
      description: 'User authentication and management system',
      path: '/users',
      icon: 'mdi-account-cog',
      order: 2,
      isSystem: true,
    },
  });

  const studentModule = await prisma.module.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      name: 'Student Admission',
      description: 'Student admission and registration management',
      path: '/students/admission',
      icon: 'mdi-account-school',
      order: 3,
      isSystem: true,
    },
  });

  const attendanceModule = await prisma.module.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      name: 'Attendance Management',
      description: 'Student and staff attendance tracking system',
      path: '/attendance',
      icon: 'mdi-calendar-check',
      order: 4,
      isSystem: true,
    },
  });

  const gradeModule = await prisma.module.upsert({
    where: { id: 5 },
    update: {},
    create: {
      id: 5,
      name: 'Grade Management',
      description: 'Examination and grading management system',
      path: '/grades',
      icon: 'mdi-certificate',
      order: 5,
      isSystem: true,
    },
  });

  const hrModule = await prisma.module.upsert({
    where: { id: 6 },
    update: {},
    create: {
      id: 6,
      name: 'HR & Payroll',
      description: 'Human resources and payroll management',
      path: '/hr-payroll',
      icon: 'mdi-account-tie',
      order: 6,
      isSystem: true,
    },
  });

  const feeModule = await prisma.module.upsert({
    where: { id: 7 },
    update: {},
    create: {
      id: 7,
      name: 'Fee Management',
      description: 'Fee collection and accounting system',
      path: '/fees',
      icon: 'mdi-cash-multiple',
      order: 7,
      isSystem: true,
    },
  });

  const libraryModule = await prisma.module.upsert({
    where: { id: 8 },
    update: {},
    create: {
      id: 8,
      name: 'Library Management',
      description: 'Library books and resources management',
      path: '/library',
      icon: 'mdi-library',
      order: 8,
      isSystem: true,
    },
  });

  const timetableModule = await prisma.module.upsert({
    where: { id: 9 },
    update: {},
    create: {
      id: 9,
      name: 'Timetable Management',
      description: 'Class and teacher scheduling system',
      path: '/timetable',
      icon: 'mdi-timetable',
      order: 9,
      isSystem: true,
    },
  });

  const communicationModule = await prisma.module.upsert({
    where: { id: 10 },
    update: {},
    create: {
      id: 10,
      name: 'Communication Portal',
      description: 'Messaging and notification system',
      path: '/communication',
      icon: 'mdi-message-text',
      order: 10,
      isSystem: true,
    },
  });

  const inventoryModule = await prisma.module.upsert({
    where: { id: 11 },
    update: {},
    create: {
      id: 11,
      name: 'Inventory Management',
      description: 'School assets and inventory tracking',
      path: '/inventory',
      icon: 'mdi-warehouse',
      order: 11,
      isSystem: true,
    },
  });

  const reportsModule = await prisma.module.upsert({
    where: { id: 12 },
    update: {},
    create: {
      id: 12,
      name: 'Reports & Analytics',
      description: 'Data analysis and reporting dashboard',
      path: '/reports',
      icon: 'mdi-chart-bar',
      order: 12,
      isSystem: true,
    },
  });

  const allModules = [
    dashboardModule,
    userModule,
    studentModule,
    attendanceModule,
    gradeModule,
    hrModule,
    feeModule,
    libraryModule,
    timetableModule,
    communicationModule,
    inventoryModule,
    reportsModule,
  ];

  console.log('Modules created');

  // Create module permissions for each role
  console.log(' Creating module permissions...');
  for (const role of allRoles) {
    for (const module of allModules) {
      let permissions = {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
      };

      // Set permissions based on role ID
      if (role.id === 1) {
        // Super Admin - full access
        permissions = { canView: true, canCreate: true, canEdit: true, canDelete: true };
      } else if (role.id === 2) {
        // Admin - full access except user management delete
        permissions = { canView: true, canCreate: true, canEdit: true, canDelete: true };
      } else if (role.id === 3) {
        // Teacher - specific modules
        if ([1, 4, 5, 9, 10].includes(module.id)) {
          permissions = { canView: true, canCreate: true, canEdit: true, canDelete: false };
        }
      } else if (role.id === 4) {
        // Student - view only
        if ([1, 4, 5, 7, 8, 9].includes(module.id)) {
          permissions = { canView: true, canCreate: false, canEdit: false, canDelete: false };
        }
      } else if (role.id === 5) {
        // Parent - view only
        if ([1, 4, 5, 7, 10].includes(module.id)) {
          permissions = { canView: true, canCreate: false, canEdit: false, canDelete: false };
        }
      } else if (role.id === 6) {
        // Accountant
        if ([1, 6, 7, 12].includes(module.id)) {
          permissions = { canView: true, canCreate: true, canEdit: true, canDelete: false };
        }
      } else if (role.id === 7) {
        // Librarian
        if ([1, 8, 11].includes(module.id)) {
          permissions = { canView: true, canCreate: true, canEdit: true, canDelete: true };
        }
      }

      await prisma.modulePermission.upsert({
        where: {
          moduleId_roleId: {
            moduleId: module.id,
            roleId: role.id,
          },
        },
        update: permissions,
        create: {
          moduleId: module.id,
          roleId: role.id,
          ...permissions,
        },
      });
    }
  }

  console.log(' Module permissions created');

  // Create super admin user
  console.log(' Creating super admin user...');
  const superAdmin = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      email: 'superadmin@school.edu',
      passwordHash: await bcrypt.hash('Admin123!', 12),
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+1234567890',
      roleId: 1,
    },
  });

  // Create admin user
  console.log(' Creating admin user...');
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@school.edu',
      passwordHash: await bcrypt.hash('Admin123!', 12),
      firstName: 'School',
      lastName: 'Administrator',
      phone: '+1234567891',
      roleId: 2,
    },
  });

  // Create sample teacher
  console.log(' Creating sample teacher...');
  const teacherUser = await prisma.user.upsert({
    where: { username: 'teacher1' },
    update: {},
    create: {
      username: 'teacher1',
      email: 'teacher1@school.edu',
      passwordHash: await bcrypt.hash('Teacher123!', 12),
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1234567892',
      roleId: 3,
    },
  });

  console.log('\n Database seeded successfully!');
  console.log(' Statistics:');
  console.log(`    Roles: ${allRoles.length} system roles created`);
  console.log(`    Modules: ${allModules.length} system modules created`);
  console.log(`    Permissions: ${allRoles.length * allModules.length} module permissions configured`);
  console.log('\n Default Login Credentials:');
  console.log('   Super Admin: superadmin / Admin123!');
  console.log('   Admin: admin / Admin123!');
  console.log('   Teacher: teacher1 / Teacher123!');
  console.log('\n Available Role IDs for Registration:');
  console.log('   1 = Super Admin');
  console.log('   2 = Admin');
  console.log('   3 = Teacher');
  console.log('   4 = Student');
  console.log('   5 = Parent');
  console.log('   6 = Accountant');
  console.log('   7 = Librarian');
  console.log('\n Your ERP system is ready!');
}

main()
  .catch((e) => {
    console.error(' Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });