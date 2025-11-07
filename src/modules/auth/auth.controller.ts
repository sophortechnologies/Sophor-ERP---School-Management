import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RESPONSE_MESSAGES } from '../../common/constants/response-messages.constant';
import { User } from './entities/user.entity';

/**
 * Request interface with user property
 */
interface RequestWithUser extends Request {
  user: User;
}

/**
 * Authentication Controller
 * Handles all authentication endpoints: login, register, profile, logout
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * User Login
   * POST /api/v1/auth/login
   */
  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with email and password, returns JWT tokens',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
    schema: {
      example: {
        success: true,
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'admin@school.com',
            username: 'admin',
            role: 'ADMIN',
            isVerified: true,
            status: 'ACTIVE',
          },
        },
        message: 'Login successful',
        timestamp: '2025-11-06T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or account locked',
    schema: {
      example: {
        success: false,
        error: {
          code: 401,
          message: 'Invalid email or password',
        },
        timestamp: '2025-11-06T10:30:00.000Z',
      },
    },
  })
  async login(@Body() loginDto: LoginDto, @Request() req: RequestWithUser): Promise<AuthResponseDto> {
    return this.authService.login(req.user);
  }

  /**
   * User Registration
   * POST /api/v1/auth/register
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register new user',
    description: 'Create a new user account with specified role',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'newuser@school.com',
          username: 'newuser',
          role: { id: 'role-uuid', name: 'TEACHER', displayName: 'Teacher' },
          status: 'ACTIVE',
          isVerified: false,
          createdAt: '2025-11-06T10:30:00.000Z',
        },
        message: 'User registered successfully',
        timestamp: '2025-11-06T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors',
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists',
  })
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return {
      message: RESPONSE_MESSAGES.REGISTER_SUCCESS,
      data: user,
    };
  }

  /**
   * Get Current User Profile
   * GET /api/v1/auth/profile
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns authenticated user information',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'admin@school.com',
          username: 'admin',
          role: {
            id: 'role-uuid',
            name: 'ADMIN',
            displayName: 'Administrator',
            permissions: ['student:create', 'student:read', 'student:update'],
          },
          status: 'ACTIVE',
          isVerified: true,
          createdAt: '2025-01-01T00:00:00.000Z',
          lastLoginAt: '2025-11-06T10:30:00.000Z',
        },
        timestamp: '2025-11-06T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  /**
   * Refresh Access Token
   * POST /api/v1/auth/refresh
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get new access token using refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      example: {
        success: true,
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        timestamp: '2025-11-06T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  /**
   * Logout
   * POST /api/v1/auth/logout
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User logout',
    description: 'Logout current user (invalidate token)',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      example: {
        success: true,
        message: 'Logout successful',
        timestamp: '2025-11-06T10:30:00.000Z',
      },
    },
  })
  async logout(@CurrentUser('id') userId: string) {
    // TODO: Implement token blacklisting with Redis
    // For now, client should discard the token
    return {
      message: RESPONSE_MESSAGES.LOGOUT_SUCCESS,
    };
  }
}