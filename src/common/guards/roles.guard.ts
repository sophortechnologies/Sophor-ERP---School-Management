// src/common/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // FIX: Get role consistently - handles both string and object
    let userRole: string;
    
    if (typeof user.role === 'string') {
      userRole = user.role;
    } else if (user.role?.code) {
      userRole = user.role.code;
    } else if (user.role?.name) {
      userRole = user.role.name;
    } else {
      userRole = '';
    }

    const normalizedUserRole = userRole.toString().toUpperCase().replace(/\s+/g, '_');
    const normalizedRequiredRoles = requiredRoles.map(role =>
      role.toUpperCase().replace(/\s+/g, '_')
    );

    console.log('RolesGuard Debug:', {
      userRole,
      normalizedUserRole,
      requiredRoles,
      normalizedRequiredRoles,
    });

    const hasRole = normalizedRequiredRoles.includes(normalizedUserRole);

    if (!hasRole) {
      throw new ForbiddenException(
        `User with role "${userRole}" does not have access. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}