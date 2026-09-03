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
import { ActivateStudentDto } from './dto/activate-student.dto';
import * as bcrypt from 'bcrypt';
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
    OR: [
      { username },
      { email: username },
    ],
    isActive: true,
  },

        include: {
          role: {
            include: {
              RolePermission: {
                include: {
                  permission: true
                }
              }
            }
          }
        },
      });

      if (user && (await bcrypt.compare(password, user.passwordHash))) {
        const { passwordHash, ...result } = user;
        
        // Extract permissions from the RolePermission relation
        const permissions = user.role?.RolePermission?.map(rp => rp.permission) ?? [];
        
        return {
          ...result,
          permissions,
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
          role: {
            include: {
              RolePermission: {
                include: {
                  permission: true
                }
              }
            }
          }
        },
      });

      if (user) {
        const { passwordHash, ...result } = user;
        const permissions = user.role?.RolePermission?.map(rp => rp.permission) ?? [];
        return {
          ...result,
          permissions,
        };
      }
      return null;
    } catch (error) {
      throw new InternalServerErrorException('User validation error');
    }
  }

  async login(loginDto: LoginDto) {
  try {
    // Check if at least one identifier is provided
    if (!loginDto.email && !loginDto.username) {
      throw new BadRequestException('Email or username is required');
    }

    // Build the where condition for both email and username
    const whereCondition: any = {
      isActive: true,
    };

    if (loginDto.email && loginDto.username) {
      whereCondition.OR = [
        { email: loginDto.email },
        { username: loginDto.username },
      ];
    } else if (loginDto.email) {
      whereCondition.email = loginDto.email;
    } else if (loginDto.username) {
      whereCondition.username = loginDto.username;
    }

    const user = await this.prisma.user.findFirst({
      where: whereCondition,
      include: {
        role: {
          include: {
            RolePermission: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let isValid = false;
    try {
      isValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    } catch (bcryptError) {
      throw new UnauthorizedException('Authentication error');
    }

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password expiry BEFORE issuing token or creating session
    if (user.passwordExpiresAt && user.passwordExpiresAt < new Date()) {
      throw new UnauthorizedException('Password expired. Please reset your password.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role?.name || 'STUDENT',
      roleId: user.roleId
    };

    const accessToken = await this.jwtService.signAsync(payload);

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

    // Extract permissions properly
    const permissions = user.role?.RolePermission?.map(rp => rp.permission) ?? [];

    return {
      message: 'Login successful',
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role?.name || 'STUDENT',
        roleId: user.roleId,
        permissions: permissions
      }
    };

  } catch (error) {
    if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
      throw error;
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}

  private async hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}


  async register(registerDto: RegisterDto) {
    try {
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
          role: {
            include: {
              RolePermission: {
                include: {
                  permission: true
                }
              }
            }
          }
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const { passwordHash, ...result } = user;
      const permissions = user.role?.RolePermission?.map(rp => rp.permission) ?? [];

      return {
        ...result,
        permissions,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Profile retrieval failed');
    }
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
          role: {
            include: {
              RolePermission: {
                include: {
                  permission: true
                }
              }
            }
          }
        },
      });

      const { passwordHash, ...result } = user;
      const permissions = user.role?.RolePermission?.map(rp => rp.permission) ?? [];

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
          permissions,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Profile update failed');
    }
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    let user;
    try {
      user = await this.prisma.user.findUnique({
        where: { id: Number(userId) },
      });
    } catch (err) {
      throw new InternalServerErrorException("DB error while finding user");
    }

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException("Password is not set for this user");
    }

    try {
      const isMatch = await bcrypt.compare(dto.oldPassword, user.passwordHash);

      if (!isMatch) {
        throw new UnauthorizedException("Current password is incorrect");
      }
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException("Password comparison failed");
    }

    try {
      const rounds = this.configService.get("bcrypt.rounds") || 12;
      const newHash = await bcrypt.hash(dto.newPassword, rounds);

      await this.prisma.user.update({
        where: { id: Number(userId) },
        data: { passwordHash: newHash },
      });

      await this.prisma.userSession.updateMany({
        where: { userId: Number(userId), isActive: true },
        data: { isActive: false },
      });

      await this.createAuditLog({
        userId: Number(userId),
        action: "UPDATE",
        entityType: "PASSWORD",
        entityId: Number(userId),
        description: "Password changed successfully",
      });

      return { message: "Password changed successfully" };

    } catch (err) {
      throw new InternalServerErrorException("Password change failed");
    }
  }

  async logout(token: string): Promise<{ message: string }> {
    try {
      if (!token) {
        return { message: 'Logged out successfully' };
      }

      await this.prisma.userSession.updateMany({
        where: { sessionToken: token, isActive: true },
        data: { isActive: false },
      });

      return { message: 'Logged out successfully' };
    } catch (error) {
      return { message: 'Logged out successfully' };
    }
  }

  async logoutAll(userId: number): Promise<{ message: string }> {
    try {
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

      return { message: 'Logged out from all devices' };
    } catch (error) {
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
        where: { userId: Number(userId), isActive: true },
        data: { expiresAt },
      });

      return {
        access_token: token,
        token_type: 'Bearer',
        expires_in: '24h',
      };
    } catch (error) {
      throw new InternalServerErrorException('Token refresh failed');
    }
  }



  async createDefaultRoles() {
    const defaultRoles = [
      { 
        name: 'SUPER_ADMIN', 
        code: 'SUPER_ADMIN',
        description: 'Full system access', 
        isSystem: true, 
        permissions: { all: true } 
      },
      { 
        name: 'ADMIN', 
        code: 'ADMIN',
        description: 'Administrator', 
        isSystem: true, 
        permissions: { manage_users: true, manage_content: true } 
      },
      { 
        name: 'TEACHER', 
        code: 'TEACHER',
        description: 'Teacher', 
        isSystem: false, 
        permissions: { manage_students: true, manage_grades: true } 
      },
      { 
        name: 'STUDENT', 
        code: 'STUDENT',
        description: 'Student', 
        isSystem: false, 
        permissions: { view_grades: true, view_courses: true } 
      },
      { 
        name: 'PARENT', 
        code: 'PARENT',
        description: 'Parent', 
        isSystem: false, 
        permissions: { view_student_info: true } 
      }
    ];

    for (const roleData of defaultRoles) {
      await this.prisma.role.upsert({
        where: { name: roleData.name },
        update: {},
        create: roleData
      });
    }

    console.log('✅ Default roles created');
    return { message: 'Default roles setup complete' };
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
