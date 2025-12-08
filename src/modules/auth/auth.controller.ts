
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
  BadRequestException,
  Query
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
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
@UseGuards(JwtAuthGuard,RolesGuard)
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
          }
        ]
      }
    }
  }
})
@ApiResponse({ 
  status: HttpStatus.UNAUTHORIZED, 
  description: 'Invalid credentials'
})
async login(@Body() loginDto: LoginDto) {
  //  FIX: Only pass loginDto, remove ipAddress and userAgent
  return this.authService.login(loginDto);
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
  // ... your existing schema
})
async getProfile(@Req() req: any) {
  console.log('=== DEBUG: Profile Request ===');
  console.log('Full req.user object:', JSON.stringify(req.user, null, 2));
  console.log('req.user.id:', req.user?.id);
  console.log('req.user.userId:', req.user?.userId);
  console.log('req.user.sub:', req.user?.sub);
  console.log('Available keys:', Object.keys(req.user || {}));
  console.log('=============================');
  
  // Try different possible ID locations
  const userId = req.user?.id || req.user?.userId || req.user?.sub;
  
  if (!userId) {
    throw new BadRequestException(`User ID not found in token. Available keys: ${Object.keys(req.user || {})}`);
  }
  
  console.log('Using User ID:', userId);
  return this.authService.getProfile(userId);
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
async changePassword(
  @Req() req: any, 
  @Body() changePasswordDto: ChangePasswordDto
) {
  const userId = req.user.id;
  return this.authService.changePassword(userId, changePasswordDto);
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
    return this.authService.deleteUser(parseInt(id), req.user.id);
  }

@Public()
@Post('setup-roles')
async setupRoles() {
  return this.authService.createDefaultRoles();
}
@Public()
@Get('debug-roles')
async debugRoles() {
  try {
    console.log(' Debug roles endpoint called');
    const roles = await this.authService['prisma'].role.findMany();
    console.log(' Roles found:', roles);
    return { 
      success: true,
      roles: roles,
      count: roles.length 
    };
  } catch (error) {
    console.error(' Error in debug-roles:', error);
    return { 
      success: false,
      error: error.message,
      roles: []
    };
  }
}

@Public()
@Post('reset-password')
async resetPassword(@Body() body: { email: string, newPassword: string }) {
  const passwordHash = await bcrypt.hash(body.newPassword, 12);
  
  const user = await this.authService['prisma'].user.update({
    where: { email: body.email },
    data: { passwordHash }
  });
  
  return { message: 'Password reset successfully', user: { email: user.email } };
}
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

@Public()
@Post('debug-login')
async debugLogin(@Body() loginDto: LoginDto) {
  try {
    console.log(' DEBUG LOGIN STARTED');
    console.log(' Email:', loginDto.email);
    console.log(' Password:', loginDto.password);

    // Find user
    const user = await this.authService['prisma'].user.findFirst({
      where: { email: loginDto.email },
      include: { role: true }
    });

    if (!user) {
      console.log(' USER NOT FOUND');
      return { error: 'User not found', email: loginDto.email };
    }

    console.log(' USER FOUND:', {
      id: user.id,
      email: user.email,
      hasPasswordHash: !!user.passwordHash,
      passwordHashLength: user.passwordHash?.length,
      isActive: user.isActive,
      role: user.role?.name
    });

    // Test password directly
    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
      console.log(' PASSWORD MATCH:', isMatch);
      
      if (!isMatch) {
        console.log(' PASSWORD MISMATCH');
        console.log(' Input:', loginDto.password);
        console.log('Stored hash:', user.passwordHash);
      }
    } else {
      console.log(' NO PASSWORD HASH STORED');
    }

    return {
      userExists: true,
      hasPasswordHash: !!user.passwordHash,
      passwordMatch: user.passwordHash ? await bcrypt.compare(loginDto.password, user.passwordHash) : false,
      user: {
        id: user.id,
        email: user.email,
        isActive: user.isActive,
        role: user.role?.name
      }
    };

  } catch (error) {
    console.error('💥 DEBUG LOGIN ERROR:', error);
    return { error: error.message };
  }
}
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

