import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from 
'@nestjs/common'; 
import { Reflector } from '@nestjs/core'; 
import { ROLES_KEY } from '../decorators/roles.decorator'; 
import { UserRole } from '../enums/user-role.enums'; 
 
/** 
 * Role-Based Access Control Guard 
 * Checks if user has required role 
 */ 
@Injectable() 
export class RolesGuard implements CanActivate { 
  constructor(private reflector: Reflector) {} 
 
  canActivate(context: ExecutionContext): boolean { 
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [ 
      context.getHandler(), 
      context.getClass(), 
    ]); 
 
    if (!requiredRoles || requiredRoles.length === 0) { 
      return true; 
    } 
 
    const { user } = context.switchToHttp().getRequest(); 
 
    if (!user) { 
      throw new ForbiddenException('User not authenticated'); 
    } 
 
    const hasRole = requiredRoles.includes(user.role); 
 
    if (!hasRole) { 
      throw new ForbiddenException('Insufficient permissions'); 
    } 
 
    return true; 
  } 
} 
