// import { 
//   Controller, 
//   Post, 
//   Body, 
//   UseGuards, 
//   Req, 
//   Get, 
//   Put, 
//   Delete, 
//   Param,
//   HttpCode,
//   HttpStatus,
//   Query,
//   Patch
// } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { LoginDto } from './dto/login.dto';
// import { RegisterDto } from './dto/register.dto';
// import { UpdateProfileDto } from './dto/update-profile.dto';
// import { ChangePasswordDto } from './dto/change-password.dto';
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../../common/guards/roles.guard';
// import { Public } from '../../common/decorators/public.decorator';
// import { Roles } from '../../common/decorators/roles.decorator';
// import { 
//   ApiTags, 
//   ApiOperation, 
//   ApiResponse, 
//   ApiBearerAuth, 
//   ApiBody,
//   ApiParam,
//   ApiQuery,
//   ApiHeader 
// } from '@nestjs/swagger';

// @ApiTags('Authentication & Authorization')
// @ApiBearerAuth('JWT-auth')
// @Controller('auth')
// export class AuthController {
//   constructor(private authService: AuthService) {}

//   @Public()
//   @Post('login')
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ 
//     summary: 'User login', 
//     description: 'Authenticate user with username/email and password. Returns JWT token and user information with accessible modules.' 
//   })
//   @ApiBody({ type: LoginDto })
//   @ApiResponse({ 
//     status: HttpStatus.OK, 
//     description: 'Login successful',
//     schema: {
//       example: {
//         access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
//         token_type: 'Bearer',
//         expires_in: '24h',
//         user: {
//           id: 1,
//           username: 'superadmin',
//           email: 'superadmin@school.edu',
//           firstName: 'Super',
//           lastName: 'Admin',
//           phone: '+1234567890',
//           role: 'super_admin',
//           permissions: { '*': ['create', 'read', 'update', 'delete', 'manage'] },
//           lastLogin: '2023-10-01T12:00:00.000Z',
//           accessibleModules: [
//             {
//               id: 1,
//               name: 'Dashboard',
//               description: 'System dashboard and overview',
//               path: '/dashboard',
//               icon: 'mdi-view-dashboard',
//               order: 1,
//               permissions: {
//                 canView: true,
//                 canCreate: true,
//                 canEdit: true,
//                 canDelete: true
//               }
//             }
//           ]
//         }
//       }
//     }
//   })
//   @ApiResponse({ 
//     status: HttpStatus.UNAUTHORIZED, 
//     description: 'Invalid credentials',
//     schema: {
//       example: {
//         statusCode: 401,
//         message: 'Invalid username or password',
//         error: 'Unauthorized'
//       }
//     }
//   })
//   @ApiResponse({ 
//     status: HttpStatus.TOO_MANY_REQUESTS, 
//     description: 'Too many login attempts'
//   })
//   async login(@Body() loginDto: LoginDto, @Req() req: any) {
//     const ipAddress = req.ip;
//     const userAgent = req.get('User-Agent');
//     return this.authService.login(loginDto, ipAddress, userAgent);
//   }

//   @Public()
//   @Post('register')
//   @ApiOperation({ 
//     summary: 'Register new user', 
//     description: 'Create a new user account. Role ID must be provided (3=teacher, 4=student, 5=parent, 6=accountant, 7=librarian). System admin roles cannot be assigned during registration.' 
//   })
//   @ApiBody({ type: RegisterDto })
//   @ApiResponse({ 
//     status: HttpStatus.CREATED, 
//     description: 'User registered successfully',
//     schema: {
//       example: {
//         message: 'User registered successfully',
//         user: {
//           id: 2,
//           username: 'teacher1',
//           email: 'teacher1@school.edu',
//           firstName: 'John',
//           lastName: 'Doe',
//           phone: '+1234567890',
//           roleId: 3,
//           isActive: true,
//           lastLogin: null,
//           createdAt: '2023-10-01T12:00:00.000Z',
//           updatedAt: '2023-10-01T12:00:00.000Z',
//           role: {
//             id: 3,
//             name: 'teacher',
//             description: 'Teacher access for academic activities',
//             permissions: {
//               students: ['read'],
//               attendance: ['create', 'read', 'update'],
//               grades: ['create', 'read', 'update']
//             }
//           },
//           accessibleModules: [
//             {
//               id: 1,
//               name: 'Dashboard',
//               path: '/dashboard',
//               icon: 'mdi-view-dashboard',
//               permissions: { canView: true, canCreate: false, canEdit: false, canDelete: false }
//             },
//             {
//               id: 4,
//               name: 'Attendance Management',
//               path: '/attendance',
//               icon: 'mdi-calendar-check',
//               permissions: { canView: true, canCreate: true, canEdit: true, canDelete: false }
//             }
//           ]
//         }
//       }
//     }
//   })
//   @ApiResponse({ 
//     status: HttpStatus.CONFLICT, 
//     description: 'Username or email already exists'
//   })
//   @ApiResponse({ 
//     status: HttpStatus.BAD_REQUEST, 
//     description: 'Invalid role ID or validation error'
//   })
//   async register(@Body() registerDto: RegisterDto) {
//     return this.authService.register(registerDto);
//   }

