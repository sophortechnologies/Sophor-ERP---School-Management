// src/modules/auth/permission.service.ts
import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../database/prisma.service';
import { Permission } from '@prisma/client';

export interface PermissionCheck {
  resource: string;
  action: string;
  scope?: 'own' | 'department' | 'class' | 'all';
  entityId?: number;
  context?: Record<string, any>;
}

type ExtendedPermission = Permission & {
  resource: string;
  action: string;
  scope: string;
};

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * ============================================================
   * CORE PERMISSION CHECKING
   * ============================================================
   */

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

      // Check for exact permission
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
    } catch (error: any) {
      this.logger.error(`Permission check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * ============================================================
   * SIMPLE PERMISSION CHECK (by permission code)
   * ============================================================
   */

  async hasPermission(
    userId: number,
    permissionCode: string,
  ): Promise<boolean> {
    const [resource, action] = permissionCode.split(':');
    
    return this.checkPermission(userId, {
      resource,
      action,
      scope: 'all',
    });
  }

  /**
   * ============================================================
   * BULK PERMISSION CHECKS
   * ============================================================
   */

  async hasAllPermissions(
    userId: number,
    permissionCodes: string[],
  ): Promise<boolean> {
    for (const code of permissionCodes) {
      const has = await this.hasPermission(userId, code);
      if (!has) return false;
    }
    return true;
  }

  async hasAnyPermission(
    userId: number,
    permissionCodes: string[],
  ): Promise<boolean> {
    for (const code of permissionCodes) {
      const has = await this.hasPermission(userId, code);
      if (has) return true;
    }
    return false;
  }

  /**
   * ============================================================
   * GET USER PERMISSIONS (WITH CACHING)
   * ============================================================
   */

  private async getUserPermissions(userId: number): Promise<Permission[]> {
    // Check cache first
    const cacheKey = `user:${userId}:permissions`;
    const cached = await this.cacheManager.get<Permission[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from DB
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

    const result = Array.from(permissions.values());

    // Store in cache for 5 minutes
    await this.cacheManager.set(cacheKey, result, 300000);

    return result;
  }

  /**
   * ============================================================
   * CLEAR USER PERMISSION CACHE
   * ============================================================
   */

  async clearUserPermissionCache(userId: number): Promise<void> {
    const cacheKey = `user:${userId}:permissions`;
    await this.cacheManager.del(cacheKey);
    this.logger.log(`Cleared permission cache for user ${userId}`);
  }

  /**
   * ============================================================
   * SCOPE PERMISSION CHECKING
   * ============================================================
   */

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

  /**
   * ============================================================
   * FIXED: CLASS ACCESS CHECK
   * ============================================================
   */

  private async checkClassAccess(
    userId: number,
    check: PermissionCheck,
  ): Promise<boolean> {
    // First get teacher record from userId
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!teacher) return false;

    // Get teacher assignments using teacher.id (FIXED)
    const assignments = await this.prisma.teacherAssignment.findMany({
      where: { teacherId: teacher.id },
      select: { classId: true },
    });

    if (assignments.length === 0) return false;

    const assignedClassIds = assignments.map(ta => ta.classId);

    if (check.entityId) {
      const entity = await this.getEntity(check.resource, check.entityId);
      return entity && assignedClassIds.includes(entity.classId);
    }

    return true;
  }

  /**
   * ============================================================
   * ENTITY LOOKUP
   * ============================================================
   */

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
          select: { id: true, classId: true, userId: true },
        });
      case 'exam':
        return this.prisma.exam.findUnique({
          where: { id: entityId },
          select: { id: true, createdBy: true, classId: true },
        });
      case 'section':
        return this.prisma.section.findUnique({
          where: { id: entityId },
          select: { id: true, classId: true },
        });
      case 'class':
  return this.prisma.class.findUnique({
    where: { id: entityId },
    select: { id: true },
  });
      default:
        return null;
    }
  }

  /**
   * ============================================================
   * USER ROLE CONTEXT
   * ============================================================
   */

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
        student: {
          select: { id: true },
        },
      },
    });

    if (!user) return null;

    // Get teacher assignments separately
    let assignedClasses: number[] = [];
    
    if (user.teacher) {
      const assignments = await this.prisma.teacherAssignment.findMany({
        where: { teacherId: user.teacher.id },
        select: { classId: true },
      });
      assignedClasses = assignments.map(a => a.classId);
    }

    return {
      userId: user.id,
      role: user.role,
      isTeacher: !!user.teacher,
      isStaff: !!user.staff,
      // studentId is populated when this user is a STUDENT — used by PermissionFilterInterceptor
      studentId: user.student?.id ?? null,
      departmentId: user.teacher?.departmentId || user.staff?.departmentId,
      assignedClasses,
    };
  }

  /**
   * ============================================================
   * ASSIGN/REMOVE PERMISSIONS TO USER
   * ============================================================
   */

  async assignPermissionToUser(
    userId: number,
    permissionCode: string,
    conditions?: any,
  ) {
    const permission = await this.prisma.permission.findUnique({
      where: { code: permissionCode },
    });

    if (!permission) {
      throw new Error(`Permission ${permissionCode} not found`);
    }

    const result = await this.prisma.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId,
          permissionId: permission.id,
        },
      },
      update: { conditions: conditions || {} },
      create: {
        userId,
        permissionId: permission.id,
        conditions: conditions || {},
      },
    });

    // Clear cache for this user
    await this.clearUserPermissionCache(userId);

    return result;
  }

  async removePermissionFromUser(userId: number, permissionCode: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { code: permissionCode },
    });

    if (!permission) return;

    const result = await this.prisma.userPermission.delete({
      where: {
        userId_permissionId: {
          userId,
          permissionId: permission.id,
        },
      },
    });

    // Clear cache for this user
    await this.clearUserPermissionCache(userId);

    return result;
  }

  /**
   * ============================================================
   * GET ALL PERMISSIONS FOR A USER (WITH SOURCES)
   * ============================================================
   */

  async getUserPermissionsWithSources(userId: number) {
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

    const rolePerms = user.role.RolePermission.map(rp => ({
      code: rp.permission.code,
      name: rp.permission.name,
      resource: rp.permission.resource,
      action: rp.permission.action,
      scope: rp.permission.scope,
      source: 'ROLE',
      granted: true,
    }));

    const userPerms = user.UserPermission.map(up => ({
      code: up.permission.code,
      name: up.permission.name,
      resource: up.permission.resource,
      action: up.permission.action,
      scope: up.permission.scope,
      source: 'USER',
      granted: up.conditions ? (up.conditions as any)?.deny !== true : true,
      conditions: up.conditions,
    }));

    return [...rolePerms, ...userPerms];
  }
}