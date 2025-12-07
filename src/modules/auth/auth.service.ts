import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException, 
  NotFoundException,
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [{ username }, { email: username }],
          isActive: true,
        },
        include: {
          role: true, // Simplified - remove modulePermissions
        },
      });

      if (user && (await bcrypt.compare(password, user.passwordHash))) {
        const { passwordHash, ...result } = user;
        
        // Temporary empty modules until schema is fixed
        const accessibleModules = [];
        return {
          ...result,
          accessibleModules,
        };
      }
      return null;
    } catch (error) {
      throw new InternalServerErrorException('Authentication service error');
    }
  }

  async validateUserById(userId: number): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: Number(userId), isActive: true },
        include: {
          role: true, // Simplified - remove modulePermissions
        },
      });

      if (user) {
        const { passwordHash, ...result } = user;
        // Temporary empty modules until schema is fixed
        const accessibleModules = [];
        return {
          ...result,
          accessibleModules,
        };
      }
      return null;
    } catch (error) {
      throw new InternalServerErrorException('User validation error');
    }
  }

  async login(loginDto: LoginDto) {
    try {
      console.log(' LOGIN DEBUG START ');
      console.log(' Login attempt for email:', loginDto.email);
      console.log(' Provided password:', loginDto.password);

      const user = await this.prisma.user.findFirst({
        where: { 
          email: loginDto.email,
          isActive: true 
        },
        include: {
          role: true
        }
      });

      console.log(' User query result:', user ? 'FOUND' : 'NOT FOUND');
      
      if (!user) {
        console.log(' USER NOT FOUND IN DATABASE');
        console.log(' LOGIN DEBUG END ');
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log(' User found details:', {
        id: user.id,
        email: user.email,
        hasPasswordHash: !!user.passwordHash,
        passwordHashLength: user.passwordHash?.length,
        isActive: user.isActive,
        role: user.role?.name
      });

      if (!user.passwordHash) {
        console.log(' NO PASSWORD HASH STORED FOR USER');
        console.log(' ========== LOGIN DEBUG END ==========');
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log(' Starting bcrypt comparison...');
      console.log(' Input password:', `"${loginDto.password}"`);
      console.log(' Stored hash length:', user.passwordHash.length);
      console.log(' Stored hash prefix:', user.passwordHash.substring(0, 20) + '...');

      let isPasswordValid = false;
      try {
        console.log(' Calling bcrypt.compare()...');
        isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
        console.log(' Bcrypt.compare() completed without error');
        console.log(' Password validation result:', isPasswordValid);
      } catch (bcryptError) {
        console.error(' Bcrypt comparison error:', bcryptError);
        console.log(' ========== LOGIN DEBUG END ==========');
        throw new UnauthorizedException('Authentication error');
      }

      if (!isPasswordValid) {
        console.log('PASSWORD VALIDATION FAILED');
        console.log(' ========== LOGIN DEBUG END ==========');
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log(' PASSWORD VALIDATION SUCCESSFUL');

      const payload = { 
        sub: user.id, 
        email: user.email,
        role: user.role?.name || 'STUDENT',
        roleId: user.roleId
      };

      console.log(' Generating JWT token...');
      // TEMPORARY FIX - Hardcode JWT secret
      const accessToken = await this.jwtService.signAsync(payload, {
        secret: 'school-erp-super-secret-jwt-key-2024-min-32-chars-long!',
        expiresIn: '24h'
      });
      console.log(' JWT token generated');

      console.log(' Creating user session...');
      await this.prisma.userSession.create({
        data: {
          userId: user.id,
          sessionToken: accessToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          isActive: true,
        },
      });

      await this.createAuditLog({
        userId: user.id,
        action: 'LOGIN',
        entityType: 'USER',
        entityId: user.id,
        description: `User logged in successfully`
      });

      console.log(' LOGIN SUCCESSFUL FOR USER:', user.email);
      console.log(' ========== LOGIN DEBUG END ==========');

      return {
        message: 'Login successful',
        access_token: accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role?.name || 'STUDENT',
          roleId: user.roleId,
          permissions: user.role?.permissions || []
        }
      };

    } catch (error) {
      console.error(' LOGIN PROCESS ERROR:', error);
      console.log(' ========== LOGIN DEBUG END ==========');
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async register(registerDto: RegisterDto) {
    try {
      console.log(' Starting registration for:', registerDto.email);

      const existingUser = await this.prisma.user.findFirst({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      let finalRoleId = registerDto.roleId;
      
      if (finalRoleId) {
        const requestedRole = await this.prisma.role.findUnique({
          where: { id: finalRoleId }
        });
        
        if (!requestedRole) {
          console.log(' Requested role not found, using default STUDENT');
          finalRoleId = null;
        }
      }

      if (!finalRoleId) {
        const studentRole = await this.prisma.role.findFirst({
          where: { name: 'STUDENT' }
        });
        finalRoleId = studentRole?.id || 1;
      }

      const passwordHash = await bcrypt.hash(registerDto.password, 12);

      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          passwordHash: passwordHash,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          username: registerDto.username || registerDto.email,
          phone: registerDto.phone || '',
          roleId: finalRoleId
        },
        include: {
          role: true
        }
      });

      await this.createAuditLog({
        userId: user.id,
        action: 'CREATE',
        entityType: 'USER',
        entityId: user.id,
        description: `User registered with role: ${user.role?.name || 'STUDENT'}`
      });

      console.log(' User created with role:', user.role?.name);

      return {
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          roleId: user.roleId,
          role: user.role?.name
        }
      };

    } catch (error) {
      console.error(' Registration error:', error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async getProfile(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: Number(userId), isActive: true },
        include: {
          role: true, // Simplified - remove modulePermissions
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const { passwordHash, ...result } = user;
      // Temporary empty modules until schema is fixed
      const accessibleModules = [];

      return {
        ...result,
        accessibleModules,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Profile retrieval failed');
    }
  }

  async createDefaultRoles() {
    const defaultRoles = [
      { name: 'SUPER_ADMIN', description: 'Full system access', isSystem: true, permissions: { all: true } },
      { name: 'ADMIN', description: 'Administrator', isSystem: true, permissions: { manage_users: true, manage_content: true } },
      { name: 'TEACHER', description: 'Teacher', isSystem: false, permissions: { manage_students: true, manage_grades: true } },
      { name: 'STUDENT', description: 'Student', isSystem: false, permissions: { view_grades: true, view_courses: true } },
      { name: 'PARENT', description: 'Parent', isSystem: false, permissions: { view_student_info: true } }
    ];

    for (const roleData of defaultRoles) {
      await this.prisma.role.upsert({
        where: { name: roleData.name },
        update: {},
        create: roleData
      });
    }

    console.log(' Default roles created');
    return { message: 'Default roles setup complete' };
  }

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    if (updateProfileDto.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: updateProfileDto.email,
          id: { not: Number(userId) },
        },
      });

      if (existingUser) {
        throw new ConflictException('Email already taken by another user');
      }
    }

    try {
      const user = await this.prisma.user.update({
        where: { id: Number(userId) },
        data: updateProfileDto,
        include: {
          role: true, // Simplified - remove modulePermissions
        },
      });

      const { passwordHash, ...result } = user;
      // Temporary empty modules until schema is fixed
      const accessibleModules = [];

      await this.createAuditLog({
        userId: Number(userId),
        action: 'UPDATE',
        entityType: 'PROFILE',
        entityId: Number(userId),
        description: `Profile updated - Fields: ${Object.keys(updateProfileDto).join(', ')}`
      });

      return {
        message: 'Profile updated successfully',
        user: {
          ...result,
          accessibleModules,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Profile update failed');
    }
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    console.log(" Incoming userId:", userId);
    console.log(" Incoming DTO:", dto);

    let user;
    try {
      user = await this.prisma.user.findUnique({
        where: { id: Number(userId) },
      });
      console.log(" User from DB:", user);
    } catch (err) {
      console.error(" Prisma findUnique failed:", err);
      throw new InternalServerErrorException("DB error while finding user");
    }

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.passwordHash) {
      console.error(" passwordHash IS NULL in the DB");
      throw new UnauthorizedException("Password is not set for this user");
    }

    try {
      const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
      console.log(" Password match result:", isMatch);

      if (!isMatch) {
        throw new UnauthorizedException("Current password is incorrect");
      }
    } catch (err) {
      console.error(" bcrypt.compare failed:", err);
      throw new InternalServerErrorException("Password comparison failed");
    }

    try {
      const rounds = this.configService.get("bcrypt.rounds") || 12;
      console.log(" bcrypt rounds:", rounds);

      const newHash = await bcrypt.hash(dto.newPassword, rounds);
      console.log(" New password hash generated");

      await this.prisma.user.update({
        where: { id: Number(userId) },
        data: { passwordHash: newHash },
      });
      console.log(" Password updated in DB");

      await this.prisma.userSession.updateMany({
        where: { userId: Number(userId), isActive: true },
        data: { isActive: false },
      });
      console.log(" Sessions invalidated");

      await this.createAuditLog({
        userId: Number(userId),
        action: "UPDATE",
        entityType: "PASSWORD",
        entityId: Number(userId),
        description: "Password changed successfully",
      });
      console.log(" Audit log created");

      return { message: "Password changed successfully" };

    } catch (err) {
      console.error(" FINAL ERROR:", err);
      throw new InternalServerErrorException("Password change failed");
    }
  }

  async logout(token: string): Promise<{ message: string }> {
    try {
      console.log(' Logging out with token:', token ? token.substring(0, 20) + '...' : 'No token');
      
      if (!token) {
        console.log(' No token provided for logout');
        return { message: 'Logged out successfully' };
      }

      const result = await this.prisma.userSession.updateMany({
        where: { 
          sessionToken: token,
          isActive: true 
        },
        data: { 
          isActive: false,
        },
      });

      console.log(` Logout successful. Deactivated ${result.count} session(s)`);
      return { message: 'Logged out successfully' };
      
    } catch (error) {
      console.error(' Logout failed:', error);
      return { message: 'Logged out successfully' };
    }
  }

  async logoutAll(userId: number): Promise<{ message: string }> {
    try {
      console.log(' Logging out all sessions for user:', userId);
      
      await this.prisma.userSession.updateMany({
        where: { userId: Number(userId), isActive: true },
        data: { isActive: false },
      });

      await this.createAuditLog({
        userId: Number(userId),
        action: 'LOGOUT_ALL',
        entityType: 'SESSION',
        entityId: Number(userId),
        description: 'Logged out from all devices'
      });

      console.log(' Logout all successful');
      return { message: 'Logged out from all devices' };
    } catch (error) {
      console.error(' Logout all failed:', error);
      throw new InternalServerErrorException('Logout all failed');
    }
  }

  async deleteUser(userId: number, currentUserId: number) {
    if (userId === currentUserId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: Number(userId) },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role.isSystem && ['SUPER_ADMIN', 'ADMIN'].includes(user.role.name.toUpperCase())) {
      throw new BadRequestException('Cannot delete system administrator accounts');
    }

    try {
      await this.prisma.user.update({
        where: { id: Number(userId) },
        data: { isActive: false },
      });

      await this.prisma.userSession.updateMany({
        where: { userId: Number(userId) },
        data: { isActive: false },
      });

      await this.createAuditLog({
        userId: Number(currentUserId),
        action: 'DELETE',
        entityType: 'USER',
        entityId: Number(userId),
        description: `User deleted by admin (ID: ${currentUserId})`
      });

      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException('User deletion failed');
    }
  }

  async getActiveSessions(userId: number) {
    try {
      const sessions = await this.prisma.userSession.findMany({
        where: {
          userId: Number(userId),
          isActive: true,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      return sessions;
    } catch (error) {
      throw new InternalServerErrorException('Sessions retrieval failed');
    }
  }

  async refreshToken(userId: number): Promise<{ access_token: string; token_type: string; expires_in: string }> {
    try {
      console.log(' Refreshing token for user:', userId);
      
      const user = await this.validateUserById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const payload = { 
        sub: user.id, 
        email: user.email,
        role: user.role?.name || 'STUDENT',
        roleId: user.roleId
      };

      const token = await this.jwtService.signAsync(payload);

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await this.prisma.userSession.updateMany({
        where: { 
          userId: Number(userId), 
          isActive: true 
        },
        data: { expiresAt },
      });

      console.log(' Token refreshed successfully');

      return {
        access_token: token,
        token_type: 'Bearer',
        expires_in: '24h',
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new InternalServerErrorException('Token refresh failed');
    }
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



  private async createAuditLog(auditData: {
    userId: number;
    action: string;
    entityType: string;
    entityId: number;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: auditData.userId,
          action: auditData.action,
          entityType: auditData.entityType,
          entityId: auditData.entityId,
          description: auditData.description,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }
}