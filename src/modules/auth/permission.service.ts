// src/modules/auth/services/permission.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Permission, Role, User } from '@prisma/client';

export interface PermissionCheck {
  resource: string;
  action: string;
  scope?: 'own' | 'department' | 'class' | 'all';
  entityId?: number;
  context?: Record<string, any>;
}

// Create a type for permission with the extended fields
type ExtendedPermission = Permission & {
  resource: string;
  action: string;
  scope: string;
};

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(private prisma: PrismaService) {}

  async checkPermission(
    userId: number,
    check: PermissionCheck,
  ): Promise<boolean> {
    try {
      // Get user with permissions
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: {
            include: {
              RolePermission: {
                include: { permission: true },
              },
            },
          },
          UserPermission: {
            include: { permission: true },
          },
        },
      });

      if (!user) return false;

      // Collect all permissions
      const allPermissions = await this.getUserPermissions(user.id);

      // Check for exact permission - type assertion needed
      const hasPermission = allPermissions.some(permission => {
        const extendedPerm = permission as ExtendedPermission;
        return (
          extendedPerm.resource === check.resource &&
          extendedPerm.action === check.action &&
          (!check.scope || extendedPerm.scope === check.scope)
        );
      });

      if (!hasPermission) return false;

      // If scope-specific, check conditions
      if (check.scope && check.scope !== 'all') {
        return await this.checkScopePermission(userId, check);
      }

      return true;
    } catch (error) {
      this.logger.error(`Permission check failed: ${error.message}`);
      return false;
    }
  }

  private async getUserPermissions(userId: number): Promise<Permission[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            RolePermission: {
              include: { permission: true },
            },
          },
        },
        UserPermission: {
          include: { permission: true },
        },
      },
    });

    if (!user) return [];

    const permissions = new Map<string, Permission>();

    // Collect role permissions
    user.role.RolePermission.forEach((rp: any) => {
      const key = `${(rp.permission as any).resource}:${(rp.permission as any).action}:${(rp.permission as any).scope}`;
      permissions.set(key, rp.permission);
    });

    // Add user-specific permissions (override role permissions)
    user.UserPermission.forEach(up => {
      const key = `${(up.permission as any).resource}:${(up.permission as any).action}:${(up.permission as any).scope}`;
      permissions.set(key, up.permission);
    });

    return Array.from(permissions.values());
  }

  private async checkScopePermission(
    userId: number,
    check: PermissionCheck,
  ): Promise<boolean> {
    switch (check.scope) {
      case 'own':
        return await this.checkOwnership(userId, check);
      case 'department':
        return await this.checkDepartmentAccess(userId, check);
      case 'class':
        return await this.checkClassAccess(userId, check);
      default:
        return false;
    }
  }

  private async checkOwnership(
    userId: number,
    check: PermissionCheck,
  ): Promise<boolean> {
    if (!check.entityId) return false;

    // Check if user owns the entity
    const entity = await this.getEntity(check.resource, check.entityId);
    return entity && entity.createdBy === userId;
  }

  private async checkDepartmentAccess(
    userId: number,
    check: PermissionCheck,
  ): Promise<boolean> {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher || !teacher.departmentId) return false;

    if (check.entityId) {
      const entity = await this.getEntity(check.resource, check.entityId);
      return entity && entity.departmentId === teacher.departmentId;
    }

    return true;
  }

  private async checkClassAccess(
    userId: number,
    check: PermissionCheck,
  ): Promise<boolean> {
    // Get teacher assignments
    const assignments = await this.prisma.teacherAssignment.findMany({
      where: { teacherId: userId },
    });

    if (assignments.length === 0) return false;

    const assignedClassIds = assignments.map(ta => ta.classId);

    if (check.entityId) {
      const entity = await this.getEntity(check.resource, check.entityId);
      return entity && assignedClassIds.includes(entity.classId);
    }

    return true;
  }

  private async getEntity(resource: string, entityId: number): Promise<any> {
    switch (resource) {
      case 'student':
        return this.prisma.student.findUnique({
          where: { id: entityId },
          select: { id: true, createdBy: true, classId: true },
        });
      case 'attendance':
        return this.prisma.attendance.findUnique({
          where: { id: entityId },
          select: { id: true, classId: true },

          // select: { id: true, recordedBy: true, classId: true },
        });
      case 'exam':
        return this.prisma.exam.findUnique({
          where: { id: entityId },
          select: { id: true, createdBy: true, classId: true },
        });
      default:
        return null;
    }
  }

  async getUserRoleContext(userId: number): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        teacher: {
          include: {
            department: true,
          },
        },
        staff: {
          include: { department: true },
        },
      },
    });

    if (!user) return null;

    // Get teacher assignments separately
    const assignments = await this.prisma.teacherAssignment.findMany({
      where: { teacherId: userId },
      select: { classId: true },
    });

    return {
      userId: user.id,
      role: user.role,
      isTeacher: !!user.teacher,
      isStaff: !!user.staff,
      departmentId: user.teacher?.departmentId || user.staff?.departmentId,
      assignedClasses: assignments.map(a => a.classId) || [],
    };
  }
}