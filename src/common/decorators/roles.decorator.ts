import { SetMetadata } from '@nestjs/common'; 
import { UserRole } from '../enums/user-role.enums'; 
export const ROLES_KEY = 'roles'; 
/** 
* Decorator to specify required roles for endpoint 
* Usage: @Roles(UserRole.ADMIN, UserRole.TEACHER) 
*/ 
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles); 
