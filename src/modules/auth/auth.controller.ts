
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
  Logger,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ActivateStudentDto } from './dto/activate-student.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

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
} from '@nestjs/swagger';

@ApiTags('Authentication')
@ApiBearerAuth('JWT-auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  // --------------------------------------------------
  // PUBLIC ENDPOINTS
  // --------------------------------------------------
  @Public()
@Throttle({ default: { limit: 5, ttl: 60 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User login', 
    description: 'Authenticate using email or username + password' 
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Login successful',
    schema: {
      example: {
        message: 'Login successful',
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'superadmin@school.com',
          username: 'superadmin',
          firstName: null,
          lastName: null,
          role: 'SUPER_ADMIN',
          roleId: 1,
          permissions: [
            {
              code: 'USER_CREATE',
              resource: 'user',
              action: 'create',
              scope: 'all'
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
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Email or username is required' 
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Register new user', 
    description: 'Create a new user account' 
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
          email: 'teacher1@school.com',
          firstName: 'John',
          lastName: 'Doe',
          username: 'teacher1',
          roleId: 3,
          role: 'TEACHER'
        }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Email already exists' 
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

// @Post('activate-student/:studentId')
//   activateStudent(
//     @Param('studentId') studentId: string,
//     @Body() dto: ActivateStudentDto,
//   ) {
//     return this.authService.activateStudentAccount(
//       studentId,
//       dto.password,
//     );
//   }

  // --------------------------------------------------
  // PROTECTED ENDPOINTS (Require JWT)
  // --------------------------------------------------
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get current user profile' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Profile retrieved successfully',
    schema: {
      example: {
        id: 1,
        username: 'superadmin',
        email: 'superadmin@school.com',
        firstName: null,
        lastName: null,
        phone: null,
        roleId: 1,
        isActive: true,
        lastLogin: '2025-12-10T18:43:31.830Z',
        createdAt: '2025-12-10T18:43:31.830Z',
        updatedAt: '2025-12-10T18:43:31.830Z',
        role: {
          id: 1,
          name: 'Super Administrator',
          code: 'SUPER_ADMIN',
          description: 'Full system access',
          isSystem: true
        },
        permissions: [
          {
            code: 'USER_CREATE',
            name: 'Create User',
            description: 'Create users',
            resource: 'user',
            action: 'create',
            scope: 'all'
          }
        ]
      }
    }
  })
  async getProfile(@Req() req: any) {
    const userId = this.extractUserIdFromReq(req);
    return this.authService.getProfile(userId);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Update user profile' 
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Profile updated successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Email already taken by another user' 
  })
  async updateProfile(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = this.extractUserIdFromReq(req);
    return this.authService.updateProfile(userId, updateProfileDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Change password' 
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Password changed successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Current password is incorrect' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    const userId = this.extractUserIdFromReq(req);
    return this.authService.changePassword(userId, dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Logout current session' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Logged out successfully' 
  })
  
  async logout(@Req() req: any) {
    const token = this.getBearerToken(req);
    return this.authService.logout(token);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Logout from all devices' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Logged out from all devices' 
  })
  async logoutAll(@Req() req: any) {
    const userId = this.extractUserIdFromReq(req);
    return this.authService.logoutAll(userId);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get active sessions' 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Sessions retrieved successfully' 
  })
  async getSessions(@Req() req: any) {
    const userId = this.extractUserIdFromReq(req);
    return this.authService.getActiveSessions(userId);
  }

  @Post('refresh-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Refresh JWT token' 
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
    const userId = this.extractUserIdFromReq(req);
    return this.authService.refreshToken(userId);
  }

  // --------------------------------------------------
  // ADMIN ENDPOINTS
  // --------------------------------------------------
  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ 
    summary: 'Delete user by ID' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID to delete',
    type: Number 
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User deleted successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Cannot delete your own account or system admin' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found' 
  })
  async deleteUser(@Param('id') id: string, @Req() req: any) {
    const currentUserId = this.extractUserIdFromReq(req);
    const targetId = parseInt(id, 10);
    
    if (isNaN(targetId)) {
      throw new BadRequestException('Invalid user ID');
    }
    
    return this.authService.deleteUser(targetId, currentUserId);
  }


  @Public()
  @Get('debug-info')
  @ApiOperation({ 
    summary: 'Debug information (development only)' 
  })
  async debugInfo() {
    return {
      message: 'Debug endpoint for development',
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || 'development'
    };
  }

  // --------------------------------------------------
  // HELPER METHODS
  // --------------------------------------------------
  private extractUserIdFromReq(req: any): number {
    const user = req?.user || {};
    
    // Try different possible locations for user ID
    const userId = user.id || user.userId || user.sub;
    
    if (!userId) {
      this.logger.warn('User ID not found in request', {
        userKeys: Object.keys(user),
        user: JSON.stringify(user, null, 2)
      });
      throw new BadRequestException('User ID not found in token');
    }
    
    const parsedId = Number(userId);
    if (isNaN(parsedId)) {
      throw new BadRequestException(`Invalid user ID in token: ${userId}`);
    }
    
    return parsedId;
  }

  private getBearerToken(req: any): string | null {
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    
    if (!authHeader || typeof authHeader !== 'string') {
      return null;
    }
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }
}