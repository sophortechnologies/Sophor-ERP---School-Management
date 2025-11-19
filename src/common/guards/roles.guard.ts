// import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { ROLES_KEY, PERMISSIONS_KEY, MODULES_KEY } from '../decorators/roles.decorator';

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
//       context.getHandler(),
//       context.getClass(),
//     ]);

//     const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
//       context.getHandler(),
//       context.getClass(),
//     ]);

//     const requiredModules = this.reflector.getAllAndOverride<string[]>(MODULES_KEY, [
//       context.getHandler(),
//       context.getClass(),
//     ]);

//     // If no restrictions, allow access
//     if (!requiredRoles && !requiredPermissions && !requiredModules) {
//       return true;
//     }

//     const { user } = context.switchToHttp().getRequest();

//     if (!user) {
//       throw new ForbiddenException('Authentication required');
//     }

//     // Check roles
//     if (requiredRoles && requiredRoles.length > 0) {
//       if (!requiredRoles.includes(user.role.name)) {
//         throw new ForbiddenException(
//           `Required roles: ${requiredRoles.join(', ')}. Your role: ${user.role.name}`,
//         );
//       }
//     }

//     // Super admin has all permissions
//     if (user.role.name === 'super_admin') {
//       return true;
//     }

//     // Check permissions
//     if (requiredPermissions && requiredPermissions.length > 0) {
//       const userPermissions = user.role.permissions || {};
      
//       const hasPermission = requiredPermissions.every(permission => {
//         const [resource, action] = permission.split(':');
        
//         // Check wildcard permission
//         if (userPermissions['*']?.includes(action)) {
//           return true;
//         }

//         return userPermissions[resource]?.includes(action);
//       });

//       if (!hasPermission) {
//         throw new ForbiddenException(
//           `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
//         );
//       }
//     }

//     // Check module access
//     if (requiredModules && requiredModules.length > 0) {
//       const userModules = user.accessibleModules || [];
//       const userModuleNames = userModules.map(module => module.name);
      
//       const hasModuleAccess = requiredModules.every(module => 
//         userModuleNames.includes(module)
//       );

//       if (!hasModuleAccess) {
//         throw new ForbiddenException(
//           `Module access required: ${requiredModules.join(', ')}`,
//         );
//       }
//     }

//     return true;
//   }
// }

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasRole = requiredRoles.some(role => user.role === role);
    
    if (!hasRole) {
      throw new ForbiddenException(`Required roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}