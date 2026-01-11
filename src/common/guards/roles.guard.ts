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

    console.log('User role from JWT:', user.role);
    console.log('Required roles:', requiredRoles);

    // ✔ Extract role code properly
    const userRole = user.role?.code || user.role || '';
    const normalizedUserRole =
      userRole.toString().toUpperCase().replace(/\s+/g, '_');

    const hasRole = requiredRoles.some((role) => {
      const requiredRole = role.toUpperCase().replace(/\s+/g, '_');
      return normalizedUserRole === requiredRole;
    });

    if (!hasRole) {
      throw new ForbiddenException(
        `User with role "${userRole}" does not have access to this resource. Required roles: ${requiredRoles.join(
          ', ',
        )}`,
      );
    }

    return true;
  }
}
