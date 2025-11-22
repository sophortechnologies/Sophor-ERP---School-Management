// // import { Controller, Get, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
// // import { ModulesService } from './modules.service';
// // import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// // import { RolesGuard } from '../../common/guards/roles.guard';
// // import { Roles } from '../../common/decorators/roles.decorator';
// // import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';

// // @ApiTags('Modules Management')
// // @ApiBearerAuth('JWT-auth')
// // @Controller('modules')
// // @UseGuards(JwtAuthGuard)
// // export class ModulesController {
// //   constructor(private readonly modulesService: ModulesService) {}

// //   @Get('my-modules')
// //   @ApiOperation({ 
// //     summary: 'Get user accessible modules', 
// //     description: 'Get all modules that the current user has permission to access with their specific permissions.' 
// //   })
// //   @ApiResponse({ 
// //     status: 200, 
// //     description: 'User modules retrieved successfully',
// //     schema: {
// //       example: {
// //         data: [
// //           {
// //             id: 1,
// //             name: 'Dashboard',
// //             description: 'System dashboard and overview',
// //             path: '/dashboard',
// //             icon: 'mdi-view-dashboard',
// //             order: 1,
// //             permissions: {
// //               canView: true,
// //               canCreate: false,
// //               canEdit: false,
// //               canDelete: false
// //             }
// //           },
// //           {
// //             id: 4,
// //             name: 'Attendance Management',
// //             description: 'Student and staff attendance tracking system',
// //             path: '/attendance',
// //             icon: 'mdi-calendar-check',
// //             order: 4,
// //             permissions: {
// //               canView: true,
// //               canCreate: true,
// //               canEdit: true,
// //               canDelete: false
// //             }
// //           }
// //         ]
// //       }
// //     }
// //   })
// //   async getUserModules(@Req() req: any) {
// //     const modules = await this.modulesService.getUserModules(req.user.id);
// //     return {
// //       data: modules,
// //       total: modules.length,
// //     };
// //   }

// //   @Get()
// //   @UseGuards(RolesGuard)
// //   @Roles('super_admin', 'admin')
// //   @ApiOperation({ 
// //     summary: 'Get all modules (Admin only)', 
// //     description: 'Get all system modules with their permissions for each role. Requires admin privileges.' 
// //   })
// //   @ApiResponse({ 
// //     status: 200, 
// //     description: 'Modules retrieved successfully',
// //     schema: {
// //       example: {
// //         data: [
// //           {
// //             id: 1,
// //             name: 'Dashboard',
// //             description: 'System dashboard and overview',
// //             path: '/dashboard',
// //             icon: 'mdi-view-dashboard',
// //             order: 1,
// //             isActive: true,
// //             isSystem: true,
// //             permissions: [
// //               {
// //                 roleId: 1,
// //                 canView: true,
// //                 canCreate: true,
// //                 canEdit: true,
// //                 canDelete: true,
// //                 role: {
// //                   id: 1,
// //                   name: 'super_admin',
// //                   description: 'Full system access with all permissions'
// //                 }
// //               }
// //             ]
// //           }
// //         ],
// //         total: 12
// //       }
// //     }
// //   })
// //   async getAllModules() {
// //     return this.modulesService.getAllModules();
// //   }

// //   @Get('system')
// //   @UseGuards(RolesGuard)
// //   @Roles('super_admin', 'admin')
// //   @ApiOperation({ 
// //     summary: 'Get system modules (Admin only)', 
// //     description: 'Get all system modules (non-customizable core modules)' 
// //   })
// //   @ApiResponse({ 
// //     status: 200, 
// //     description: 'System modules retrieved successfully' 
// //   })
// //   async getSystemModules() {
// //     return this.modulesService.getSystemModules();
// //   }

// //   @Get('role/:roleId')
// //   @UseGuards(RolesGuard)
// //   @Roles('super_admin', 'admin')
// //   @ApiOperation({ 
// //     summary: 'Get modules for specific role', 
// //     description: 'Get all modules and their permissions for a specific role' 
// //   })
// //   @ApiParam({ 
// //     name: 'roleId', 
// //     description: 'Role ID',
// //     type: Number,
// //     example: 3 
// //   })
// //   @ApiResponse({ 
// //     status: 200, 
// //     description: 'Role modules retrieved successfully' 
// //   })
// //   async getRoleModules(@Param('roleId') roleId: string) {
// //     return this.modulesService.getRoleModules(parseInt(roleId));
// //   }

