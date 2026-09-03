// src/common/guards/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionService } from '../../modules/auth/permission.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // FIX: Use user.id instead of user.sub for consistency
    const userId = user.id || user.sub;
    
    if (!userId) {
      throw new ForbiddenException('Invalid user session - user ID not found');
    }

    // Get user context for scope checks
    const userContext = await this.permissionService.getUserRoleContext(userId);
    
    // Check each required permission
    for (const permString of requiredPermissions) {
      const parts = permString.split(':');
      const resource = parts[0];
      const action = parts[1];
      const scope = parts[2] || 'all';
      
      const hasPermission = await this.permissionService.checkPermission(
        userId,
        {
          resource,
          action,
          scope: scope as any,
          entityId: request.params.id ? parseInt(request.params.id) : undefined,
          context: {
            ...userContext,
            body: request.body,
            query: request.query,
            params: request.params,
          },
        },
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `Missing permission: ${resource}:${action}:${scope}`,
        );
      }
    }

    return true;
  }
}