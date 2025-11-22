// // import { Injectable, NotFoundException } from '@nestjs/common';
// // import { PrismaService } from '../../database/prisma.service';

// // @Injectable()
// // export class ModulesService {
// //   constructor(private prisma: PrismaService) {}

// //   async getUserModules(userId: number) {
// //     const user = await this.prisma.user.findUnique({
// //       where: { id: userId },
// //       include: {
// //         role: {
// //           include: {
// //             modulePermissions: {
// //               include: {
// //                 module: true,
// //               },
// //               where: {
// //                 canView: true,
// //                 module: {
// //                   isActive: true,
// //                 },
// //               },
// //             },
// //           },
// //         },
// //       },
// //     });

// //     if (!user) {
// //       return [];
// //     }

// //     // Format modules with permissions
// //     const modules = user.role.modulePermissions.map((permission) => ({
// //       id: permission.module.id,
// //       name: permission.module.name,
// //       description: permission.module.description,
// //       path: permission.module.path,
// //       icon: permission.module.icon,
// //       order: permission.module.order,
// //       permissions: {
// //         canView: permission.canView,
// //         canCreate: permission.canCreate,
// //         canEdit: permission.canEdit,
// //         canDelete: permission.canDelete,
// //       },
// //     }));

// //     // Sort by order
// //     return modules.sort((a, b) => a.order - b.order);
// //   }

// //   async getAllModules() {
// //     return this.prisma.module.findMany({
// //       where: { isActive: true },
// //       include: {
// //         permissions: {
// //           include: {
// //             role: true,
// //           },
// //         },
// //       },
// //       orderBy: { order: 'asc' },
// //     });
// //   }

// //   async getModuleById(id: number) {
// //     const module = await this.prisma.module.findUnique({
// //       where: { id },
// //       include: {
// //         permissions: {
// //           include: {
// //             role: true,
// //           },
// //         },
// //       },
// //     });

// //     if (!module) {
// //       throw new NotFoundException(`Module with ID ${id} not found`);
// //     }

// //     return module;
// //   }

// //   async getModulePermissions(moduleId: number) {
// //     const module = await this.prisma.module.findUnique({
// //       where: { id: moduleId },
// //       include: {
// //         permissions: {
// //           include: {
// //             role: true,
// //           },
// //         },
// //       },
// //     });

// //     if (!module) {
// //       throw new NotFoundException(`Module with ID ${moduleId} not found`);
// //     }

// //     return module.permissions;
// //   }

// //   async updateModulePermissions(moduleId: number, permissions: any[]) {
// //     // Verify module exists
// //     const module = await this.prisma.module.findUnique({
// //       where: { id: moduleId },
// //     });

// //     if (!module) {
// //       throw new NotFoundException(`Module with ID ${moduleId} not found`);
// //     }

// //     const transaction = permissions.map((permission) =>
// //       this.prisma.modulePermission.upsert({
// //         where: {
// //           moduleId_roleId: {
// //             moduleId,
// //             roleId: permission.roleId,
// //           },
// //         },
// //         update: {
// //           canView: permission.canView,
// //           canCreate: permission.canCreate,
// //           canEdit: permission.canEdit,
// //           canDelete: permission.canDelete,
// //         },
// //         create: {
// //           moduleId,
// //           roleId: permission.roleId,
// //           canView: permission.canView,
// //           canCreate: permission.canCreate,
// //           canEdit: permission.canEdit,
// //           canDelete: permission.canDelete,
// //         },
// //       })
// //     );

// //     return this.prisma.$transaction(transaction);
// //   }

// //   async getSystemModules() {
// //     return this.prisma.module.findMany({
// //       where: { isSystem: true, isActive: true },
// //       orderBy: { order: 'asc' },
// //     });
// //   }

// //   async getRoleModules(roleId: number) {
// //     const role = await this.prisma.role.findUnique({
// //       where: { id: roleId },
// //       include: {
// //         modulePermissions: {
// //           include: {
// //             module: true,
// //           },
// //         },
// //       },
// //     });

// //     if (!role) {
// //       throw new NotFoundException(`Role with ID ${roleId} not found`);
// //     }

// //     return role.modulePermissions.map(permission => ({
// //       module: permission.module,
// //       permissions: {
// //         canView: permission.canView,
// //         canCreate: permission.canCreate,
// //         canEdit: permission.canEdit,
// //         canDelete: permission.canDelete,
// //       },
// //     }));
// //   }
// // }

// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from '../../database/prisma.service';

// @Injectable()
// export class ModulesService {
//   constructor(private prisma: PrismaService) {}

//   async getUserModules(userId: number) {
//     const user = await this.prisma.user.findUnique({
//       where: { id: userId },
//       include: {
//         role: {
//           include: {
//             modulePermissions: {
//               include: {
//                 module: true,
//               },
//               where: {
//                 canView: true,
//                 module: {
//                   isActive: true,
//                 },
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!user) {
//       return [];
//     }

//     // Format modules with permissions
//     const modules = user.role.modulePermissions.map((permission) => ({
//       id: permission.module.id,
//       name: permission.module.name,
//       description: permission.module.description,
//       path: permission.module.path,
//       icon: permission.module.icon,
//       order: permission.module.order,
//       permissions: {
//         canView: permission.canView,
//         canCreate: permission.canCreate,
//         canEdit: permission.canEdit,
//         canDelete: permission.canDelete,
//       },
//     }));

//     // Sort by order
//     return modules.sort((a, b) => a.order - b.order);
//   }

//   async getAllModules() {
//     const modules = await this.prisma.module.findMany({
//       where: { isActive: true },
//       include: {
//         permissions: {
//           include: {
//             role: {
//               select: {
//                 id: true,
//                 name: true,
//                 description: true,
//               },
//             },
//           },
//         },
//       },
//       orderBy: { order: 'asc' },
//     });

//     return {
//       data: modules,
//       total: modules.length,
//     };
//   }

//   async getModuleById(id: number) {
//     const module = await this.prisma.module.findUnique({
//       where: { id },
//       include: {
//         permissions: {
//           include: {
//             role: {
//               select: {
//                 id: true,
//                 name: true,
//                 description: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!module) {
//       throw new NotFoundException(`Module with ID ${id} not found`);
//     }

//     return {
//       data: module,
//     };
//   }

//   async getModulePermissions(moduleId: number) {
//     const module = await this.prisma.module.findUnique({
//       where: { id: moduleId },
//       include: {
//         permissions: {
//           include: {
//             role: {
//               select: {
//                 id: true,
//                 name: true,
//                 description: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!module) {
//       throw new NotFoundException(`Module with ID ${moduleId} not found`);
//     }

//     return {
//       data: module.permissions,
//       total: module.permissions.length,
//     };
//   }

//   async updateModulePermissions(moduleId: number, permissions: any[]) {
//     // Verify module exists
//     const module = await this.prisma.module.findUnique({
//       where: { id: moduleId },
//     });

//     if (!module) {
//       throw new NotFoundException(`Module with ID ${moduleId} not found`);
//     }

//     const transaction = permissions.map((permission) =>
//       this.prisma.modulePermission.upsert({
//         where: {
//           moduleId_roleId: {
//             moduleId,
//             roleId: permission.roleId,
//           },
//         },
//         update: {
//           canView: permission.canView,
//           canCreate: permission.canCreate,
//           canEdit: permission.canEdit,
//           canDelete: permission.canDelete,
//         },
//         create: {
//           moduleId,
//           roleId: permission.roleId,
//           canView: permission.canView,
//           canCreate: permission.canCreate,
//           canEdit: permission.canEdit,
//           canDelete: permission.canDelete,
//         },
//       })
//     );

//     await this.prisma.$transaction(transaction);

//     return {
//       message: 'Module permissions updated successfully',
//       data: permissions,
//     };
//   }

//   async getSystemModules() {
//     const modules = await this.prisma.module.findMany({
//       where: { isSystem: true, isActive: true },
//       orderBy: { order: 'asc' },
//     });

//     return {
//       data: modules,
//       total: modules.length,
//     };
//   }

//   async getRoleModules(roleId: number) {
//     const role = await this.prisma.role.findUnique({
//       where: { id: roleId },
//       include: {
//         modulePermissions: {
//           include: {
//             module: true,
//           },
//         },
//       },
//     });

//     if (!role) {
//       throw new NotFoundException(`Role with ID ${roleId} not found`);
//     }

//     const modules = role.modulePermissions.map(permission => ({
//       module: permission.module,
//       permissions: {
//         canView: permission.canView,
//         canCreate: permission.canCreate,
//         canEdit: permission.canEdit,
//         canDelete: permission.canDelete,
//       },
//     }));

//     return {
//       data: modules,
//       total: modules.length,
//     };
//   }

//   async getModulesSummary() {
//     const totalModules = await this.prisma.module.count({
//       where: { isActive: true },
//     });

//     const systemModules = await this.prisma.module.count({
//       where: { isSystem: true, isActive: true },
//     });

//     const modulesByPermission = await this.prisma.modulePermission.groupBy({
//       by: ['moduleId'],
//       _count: {
//         roleId: true,
//       },
//     });

//     const modules = await this.prisma.module.findMany({
//       where: { id: { in: modulesByPermission.map(m => m.moduleId) } },
//       select: {
//         id: true,
//         name: true,
//       },
//     });

//     const permissionStats = modulesByPermission.map(stat => {
//       const module = modules.find(m => m.id === stat.moduleId);
//       return {
//         moduleId: stat.moduleId,
//         moduleName: module?.name || 'Unknown',
//         roleCount: stat._count.roleId,
//       };
//     });

//     return {
//       totalModules,
//       systemModules,
//       customModules: totalModules - systemModules,
//       permissionStats,
//     };
//   }
// }

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ModulesService {
  constructor(private prisma: PrismaService) {}

  async getUserModules(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      return [];
    }

    const modules = user.role.modulePermissions.map((permission) => ({
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
    }));

    return modules.sort((a, b) => a.order - b.order);
  }

  async getAllModules() {
    const modules = await this.prisma.module.findMany({
      where: { isActive: true },
      include: {
        permissions: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    return {
      data: modules,
      total: modules.length,
    };
  }

  async getModuleById(id: string) {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }

    return {
      data: module,
    };
  }

  async getModulePermissions(moduleId: string) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        permissions: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    return {
      data: module.permissions,
      total: module.permissions.length,
    };
  }

  async updateModulePermissions(moduleId: string, permissions: any[]) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    const transaction = permissions.map((permission) =>
      this.prisma.modulePermission.upsert({
        where: {
          roleId_moduleId: {
            roleId: permission.roleId,
            moduleId,
          },
        },
        update: {
          canView: permission.canView,
          canCreate: permission.canCreate,
          canEdit: permission.canEdit,
          canDelete: permission.canDelete,
        },
        create: {
          moduleId,
          roleId: permission.roleId,
          canView: permission.canView,
          canCreate: permission.canCreate,
          canEdit: permission.canEdit,
          canDelete: permission.canDelete,
        },
      })
    );

    await this.prisma.$transaction(transaction);

    return {
      message: 'Module permissions updated successfully',
      data: permissions,
    };
  }

  async getSystemModules() {
    const modules = await this.prisma.module.findMany({
      where: { isSystem: true, isActive: true },
      orderBy: { order: 'asc' },
    });

    return {
      data: modules,
      total: modules.length,
    };
  }

  async getRoleModules(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        modulePermissions: {
          include: {
            module: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    const modules = role.modulePermissions.map(permission => ({
      module: permission.module,
      permissions: {
        canView: permission.canView,
        canCreate: permission.canCreate,
        canEdit: permission.canEdit,
        canDelete: permission.canDelete,
      },
    }));

    return {
      data: modules,
      total: modules.length,
    };
  }

  async getModulesSummary() {
    const totalModules = await this.prisma.module.count({
      where: { isActive: true },
    });

    const systemModules = await this.prisma.module.count({
      where: { isSystem: true, isActive: true },
    });

    const modulesByPermission = await this.prisma.modulePermission.groupBy({
      by: ['moduleId'],
      _count: {
        roleId: true,
      },
    });

    const modules = await this.prisma.module.findMany({
      where: { id: { in: modulesByPermission.map(m => m.moduleId) } },
      select: {
        id: true,
        name: true,
      },
    });

    const permissionStats = modulesByPermission.map(stat => {
      const module = modules.find(m => m.id === stat.moduleId);
      return {
        moduleId: stat.moduleId,
        moduleName: module?.name || 'Unknown',
        roleCount: stat._count.roleId,
      };
    });

    return {
      totalModules,
      systemModules,
      customModules: totalModules - systemModules,
      permissionStats,
    };
  }
}