// //   @Get('summary')
// //   @UseGuards(RolesGuard)
// //   @Roles('super_admin', 'admin')
// //   @ApiOperation({ 
// //     summary: 'Get modules summary statistics', 
// //     description: 'Get summary statistics about modules and permissions' 
// //   })
// //   @ApiResponse({ 
// //     status: 200, 
// //     description: 'Modules summary retrieved successfully',
// //     schema: {
// //       example: {
// //         totalModules: 12,
// //         systemModules: 12,
// //         customModules: 0,
// //         permissionStats: [
// //           {
// //             moduleId: 1,
// //             moduleName: 'Dashboard',
// //             roleCount: 7
// //           }
// //         ]
// //       }
// //     }
// //   })
// //   async getModulesSummary() {
// //     return this.modulesService.getModulesSummary();
// //   }

// //   @Get(':id')
// //   @UseGuards(RolesGuard)
// //   @Roles('super_admin', 'admin')
// //   @ApiOperation({ 
// //     summary: 'Get module by ID', 
// //     description: 'Get detailed information about a specific module including all role permissions' 
// //   })
// //   @ApiParam({ 
// //     name: 'id', 
// //     description: 'Module ID',
// //     type: Number,
// //     example: 1 
// //   })
// //   @ApiResponse({ 
// //     status: 200, 
// //     description: 'Module retrieved successfully' 
// //   })
// //   @ApiResponse({ 
// //     status: 404, 
// //     description: 'Module not found' 
// //   })
// //   async getModuleById(@Param('id') id: string) {
// //     return this.modulesService.getModuleById(parseInt(id));
// //   }

// //   @Get(':id/permissions')
// //   @UseGuards(RolesGuard)
// //   @Roles('super_admin', 'admin')
// //   @ApiOperation({ 
// //     summary: 'Get module permissions', 
// //     description: 'Get all permissions for a specific module across all roles' 
// //   })
// //   @ApiParam({ 
// //     name: 'id', 
// //     description: 'Module ID',
// //     type: Number,
// //     example: 1 
// //   })
// //   @ApiResponse({ 
// //     status: 200, 
// //     description: 'Module permissions retrieved successfully' 
// //   })
// //   async getModulePermissions(@Param('id') id: string) {
// //     return this.modulesService.getModulePermissions(parseInt(id));
// //   }

// //   @Put(':id/permissions')
// //   @UseGuards(RolesGuard)
// //   @Roles('super_admin')
// //   @ApiOperation({ 
// //     summary: 'Update module permissions (Super Admin only)', 
// //     description: 'Update permissions for a specific module across all roles. Only super admin can modify permissions.' 
// //   })
// //   @ApiParam({ 
// //     name: 'id', 
// //     description: 'Module ID',
// //     type: Number,
// //     example: 1 
// //   })
// //   @ApiResponse({ 
// //     status: 200, 
// //     description: 'Module permissions updated successfully',
// //     schema: {
// //       example: {
// //         message: 'Module permissions updated successfully',
// //         data: [
// //           {
// //             roleId: 3,
// //             canView: true,
// //             canCreate: true,
// //             canEdit: true,
// //             canDelete: false
// //           }
// //         ]
// //       }
// //     }
// //   })
// //   async updateModulePermissions(
// //     @Param('id') id: string,
// //     @Body() permissions: any[],
// //   ) {
// //     return this.modulesService.updateModulePermissions(parseInt(id), permissions);
// //   }
// // }

// import { Controller, Get, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
// import { ModulesService } from './modules.service';
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../../common/guards/roles.guard';
// import { Roles } from '../../common/decorators/roles.decorator';
// import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';

// @ApiTags('Modules Management')
// @ApiBearerAuth('JWT-auth')
// @Controller('modules')
// @UseGuards(JwtAuthGuard)
// export class ModulesController {
//   constructor(private readonly modulesService: ModulesService) {}

//   @Get('my-modules')
//   @ApiOperation({ 
//     summary: 'Get user accessible modules', 
//     description: 'Get all modules that the current user has permission to access with their specific permissions.' 
//   })
//   @ApiResponse({ 
//     status: 200, 
//     description: 'User modules retrieved successfully',
//     schema: {
//       example: {
//         data: [
//           {
//             id: 1,
//             name: 'Dashboard',
//             description: 'System dashboard and overview',
//             path: '/dashboard',
//             icon: 'mdi-view-dashboard',
//             order: 1,
//             permissions: {
//               canView: true,
//               canCreate: false,
//               canEdit: false,
//               canDelete: false
//             }
//           }
//         ]
//       }
//     }
//   })
//   async getUserModules(@Req() req: any) {
//     const modules = await this.modulesService.getUserModules(req.user.id);
//     return {
//       data: modules,
//       total: modules.length,
//     };
//   }

//   @Get()
//   @UseGuards(RolesGuard)
//   @Roles('super_admin', 'admin')
//   @ApiOperation({ 
//     summary: 'Get all modules (Admin only)', 
//     description: 'Get all system modules with their permissions for each role. Requires admin privileges.' 
//   })
//   @ApiResponse({ 
//     status: 200, 
//     description: 'Modules retrieved successfully'
//   })
//   async getAllModules() {
//     return this.modulesService.getAllModules();
//   }

