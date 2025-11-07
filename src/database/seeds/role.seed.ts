import { DataSource } from 'typeorm'; 
import { Role } from '../../modules/auth/entities/role.entity'; 
import { PERMISSIONS } from '../../common/constants/permissions.constant'; 
 
/** 
 * Role Seeder 
 * Creates default roles with permissions 
 */ 
export async function seedRoles(dataSource: DataSource): Promise<void> { 
  const roleRepository = dataSource.getRepository(Role); 
 
  const roles = [ 
    { 
      name: 'SUPER_ADMIN', 
      displayName: 'Super Administrator', 
      description: 'Full system access with all permissions', 
      permissions: Object.values(PERMISSIONS), 
      isActive: true, 
    }, 
    { 
      name: 'ADMIN', 
      displayName: 'Administrator', 
      description: 'School administrator with management permissions', 
      permissions: [ 
        PERMISSIONS.STUDENT_CREATE, 
        PERMISSIONS.STUDENT_READ, 
        PERMISSIONS.STUDENT_UPDATE, 
        PERMISSIONS.ATTENDANCE_MARK, 
        PERMISSIONS.ATTENDANCE_VIEW, 
        PERMISSIONS.ATTENDANCE_EDIT, 
        PERMISSIONS.EXAM_CREATE, 
        PERMISSIONS.EXAM_VIEW, 
        PERMISSIONS.FEE_MANAGE, 
        PERMISSIONS.FINANCE_VIEW, 
        PERMISSIONS.EMPLOYEE_MANAGE, 
        PERMISSIONS.REPORT_GENERATE, 
        PERMISSIONS.REPORT_VIEW, 
      ], 
      isActive: true, 
    }, 
    { 
      name: 'TEACHER', 
      displayName: 'Teacher', 
      description: 'Teaching staff with limited permissions', 
      permissions: [ 
        PERMISSIONS.STUDENT_READ, 
        PERMISSIONS.ATTENDANCE_MARK, 
        PERMISSIONS.ATTENDANCE_VIEW, 
        PERMISSIONS.EXAM_GRADE, 
        PERMISSIONS.EXAM_VIEW, 
        PERMISSIONS.REPORT_VIEW, 
      ], 
      isActive: true, 
    }, 
    { 
      name: 'STUDENT', 
      displayName: 'Student', 
      description: 'Student with view-only permissions', 
      permissions: [ 
        PERMISSIONS.STUDENT_READ, 
        PERMISSIONS.ATTENDANCE_VIEW, 
        PERMISSIONS.EXAM_VIEW, 
      ], 
      isActive: true, 
    }, 
    { 
      name: 'PARENT', 
      displayName: 'Parent/Guardian', 
      description: 'Parent with child information access', 
      permissions: [ 
        PERMISSIONS.STUDENT_READ, 
        PERMISSIONS.ATTENDANCE_VIEW, 
        PERMISSIONS.EXAM_VIEW, 
        PERMISSIONS.FINANCE_VIEW, 
      ], 
      isActive: true, 
    }, 
    { 
      name: 'ACCOUNTANT', 
      displayName: 'Accountant', 
      description: 'Finance staff with payment permissions', 
      permissions: [ 
        PERMISSIONS.STUDENT_READ, 
        PERMISSIONS.FEE_MANAGE, 
        PERMISSIONS.PAYMENT_COLLECT, 
        PERMISSIONS.FINANCE_VIEW, 
        PERMISSIONS.REPORT_VIEW, 
      ], 
      isActive: true, 
    }, 
    { 
      name: 'LIBRARIAN', 
      displayName: 'Librarian', 
      description: 'Library staff with book management permissions', 
      permissions: [ 
        PERMISSIONS.LIBRARY_MANAGE, 
        PERMISSIONS.BOOK_ISSUE, 
        PERMISSIONS.REPORT_VIEW, 
      ], 
      isActive: true, 
    }, 
    { 
      name: 'HR_MANAGER', 
      displayName: 'HR Manager', 
      description: 'HR staff with employee and payroll permissions', 
      permissions: [ 
        PERMISSIONS.EMPLOYEE_MANAGE, 
        PERMISSIONS.PAYROLL_MANAGE, 
        PERMISSIONS.ATTENDANCE_VIEW, 
        PERMISSIONS.REPORT_VIEW, 
      ], 
      isActive: true, 
    }, 
  ]; 
 
  for (const roleData of roles) { 
    const existingRole = await roleRepository.findOne({ 
      where: { name: roleData.name }, 
    }); 
 
    if (!existingRole) { 
      const role = roleRepository.create(roleData); 
      await roleRepository.save(role); 
      console.log(`   Role created: ${roleData.name}`); 
    } else { 
      console.log(`    Role already exists: ${roleData.name}`); 
    } 
  } 
} 