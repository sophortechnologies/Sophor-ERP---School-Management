import { SetMetadata } from '@nestjs/common'; 
export const PERMISSIONS_KEY = 'permissions'; 
/** 
* Decorator to specify required permissions 
* Usage: @Permissions('student:create', 'student:read') 
*/ 
export const Permissions = (...permissions: string[]) => 
SetMetadata(PERMISSIONS_KEY, permissions); 