//   @Get('profile')
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ 
//     summary: 'Get user profile', 
//     description: 'Get current authenticated user profile with role information and accessible modules.' 
//   })
//   @ApiResponse({ 
//     status: HttpStatus.OK, 
//     description: 'Profile retrieved successfully',
//     schema: {
//       example: {
//         id: 1,
//         username: 'superadmin',
//         email: 'superadmin@school.edu',
//         firstName: 'Super',
//         lastName: 'Admin',
//         phone: '+1234567890',
//         avatar: null,
//         roleId: 1,
//         isActive: true,
//         lastLogin: '2023-10-01T12:00:00.000Z',
//         createdAt: '2023-10-01T10:00:00.000Z',
//         updatedAt: '2023-10-01T12:00:00.000Z',
//         role: {
//           id: 1,
//           name: 'super_admin',
//           description: 'Full system access with all permissions',
//           permissions: { '*': ['create', 'read', 'update', 'delete', 'manage'] },
//           isSystem: true,
//           createdAt: '2023-10-01T10:00:00.000Z',
//           updatedAt: '2023-10-01T10:00:00.000Z'
//         },
//         accessibleModules: [
//           {
//             id: 1,
//             name: 'Dashboard',
//             description: 'System dashboard and overview',
//             path: '/dashboard',
//             icon: 'mdi-view-dashboard',
//             order: 1,
//             permissions: {
//               canView: true,
//               canCreate: true,
//               canEdit: true,
//               canDelete: true
//             }
//           }
//         ]
//       }
//     }
//   })
//   @ApiResponse({ 
//     status: HttpStatus.UNAUTHORIZED, 
//     description: 'Invalid or expired token'
//   })
//   async getProfile(@Req() req: any) {
//     return this.authService.getProfile(req.user.id);
//   }

//   @Put('profile')
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ 
//     summary: 'Update user profile', 
//     description: 'Update current user profile information. Email must be unique across the system.' 
//   })
//   @ApiBody({ type: UpdateProfileDto })
//   @ApiResponse({ 
//     status: HttpStatus.OK, 
//     description: 'Profile updated successfully',
//     schema: {
//       example: {
//         message: 'Profile updated successfully',
//         user: {
//           id: 1,
//           username: 'superadmin',
//           email: 'updated@school.edu',
//           firstName: 'Updated',
//           lastName: 'Name',
//           phone: '+1234567890',
//           roleId: 1,
//           isActive: true,
//           lastLogin: '2023-10-01T12:00:00.000Z',
//           createdAt: '2023-10-01T10:00:00.000Z',
//           updatedAt: '2023-10-01T12:30:00.000Z',
//           role: {
//             id: 1,
//             name: 'super_admin',
//             description: 'Full system access with all permissions',
//             permissions: { '*': ['create', 'read', 'update', 'delete', 'manage'] }
//           },
//           accessibleModules: [...]
//         }
//       }
//     }
//   })
//   @ApiResponse({ 
//     status: HttpStatus.CONFLICT, 
//     description: 'Email already taken by another user'
//   })
//   async updateProfile(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
//     return this.authService.updateProfile(req.user.id, updateProfileDto);
//   }

