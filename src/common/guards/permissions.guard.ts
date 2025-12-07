import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    // If no permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Super Admin has all permissions
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Check if user has the required role-based permissions
    const hasPermission = this.checkUserPermissions(user, requiredPermissions);
    
    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  private checkUserPermissions(user: any, requiredPermissions: string[]): boolean {
    // Simple role-based permission check
    const userRole = user.role?.toUpperCase();
    
    // Define role permissions
    const rolePermissions = {
      'SUPER_ADMIN': ['*'], // All permissions
      'ADMIN': [
        'student_admission.create',
        'student_admission.view', 
        'student_admission.edit',
        'student_admission.delete',
        'users.manage',
        'attendance.manage',
        'grading.manage'
      ],
      'TEACHER': [
        'student_admission.create',
        'student_admission.view',
        'attendance.manage',
        'grading.manage'
      ],
      'STUDENT': [
        'student_admission.view_own',
        'attendance.view_own',
        'grading.view_own'
      ],
      'PARENT': [
        'student_admission.view_own',
        'attendance.view_own', 
        'grading.view_own'
      ]
    };

    // Get user's permissions based on role
    const userPerms = rolePermissions[userRole] || [];
    
    // Check if user has all required permissions
    return requiredPermissions.every(permission => 
      userPerms.includes('*') || userPerms.includes(permission)
    );
  }
}