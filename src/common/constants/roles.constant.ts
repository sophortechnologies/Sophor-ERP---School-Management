/** 
 * User Roles Definition 
 * Used for role-based access control (RBAC) 
 */ 
export const USER_ROLES = { 
  SUPER_ADMIN: 'SUPER_ADMIN', 
  ADMIN: 'ADMIN', 
  TEACHER: 'TEACHER', 
  STUDENT: 'STUDENT', 
  PARENT: 'PARENT', 
  ACCOUNTANT: 'ACCOUNTANT', 
  LIBRARIAN: 'LIBRARIAN', 
  HR_MANAGER: 'HR_MANAGER', 
} as const; 
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]; 
/** 
* Permission Constants 
* Granular permissions for fine-grained access control 
*/ 

