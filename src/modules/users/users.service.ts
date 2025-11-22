import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

async findAll(page: number = 1, limit: number = 10, search: string = '', roleId?: string) {
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (roleId) {
      where.roleId = roleId;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          role: {
            select: {
              id: true,
              name: true,
              description: true,
              isSystem: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Remove passwordHash from response
    const usersWithoutPassword = users.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return {
      data: usersWithoutPassword,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            modulePermissions: {
              include: {
                module: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { passwordHash, ...userWithoutPassword } = user;

    // Format accessible modules
    const accessibleModules = user.role.modulePermissions.map((permission) => ({
      id: permission.module.id,
      name: permission.module.name,
      description: permission.module.description,
      path: permission.module.path,
      icon: permission.module.icon,
      order: permission.module.order,
      permissions: {
        canView: permission.canView,
        canCreate: permission.canCreate,
        canEdit: permission.canEdit,
        canDelete: permission.canDelete,
      },
    })).sort((a, b) => a.order - b.order);

    return {
      ...userWithoutPassword,
      accessibleModules,
    };
  }

async update(id: string, updateUserDto: any, currentUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Prevent modifying system admin users by non-super admins
    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId },
      include: { role: true },
    });

    if (user.role.isSystem && ['super_admin', 'admin'].includes(user.role.name)) {
      if (currentUser.role.name !== 'super_admin') {
        throw new ForbiddenException('Only super admin can modify system administrator accounts');
      }
    }

    // Check if email is taken by another user
    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: updateUserDto.email,
          id: { not: id },
        },
      });

      if (existingUser) {
        throw new BadRequestException('Email already taken by another user');
      }
    }

    // Prevent role escalation
    if (updateUserDto.roleId) {
      const newRole = await this.prisma.role.findUnique({
        where: { id: updateUserDto.roleId },
      });

      if (newRole.isSystem && ['super_admin', 'admin'].includes(newRole.name)) {
        if (currentUser.role.name !== 'super_admin') {
          throw new ForbiddenException('Only super admin can assign system administrator roles');
        }
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        role: {
          include: {
            modulePermissions: {
              include: {
                module: true,
              },
              where: {
                canView: true,
                module: {
                  isActive: true,
                },
              },
            },
          },
        },
      },
    });

    const { passwordHash, ...userWithoutPassword } = updatedUser;

    // Format accessible modules
    const accessibleModules = updatedUser.role.modulePermissions.map((permission) => ({
      id: permission.module.id,
      name: permission.module.name,
      description: permission.module.description,
      path: permission.module.path,
      icon: permission.module.icon,
      order: permission.module.order,
      permissions: {
        canView: permission.canView,
        canCreate: permission.canCreate,
        canEdit: permission.canEdit,
        canDelete: permission.canDelete,
      },
    })).sort((a, b) => a.order - b.order);

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: currentUserId,
        action: 'UPDATE',
        resource: 'USER',
        resourceId: id,
        details: { updatedFields: Object.keys(updateUserDto) },
      },
    });

    return {
      message: 'User updated successfully',
      user: {
        ...userWithoutPassword,
        accessibleModules,
      },
    };
  }

async deactivate(id: string, reason: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new BadRequestException('You cannot deactivate your own account');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Prevent deactivation of system admin users
    if (user.role.isSystem && ['super_admin', 'admin'].includes(user.role.name)) {
      throw new BadRequestException('Cannot deactivate system administrator accounts');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    // Invalidate all sessions
    await this.prisma.userSession.updateMany({
      where: { userId: id },
      data: { isActive: false },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: currentUserId,
        action: 'DEACTIVATE',
        resource: 'USER',
        resourceId: id,
        details: { reason },
      },
    });

    return { message: 'User deactivated successfully' };
  }

async activate(id: string, currentUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: currentUserId,
        action: 'ACTIVATE',
        resource: 'USER',
        resourceId: id,
      },
    });

    return { message: 'User activated successfully' };
  }

  async getRoles() {
    const roles = await this.prisma.role.findMany({
      orderBy: { id: 'asc' },
    });

    return {
      data: roles,
      total: roles.length,
    };
  }

  async getUserStats() {
    const totalUsers = await this.prisma.user.count({
      where: { isActive: true },
    });

    const usersByRole = await this.prisma.user.groupBy({
      by: ['roleId'],
      where: { isActive: true },
      _count: {
        id: true,
      },
    });

    const roles = await this.prisma.role.findMany({
      where: { id: { in: usersByRole.map(u => u.roleId) } },
    });

    const roleStats = usersByRole.map(stat => {
      const role = roles.find(r => r.id === stat.roleId);
      return {
        roleId: stat.roleId,
        roleName: role?.name || 'Unknown',
        count: stat._count.id,
      };
    });

    const recentUsers = await this.prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      totalUsers,
      roleStats,
      recentUsers,
    };
  }
}