//   @Put('change-password')
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ 
//     summary: 'Change user password', 
//     description: 'Change current user password. Requires current password verification. All active sessions will be invalidated for security.' 
//   })
//   @ApiBody({ type: ChangePasswordDto })
//   @ApiResponse({ 
//     status: HttpStatus.OK, 
//     description: 'Password changed successfully',
//     schema: {
//       example: {
//         message: 'Password changed successfully'
//       }
//     }
//   })
//   @ApiResponse({ 
//     status: HttpStatus.UNAUTHORIZED, 
//     description: 'Current password is incorrect'
//   })
//   @ApiResponse({ 
//     status: HttpStatus.BAD_REQUEST, 
//     description: 'New password does not meet security requirements'
//   })
//   async changePassword(@Req() req: any, @Body() changePasswordDto: ChangePasswordDto) {
//     return this.authService.changePassword(req.user.id, changePasswordDto);
//   }

//   @Post('logout')
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ 
//     summary: 'Logout user', 
//     description: 'Invalidate current session token. User will need to login again to access protected routes.' 
//   })
//   @ApiResponse({ 
//     status: HttpStatus.OK, 
//     description: 'Logout successful',
//     schema: {
//       example: {
//         message: 'Logged out successfully'
//       }
//     }
//   })
//   async logout(@Req() req: any) {
//     const token = req.headers.authorization?.replace('Bearer ', '');
//     return this.authService.logout(token);
//   }

//   @Post('logout-all')
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ 
//     summary: 'Logout from all devices', 
//     description: 'Invalidate all active sessions for the current user across all devices.' 
//   })
//   @ApiResponse({ 
//     status: HttpStatus.OK, 
//     description: 'Logged out from all devices',
//     schema: {
//       example: {
//         message: 'Logged out from all devices'
//       }
//     }
//   })
//   async logoutAll(@Req() req: any) {
//     return this.authService.logoutAll(req.user.id);
//   }

//   @Get('sessions')
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ 
//     summary: 'Get active sessions', 
//     description: 'Get all active sessions for the current user with device and location information.' 
//   })
//   @ApiResponse({ 
//     status: HttpStatus.OK, 
//     description: 'Sessions retrieved successfully',
//     schema: {
//       example: {
//         data: [
//           {
//             id: 1,
//             userId: 1,
//             token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
//             expiresAt: '2023-10-02T12:00:00.000Z',
//             isActive: true,
//             ipAddress: '192.168.1.100',
//             userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
//             createdAt: '2023-10-01T12:00:00.000Z'
//           }
//         ]
//       }
//     }
//   })
//   async getSessions(@Req() req: any) {
//     return this.authService.getActiveSessions(req.user.id);
//   }

//   @Post('refresh-token')
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ 
//     summary: 'Refresh JWT token', 
//     description: 'Refresh the current JWT token to extend session validity.' 
//   })
//   @ApiResponse({ 
//     status: HttpStatus.OK, 
//     description: 'Token refreshed successfully',
//     schema: {
//       example: {
//         access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
//         token_type: 'Bearer',
//         expires_in: '24h'
//       }
//     }
//   })
//   async refreshToken(@Req() req: any) {
//     return this.authService.refreshToken(req.user.id);
//   }

//   @Delete('users/:id')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles('super_admin', 'admin')
//   @ApiOperation({ 
//     summary: 'Delete user account', 
//     description: 'Permanently delete a user account. Cannot delete your own account or system administrator accounts.' 
//   })
//   @ApiParam({ 
//     name: 'id', 
//     description: 'User ID to delete',
//     type: Number,
//     example: 2 
//   })
//   @ApiResponse({ 
//     status: HttpStatus.OK, 
//     description: 'User deleted successfully',
//     schema: {
//       example: {
//         message: 'User deleted successfully'
//       }
//     }
//   })
//   @ApiResponse({ 
//     status: HttpStatus.BAD_REQUEST, 
//     description: 'Cannot delete your own account or system admin'
//   })
//   @ApiResponse({ 
//     status: HttpStatus.NOT_FOUND, 
//     description: 'User not found'
//   })
//   @ApiResponse({ 
//     status: HttpStatus.FORBIDDEN, 
//     description: 'Insufficient permissions'
//   })
//   async deleteUser(@Param('id') id: string, @Req() req: any) {
//     return this.authService.deleteUser(parseInt(id), req.user.id);
//   }