@Public()
@Post('test-jwt-fix')
async testJwtFix() {
  try {
    const testPayload = { sub: 1, email: 'test@school.com', role: 'ADMIN' };
    
    // Test with hardcoded secret
    const token = await this.authService['jwtService'].signAsync(testPayload, {
      secret: 'school-erp-super-secret-jwt-key-2024-min-32-chars-long!',
      expiresIn: '1h'
    });
    
    return { 
      success: true, 
      token,
      message: 'JWT is working with hardcoded secret!' 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      message: 'JWT still failing' 
    };
  }
}
}

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
//   BadRequestException,
//   Query,
//   Logger,
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
// } from '@nestjs/swagger';

// @ApiTags('Auth')
// @ApiBearerAuth('JWT-auth')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Controller('auth')
// export class AuthController {
//   private readonly logger = new Logger(AuthController.name);

//   constructor(private readonly authService: AuthService) {}

//   // --------------------------------------------------
//   // LOGIN
//   // --------------------------------------------------
//   @Public()
//   @Post('login')
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: 'User login', description: 'Authenticate using email or username + password' })
//   @ApiBody({ type: LoginDto })
//   @ApiResponse({ status: HttpStatus.OK, description: 'Login successful' })
//   @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
//   async login(@Body() loginDto: LoginDto) {
//     // AuthService.login will support email OR username.
//     return this.authService.login(loginDto);
//   }

//   // --------------------------------------------------
//   // REGISTER
//   // --------------------------------------------------
//   @Public()
//   @Post('register')
//   @HttpCode(HttpStatus.CREATED)
//   @ApiOperation({ summary: 'Register new user', description: 'Create a new user account' })
//   @ApiBody({ type: RegisterDto })
//   @ApiResponse({ status: HttpStatus.CREATED, description: 'User registered successfully' })
//   @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Username or email already exists' })
//   async register(@Body() registerDto: RegisterDto) {
//     return this.authService.register(registerDto);
//   }

//   // --------------------------------------------------
//   // PROFILE
//   // --------------------------------------------------
//   @Get('profile')
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ summary: 'Get current user profile' })
//   @ApiResponse({ status: HttpStatus.OK, description: 'Profile retrieved successfully' })
//   async getProfile(@Req() req: any) {
//     const userId = this.extractUserIdFromReq(req);
//     return this.authService.getProfile(userId);
//   }

//   // --------------------------------------------------
//   // CHANGE PASSWORD
//   // --------------------------------------------------
//   @Put('change-password')
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ summary: 'Change password', description: 'Change password for the current user' })
//   @ApiBody({ type: ChangePasswordDto })
//   @ApiResponse({ status: HttpStatus.OK, description: 'Password changed successfully' })
//   @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Current password is incorrect' })
//   async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
//     const userId = this.extractUserIdFromReq(req);
//     return this.authService.changePassword(userId, dto);
//   }

//   // --------------------------------------------------
//   // LOGOUT (invalidate current token)
//   // --------------------------------------------------
//   @Post('logout')
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ summary: 'Logout current session' })
//   @ApiResponse({ status: HttpStatus.OK, description: 'Logged out successfully' })
//   async logout(@Req() req: any) {
//     const token = this.getBearerToken(req);
//     return this.authService.logout(token);
//   }

//   // --------------------------------------------------
//   // LOGOUT FROM ALL DEVICES
//   // --------------------------------------------------
//   @Post('logout-all')
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ summary: 'Logout from all devices' })
//   async logoutAll(@Req() req: any) {
//     const userId = this.extractUserIdFromReq(req);
//     return this.authService.logoutAll(userId);
//   }

//   // --------------------------------------------------
//   // GET ACTIVE SESSIONS
//   // --------------------------------------------------
//   @Get('sessions')
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ summary: 'Get active sessions for current user' })
//   async getSessions(@Req() req: any) {
//     const userId = this.extractUserIdFromReq(req);
//     return this.authService.getActiveSessions(userId);
//   }