//   @Get('system')
//   @UseGuards(RolesGuard)
//   @Roles('super_admin', 'admin')
//   @ApiOperation({ 
//     summary: 'Get system modules (Admin only)', 
//     description: 'Get all system modules (non-customizable core modules)' 
//   })
//   async getSystemModules() {
//     return this.modulesService.getSystemModules();
//   }

//   @Get('role/:roleId')
//   @UseGuards(RolesGuard)
//   @Roles('super_admin', 'admin')
//   @ApiOperation({ 
//     summary: 'Get modules for specific role', 
//     description: 'Get all modules and their permissions for a specific role' 
//   })
//   @ApiParam({ 
//     name: 'roleId', 
//     description: 'Role ID',
//     type: Number,
//     example: 3 
//   })
//   async getRoleModules(@Param('roleId') roleId: string) {
//     return this.modulesService.getRoleModules(parseInt(roleId));
//   }

//   @Get('summary')
//   @UseGuards(RolesGuard)
//   @Roles('super_admin', 'admin')
//   @ApiOperation({ 
//     summary: 'Get modules summary statistics', 
//     description: 'Get summary statistics about modules and permissions' 
//   })
//   @ApiResponse({ 
//     status: 200, 
//     description: 'Modules summary retrieved successfully'
//   })
//   async getModulesSummary() {
//     return this.modulesService.getModulesSummary();
//   }

//   @Get(':id')
//   @UseGuards(RolesGuard)
//   @Roles('super_admin', 'admin')
//   @ApiOperation({ 
//     summary: 'Get module by ID', 
//     description: 'Get detailed information about a specific module' 
//   })
//   @ApiParam({ 
//     name: 'id', 
//     description: 'Module ID',
//     type: Number,
//     example: 1 
//   })
//   async getModuleById(@Param('id') id: string) {
//     return this.modulesService.getModuleById(parseInt(id));
//   }

//   @Get(':id/permissions')
//   @UseGuards(RolesGuard)
//   @Roles('super_admin', 'admin')
//   @ApiOperation({ 
//     summary: 'Get module permissions', 
//     description: 'Get all permissions for a specific module across all roles' 
//   })
//   @ApiParam({ 
//     name: 'id', 
//     description: 'Module ID',
//     type: Number,
//     example: 1 
//   })
//   async getModulePermissions(@Param('id') id: string) {
//     return this.modulesService.getModulePermissions(parseInt(id));
//   }

//   @Put(':id/permissions')
//   @UseGuards(RolesGuard)
//   @Roles('super_admin')
//   @ApiOperation({ 
//     summary: 'Update module permissions (Super Admin only)', 
//     description: 'Update permissions for a specific module across all roles' 
//   })
//   @ApiParam({ 
//     name: 'id', 
//     description: 'Module ID',
//     type: Number,
//     example: 1 
//   })
//   async updateModulePermissions(
//     @Param('id') id: string,
//     @Body() permissions: any[],
//   ) {
//     return this.modulesService.updateModulePermissions(parseInt(id), permissions);
//   }
// }

import { Controller, Get, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Modules Management')
@ApiBearerAuth('JWT-auth')
@Controller('modules')
@UseGuards(JwtAuthGuard)
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get('my-modules')
  @ApiOperation({ 
    summary: 'Get user accessible modules', 
    description: 'Get all modules that the current user has permission to access with their specific permissions.' 
  })
  async getUserModules(@Req() req: any) {
    const modules = await this.modulesService.getUserModules(req.user.id);
    return {
      data: modules,
      total: modules.length,
    };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get all modules (Admin only)' })
  async getAllModules() {
    return this.modulesService.getAllModules();
  }

  @Get('system')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get system modules (Admin only)' })
  async getSystemModules() {
    return this.modulesService.getSystemModules();
  }

  @Get('role/:roleId')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get modules for specific role' })
  async getRoleModules(@Param('roleId') roleId: string) {
    return this.modulesService.getRoleModules(roleId);
  }

  @Get('summary')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get modules summary statistics' })
  async getModulesSummary() {
    return this.modulesService.getModulesSummary();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get module by ID' })
  async getModuleById(@Param('id') id: string) {
    return this.modulesService.getModuleById(id);
  }

  @Get(':id/permissions')
  @UseGuards(RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Get module permissions' })
  async getModulePermissions(@Param('id') id: string) {
    return this.modulesService.getModulePermissions(id);
  }

  @Put(':id/permissions')
  @UseGuards(RolesGuard)
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update module permissions (Super Admin only)' })
  async updateModulePermissions(
    @Param('id') id: string,
    @Body() permissions: any[],
  ) {
    return this.modulesService.updateModulePermissions(id, permissions);
  }
}