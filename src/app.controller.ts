// import { Controller, Get,
//   Post,

//   HttpStatus,
//   Body, } from '@nestjs/common';
// import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
// import { Public } from './common/decorators/public.decorator';
// import { AuthService } from './modules/auth/auth.service';

// @ApiTags('Application')
// @Controller()
// export class AppController {
//   constructor(private readonly authService: AuthService) {}
//   @Public()
//   @Get()
//   @ApiOperation({ 
//     summary: 'API Root', 
//     description: 'Root endpoint returning API information and status' 
//   })
//   @ApiResponse({ 
//     status: 200, 
//     description: 'API information',
//     schema: {
//       example: {
//         message: 'ERP School Management System API',
//         version: '1.0.0',
//         status: 'operational',
//         timestamp: '2023-10-01T12:00:00.000Z',
//         documentation: '/api/docs'
//       }
//     }
//   })
//   getRoot() {
//     return {
//       message: 'ERP School Management System API',
//       version: process.env.npm_package_version || '1.0.0',
//       status: 'operational',
//       timestamp: new Date().toISOString(),
//       documentation: '/api/docs',
//       support: 'support@sophor-tech.com',
//     };
//   }

//   @Public()
//   @Get('status')
//   @ApiOperation({ 
//     summary: 'API Status', 
//     description: 'Detailed API status and health information' 
//   })
//   @ApiResponse({ 
//     status: 200, 
//     description: 'API status details',
//     schema: {
//       example: {
//         status: 'ok',
//         environment: 'production',
//         version: '1.0.0',
//         uptime: 3600.25,
//         timestamp: '2023-10-01T12:00:00.000Z',
//         memory: {
//           used: '45.2 MB',
//           total: '512 MB',
//           usage: '8.8%'
//         },
//         node: 'v18.17.1'
//       }
//     }
//   })
//   getStatus() {
//     const memoryUsage = process.memoryUsage();
    
//     return {
//       status: 'ok',
//       environment: process.env.NODE_ENV || 'development',
//       version: process.env.npm_package_version || '1.0.0',
//       uptime: process.uptime(),
//       timestamp: new Date().toISOString(),
//       memory: {
//         used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
//         total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
//         usage: `${Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)}%`
//       },
//       node: process.version,
//     };
//   }

//     @Public()
//   @Post('setup-roles')
//   @ApiOperation({ 
//     summary: 'Create default roles and permissions' 
//   })
//   @ApiResponse({ 
//     status: HttpStatus.OK, 
//     description: 'Default roles created successfully' 
//   })
//   async setupRoles() {
//     return this.authService.createDefaultRoles();
//   }

//   @Public()
//   @Get('health')
//   @ApiOperation({ 
//     summary: 'API health check' 
//   })
//   @ApiResponse({ 
//     status: HttpStatus.OK, 
//     description: 'API is healthy',
//     schema: {
//       example: {
//         status: 'ok',
//         timestamp: '2025-12-10T18:43:31.830Z',
//         uptime: 3600.25,
//         database: 'connected',
//         environment: 'development',
//         version: '1.0.0'
//       }
//     }
//   })
//   async healthCheck() {
//     return this.authService.healthCheck();
//   }
// }
import { Controller, Get, Post, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { AuthService } from './modules/auth/auth.service';
import { AppService } from './app.service';

@ApiTags('Application')
@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly appService: AppService,
  ) {}

  @Public()
  @Get()
  getRoot() {
    return {
      message: 'ERP School Management System API',
      version: process.env.npm_package_version || '1.0.0',
      status: 'operational',
      timestamp: new Date().toISOString(),
      documentation: '/api/docs',
    };
  }

  @Public()
  @Get('status')
  getStatus() {
    return this.appService.getStatus();
  }

  @Public()
  @Post('setup-roles')
  async setupRoles() {
    return this.authService.createDefaultRoles();
  }

  @Public()
  @Get('health')
  healthCheck() {
    return this.appService.healthCheck();
  }
}