//   // --------------------------------------------------
//   // REFRESH TOKEN
//   // --------------------------------------------------
//   @Post('refresh-token')
//   @UseGuards(JwtAuthGuard)
//   @ApiOperation({ summary: 'Refresh JWT token' })
//   async refreshToken(@Req() req: any) {
//     const userId = this.extractUserIdFromReq(req);
//     return this.authService.refreshToken(userId);
//   }

//   // --------------------------------------------------
//   // DELETE USER (admin)
//   // --------------------------------------------------
//   @Delete('users/:id')
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles('SUPER_ADMIN', 'ADMIN')
//   @ApiOperation({ summary: 'Delete user by id' })
//   @ApiParam({ name: 'id', required: true })
//   async deleteUser(@Param('id') id: string, @Req() req: any) {
//     const currentUserId = this.extractUserIdFromReq(req);
//     const targetId = parseInt(id, 10);
//     if (isNaN(targetId)) {
//       throw new BadRequestException('Invalid user id');
//     }
//     return this.authService.deleteUser(targetId, currentUserId);
//   }

//   // --------------------------------------------------
//   // ADMIN / SYSTEM UTILITIES (public for setup/debug but safe)
//   // --------------------------------------------------
//   @Public()
//   @Post('setup-roles')
//   @ApiOperation({ summary: 'Create default roles (idempotent) - allowed for setup only' })
//   async setupRoles() {
//     return this.authService.createDefaultRoles();
//   }

//   @Public()
//   @Get('health')
//   @ApiOperation({ summary: 'API health check' })
//   async health() {
//     return this.authService.healthCheck();
//   }

//   // Lightweight debug endpoints (Public) - keep only temporarily
//   @Public()
//   @Post('debug-login')
//   async debugLogin(@Body() loginDto: LoginDto) {
//     // This endpoint intentionally bypasses the structured login flow
//     // Use only in development.
//     return this.authService['debugLogin']
//       ? this.authService['debugLogin'](loginDto)
//       : { error: 'Debug login not implemented on AuthService' };
//   }

//   @Public()
//   @Post('reset-password')
//   async resetPassword(@Body() body: { email: string; newPassword: string }) {
//     if (!body?.email || !body?.newPassword) {
//       throw new BadRequestException('Email and newPassword are required');
//     }

//     // This implementation is intentionally simple: recommended to replace with
//     // proper reset flow using tokens + email for production.
//     return this.authService.resetPassword ? this.authService.resetPassword(body) : this.basicResetPassword(body);
//   }

//   // --------------------------------------------------
//   // HELPERS
//   // --------------------------------------------------
//   private extractUserIdFromReq(req: any): number {
//     // The JWT payload may expose the user id under different keys depending on
//     // how you sign the token (sub, id, userId). Try common places.
//     const user = req?.user || {};
//     const id = user.id || user.userId || user.sub || user?.sub;
//     if (!id) {
//       this.logger.warn('User id missing in request user payload', JSON.stringify(Object.keys(user || {})));
//       throw new BadRequestException('User id not found in token');
//     }
//     const parsed = Number(id);
//     if (isNaN(parsed)) {
//       throw new BadRequestException('Invalid user id in token');
//     }
//     return parsed;
//   }

//   private getBearerToken(req: any): string | null {
//     const header = req?.headers?.authorization || req?.headers?.Authorization;
//     if (!header || typeof header !== 'string') return null;
//     const parts = header.split(' ');
//     if (parts.length !== 2) return null;
//     return parts[1];
//   }

//   private async basicResetPassword(body: { email: string; newPassword: string }) {
//     // Simple reset for development: hash password and update user
//     // NOTE: Use a secure reset flow in production.
//     const bcrypt = await import('bcryptjs');
//     const hash = await bcrypt.hash(body.newPassword, 12);

//     try {
//       const user = await this.authService['prisma'].user.update({
//         where: { email: body.email },
//         data: { passwordHash: hash },
//       });
//       return { message: 'Password reset successfully', user: { email: user.email } };
//     } catch (error) {
//       this.logger.error('Reset password failed', error?.message || error);
//       throw new BadRequestException('Unable to reset password');
//     }
//   }
// }