//   @Public()
//   @Get('health')
//   @ApiOperation({ 
//     summary: 'API Health Check', 
//     description: 'Check API health status and database connectivity' 
//   })
//   @ApiResponse({ 
//     status: HttpStatus.OK, 
//     description: 'API is healthy',
//     schema: {
//       example: {
//         status: 'ok',
//         timestamp: '2023-10-01T12:00:00.000Z',
//         uptime: 3600.25,
//         database: 'connected',
//         environment: 'production',
//         version: '1.0.0'
//       }
//     }
//   })
//   async healthCheck() {
//     // Check database connection
//     let dbStatus = 'disconnected';
//     try {
//       await this.authService['prisma'].$queryRaw`SELECT 1`;
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

import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Req, 
  Get, 
  Put, 
  Delete, 
  Param,
  HttpCode,
  HttpStatus,
  Query
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

// FIXED IMPORT PATHS - Use relative paths from auth module
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';

@ApiTags('Authentication & Authorization')
@ApiBearerAuth('JWT-auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User login', 
    description: 'Authenticate user with username/email and password. Returns JWT token and user information with accessible modules.' 
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        expires_in: '24h',
        user: {
          id: 1,
          username: 'superadmin',
          email: 'superadmin@school.edu',
          firstName: 'Super',
          lastName: 'Admin',
          phone: '+1234567890',
          role: 'super_admin',
          permissions: { '*': ['create', 'read', 'update', 'delete', 'manage'] },
          lastLogin: '2023-10-01T12:00:00.000Z',
          accessibleModules: [
            {
              id: 1,
              name: 'Dashboard',
              description: 'System dashboard and overview',
              path: '/dashboard',
              icon: 'mdi-view-dashboard',
              order: 1,
              permissions: {
                canView: true,
                canCreate: true,
                canEdit: true,
                canDelete: true
              }
            },
            {
              id: 2,
              name: 'User Management',
              description: 'User authentication and management system',
              path: '/users',
              icon: 'mdi-account-cog',
              order: 2,
              permissions: {
                canView: true,
                canCreate: true,
                canEdit: true,
                canDelete: true
              }
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid username or password',
        error: 'Unauthorized'
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.TOO_MANY_REQUESTS, 
    description: 'Too many login attempts'
  })
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Public()
  @Post('register')
  @ApiOperation({ 
    summary: 'Register new user', 
    description: 'Create a new user account. Role ID must be provided (3=teacher, 4=student, 5=parent, 6=accountant, 7=librarian). System admin roles cannot be assigned during registration.' 
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'User registered successfully',
    schema: {
      example: {
        message: 'User registered successfully',
        user: {
          id: 2,
          username: 'teacher1',
          email: 'teacher1@school.edu',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          roleId: 3,
          isActive: true,
          lastLogin: null,
          createdAt: '2023-10-01T12:00:00.000Z',
          updatedAt: '2023-10-01T12:00:00.000Z',
          role: {
            id: 3,
            name: 'teacher',
            description: 'Teacher access for academic activities',
            permissions: {
              students: ['read'],
              attendance: ['create', 'read', 'update'],
              grades: ['create', 'read', 'update']
            }
          },
          accessibleModules: [
            {
              id: 1,
              name: 'Dashboard',
              path: '/dashboard',
              icon: 'mdi-view-dashboard',
              permissions: { canView: true, canCreate: false, canEdit: false, canDelete: false }
            },
            {
              id: 4,
              name: 'Attendance Management',
              path: '/attendance',
              icon: 'mdi-calendar-check',
              permissions: { canView: true, canCreate: true, canEdit: true, canDelete: false }
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Username or email already exists'
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid role ID or validation error'
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get user profile', 
    description: 'Get current authenticated user profile with role information and accessible modules.' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Profile retrieved successfully',
    schema: {
      example: {
        id: 1,
        username: 'superadmin',
        email: 'superadmin@school.edu',
        firstName: 'Super',
        lastName: 'Admin',
        phone: '+1234567890',
        avatar: null,
        roleId: 1,
        isActive: true,
        lastLogin: '2023-10-01T12:00:00.000Z',
        createdAt: '2023-10-01T10:00:00.000Z',
        updatedAt: '2023-10-01T12:00:00.000Z',
        role: {
          id: 1,
          name: 'super_admin',
          description: 'Full system access with all permissions',
          permissions: { '*': ['create', 'read', 'update', 'delete', 'manage'] },
          isSystem: true,
          createdAt: '2023-10-01T10:00:00.000Z',
          updatedAt: '2023-10-01T10:00:00.000Z'
        },
        accessibleModules: [
          {
            id: 1,
            name: 'Dashboard',
            description: 'System dashboard and overview',
            path: '/dashboard',
            icon: 'mdi-view-dashboard',
            order: 1,
            permissions: {
              canView: true,
              canCreate: true,
              canEdit: true,
              canDelete: true
            }
          },
          {
            id: 2,
            name: 'User Management',
            description: 'User authentication and management system',
            path: '/users',
            icon: 'mdi-account-cog',
            order: 2,
            permissions: {
              canView: true,
              canCreate: true,
              canEdit: true,
              canDelete: true
            }
          }
        ]
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Invalid or expired token'
  })
  async getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Update user profile', 
    description: 'Update current user profile information. Email must be unique across the system.' 
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Profile updated successfully',
    schema: {
      example: {
        message: 'Profile updated successfully',
        user: {
          id: 1,
          username: 'superadmin',
          email: 'updated@school.edu',
          firstName: 'Updated',
          lastName: 'Name',
          phone: '+1234567890',
          roleId: 1,
          isActive: true,
          lastLogin: '2023-10-01T12:00:00.000Z',
          createdAt: '2023-10-01T10:00:00.000Z',
          updatedAt: '2023-10-01T12:30:00.000Z',
          role: {
            id: 1,
            name: 'super_admin',
            description: 'Full system access with all permissions',
            permissions: { '*': ['create', 'read', 'update', 'delete', 'manage'] }
          },
          accessibleModules: [
            {
              id: 1,
              name: 'Dashboard',
              description: 'System dashboard and overview',
              path: '/dashboard',
              icon: 'mdi-view-dashboard',
              order: 1,
              permissions: {
                canView: true,
                canCreate: true,
                canEdit: true,
                canDelete: true
              }
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Email already taken by another user'
  })
  async updateProfile(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, updateProfileDto);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Change user password', 
    description: 'Change current user password. Requires current password verification. All active sessions will be invalidated for security.' 
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Password changed successfully',
    schema: {
      example: {
        message: 'Password changed successfully'
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Current password is incorrect'
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'New password does not meet security requirements'
  })
  async changePassword(@Req() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Logout user', 
    description: 'Invalidate current session token. User will need to login again to access protected routes.' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Logout successful',
    schema: {
      example: {
        message: 'Logged out successfully'
      }
    }
  })
  async logout(@Req() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.authService.logout(token);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Logout from all devices', 
    description: 'Invalidate all active sessions for the current user across all devices.' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Logged out from all devices',
    schema: {
      example: {
        message: 'Logged out from all devices'
      }
    }
  })
  async logoutAll(@Req() req: any) {
    return this.authService.logoutAll(req.user.id);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get active sessions', 
    description: 'Get all active sessions for the current user with device and location information.' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Sessions retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 1,
            userId: 1,
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            expiresAt: '2023-10-02T12:00:00.000Z',
            isActive: true,
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            createdAt: '2023-10-01T12:00:00.000Z'
          }
        ]
      }
    }
  })
  async getSessions(@Req() req: any) {
    return this.authService.getActiveSessions(req.user.id);
  }

  @Post('refresh-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Refresh JWT token', 
    description: 'Refresh the current JWT token to extend session validity.' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Token refreshed successfully',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        expires_in: '24h'
      }
    }
  })
  async refreshToken(@Req() req: any) {
    return this.authService.refreshToken(req.user.id);
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiOperation({ 
    summary: 'Delete user account', 
    description: 'Permanently delete a user account. Cannot delete your own account or system administrator accounts.' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID to delete',
    type: Number,
    example: 2 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User deleted successfully',
    schema: {
      example: {
        message: 'User deleted successfully'
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Cannot delete your own account or system admin'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found'
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Insufficient permissions'
  })
  async deleteUser(@Param('id') id: string, @Req() req: any) {
return this.authService.deleteUser(id, req.user.id);  }

  @Public()
  @Get('health')
  @ApiOperation({ 
    summary: 'API Health Check', 
    description: 'Check API health status and database connectivity' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'API is healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2023-10-01T12:00:00.000Z',
        uptime: 3600.25,
        database: 'connected',
        environment: 'production',
        version: '1.0.0'
      }
    }
  })
  async healthCheck() {
    // Check database connection
    let dbStatus = 'disconnected';
    try {
      await this.authService['prisma'].$queryRaw`SELECT 1`;
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