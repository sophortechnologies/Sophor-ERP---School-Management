// import { 
//   Injectable,
//     Controller,
//   Post,
//   Get,
//   HttpStatus,
//   Body,
//  } from '@nestjs/common';
// import { PrismaService } from './database/prisma.service';
// import { AuthService } from './modules/auth/auth.service';
// @Injectable()
// export class AppService {
//   constructor(private readonly authService: AuthService) {} 
//   getHello(): string {
//     return 'ERP School Management System API';
//   }

//    async healthCheck() {
//     let dbStatus = 'disconnected';
//     try {
//       await this.prisma.$queryRaw`SELECT 1`;
//       dbStatus = 'connected';
//     } catch (error) {
//       dbStatus = 'error';
//     }

//     return {
//       status: 'ok',
//       timestamp: new Date().toISOString(),
//       uptime: process.uptime(),
//       database: dbStatus,
//       environment: process.env.NODE_ENV || 'development',
//       version: process.env.npm_package_version || '1.0.0',
//     };
//   }

// }
import { Injectable } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'ERP School Management System API';
  }

  getStatus() {
    const memoryUsage = process.memoryUsage();

    return {
      status: 'ok',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: {
        used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        usage: `${Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)}%`,
      },
      node: process.version,
    };
  }

  async healthCheck() {
    let dbStatus = 'disconnected';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'error';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    };
  }
}