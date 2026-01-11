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
import { StudentLoginDto } from '../students/dto/student-login.dto'; // Add this if needed

@Injectable()
export class AuthService {
  
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    try {
      // const user = await this.prisma.user.findFirst({
      //   where: {
      //     OR: [{ username }, { email: username }],
      //     isActive: true,
      //   },

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
    console.log('========== LOGIN DEBUG START ==========');
    
    // Check if at least one identifier is provided
    if (!loginDto.email && !loginDto.username) {
      throw new BadRequestException('Email or username is required');
    }

    console.log('Login attempt for:', loginDto.email || loginDto.username);

    // Build the where condition for both email and username
    const whereCondition: any = {
      isActive: true,
    };

    if (loginDto.email && loginDto.username) {
      // If both provided, try both
      whereCondition.OR = [
        { email: loginDto.email },
        { username: loginDto.username },
      ];
    } else if (loginDto.email) {
      // If only email provided
      whereCondition.email = loginDto.email;
    } else if (loginDto.username) {
      // If only username provided
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

    console.log('User query result:', user ? 'FOUND' : 'NOT FOUND');
    
    if (!user) {
      console.log('USER NOT FOUND IN DATABASE');
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    if (!user.passwordHash) {
      console.log('NO PASSWORD HASH STORED FOR USER');
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('Starting bcrypt comparison...');
    let isValid = false;
    try {
      isValid = await bcrypt.compare(loginDto.password, user.passwordHash);
      console.log('Password validation result:', isValid);
    } catch (bcryptError) {
      console.error('Bcrypt comparison error:', bcryptError);
      throw new UnauthorizedException('Authentication error');
    }

    if (!isValid) {
      console.log('PASSWORD VALIDATION FAILED');
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('PASSWORD VALIDATION SUCCESSFUL');

    const payload = { 
      sub: user.id, 
      email: user.email,
      username: user.username,
      role: user.role?.name || 'STUDENT',
      roleId: user.roleId
    };

    console.log('Generating JWT token...');
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: 'school-erp-super-secret-jwt-key-2024-min-32-chars-long!',
      expiresIn: '24h'
    });

    console.log('JWT token generated');
    console.log('Creating user session...');
    
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

    console.log('LOGIN SUCCESSFUL FOR USER:', user.email);
    console.log('========== LOGIN DEBUG END ==========');

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
    console.error('LOGIN PROCESS ERROR:', error);
    console.log('========== LOGIN DEBUG END ==========');
    
    if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
      throw error;
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}

  // async login(loginDto: LoginDto) {
  //   try {
  //     console.log('========== LOGIN DEBUG START ==========');
  //     console.log('Login attempt for email:', loginDto.email);

  //     const user = await this.prisma.user.findFirst({
  //       where: { 
  //         email: loginDto.email,
  //         isActive: true 
  //       },
  //       include: {
  //         role: {
  //           include: {
  //             RolePermission: {
  //               include: {
  //                 permission: true
  //               }
  //             }
  //           }
  //         }
  //       }
  //     });

  //     console.log('User query result:', user ? 'FOUND' : 'NOT FOUND');
      
  //     if (!user) {
  //       console.log('USER NOT FOUND IN DATABASE');
  //       throw new UnauthorizedException('Invalid credentials');
  //     }

  //     // Check password
  //     if (!user.passwordHash) {
  //       console.log('NO PASSWORD HASH STORED FOR USER');
  //       throw new UnauthorizedException('Invalid credentials');
  //     }

  //     console.log('Starting bcrypt comparison...');
  //     let isValid = false;
  //     try {
  //       isValid = await bcrypt.compare(loginDto.password, user.passwordHash);
  //       console.log('Password validation result:', isValid);
  //     } catch (bcryptError) {
  //       console.error('Bcrypt comparison error:', bcryptError);
  //       throw new UnauthorizedException('Authentication error');
  //     }

  //     // FIXED: Changed from isPasswordValid to isValid
  //     if (!isValid) {
  //       console.log('PASSWORD VALIDATION FAILED');
  //       throw new UnauthorizedException('Invalid credentials');
  //     }

  //     console.log('PASSWORD VALIDATION SUCCESSFUL');

  //     const payload = { 
  //       sub: user.id, 
  //       email: user.email,
  //       role: user.role?.name || 'STUDENT',
  //       roleId: user.roleId
  //     };

  //     console.log('Generating JWT token...');
  //     const accessToken = await this.jwtService.signAsync(payload, {
  //       secret: 'school-erp-super-secret-jwt-key-2024-min-32-chars-long!',
  //       expiresIn: '24h'
  //     });

  //     console.log('JWT token generated');
  //     console.log('Creating user session...');
      
  //     await this.prisma.userSession.create({
  //       data: {
  //         userId: user.id,
  //         sessionToken: accessToken,
  //         expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  //         isActive: true,
  //       },
  //     });

  //     await this.createAuditLog({
  //       userId: user.id,
  //       action: 'LOGIN',
  //       entityType: 'USER',
  //       entityId: user.id,
  //       description: `User logged in successfully`
  //     });

  //     console.log('LOGIN SUCCESSFUL FOR USER:', user.email);
  //     console.log('========== LOGIN DEBUG END ==========');

  //     // Extract permissions properly
  //     const permissions = user.role?.RolePermission?.map(rp => rp.permission) ?? [];

  //     return {
  //       message: 'Login successful',
  //       access_token: accessToken,
  //       user: {
  //         id: user.id,
  //         email: user.email,
  //         firstName: user.firstName,
  //         lastName: user.lastName,
  //         role: user.role?.name || 'STUDENT',
  //         roleId: user.roleId,
  //         permissions: permissions
  //       }
  //     };

  //   } catch (error) {
  //     console.error('LOGIN PROCESS ERROR:', error);
  //     console.log('========== LOGIN DEBUG END ==========');
      
  //     if (error instanceof UnauthorizedException) {
  //       throw error;
  //     }
  //     throw new UnauthorizedException('Invalid credentials');
  //   }
  // }

  private async hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}
async activateStudentAccount(studentId: string, password: string) {
  // 1️⃣ Find student with linked user
  const student = await this.prisma.student.findUnique({
    where: { studentId },
    include: { user: true },
  });

  if (!student || !student.user) {
    throw new NotFoundException('Student or user not found');
  }

  if (student.user.isActive) {
    throw new BadRequestException('Account already activated');
  }

  // 2️⃣ Hash password (NO authService.hashPassword ❌)
  const passwordHash = await bcrypt.hash(password, 10);

  // 3️⃣ Activate user
  await this.prisma.user.update({
    where: { id: student.userId },
    data: {
      passwordHash,
      isActive: true,
    },
  });

  // 4️⃣ Update student status
  await this.prisma.student.update({
    where: { id: student.id },
    data: {
      status: 'ACTIVE',
    },
  });

  return {
    message: 'Student account activated successfully',
    username: student.user.username,
  };
}


  async register(registerDto: RegisterDto) {
    try {
      console.log('Starting registration for:', registerDto.email);

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
          console.log('Requested role not found, using default STUDENT');
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

      console.log('User created with role:', user.role?.name);

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
      console.error('Registration error:', error);
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
    console.log("Incoming userId:", userId);
    console.log("Incoming DTO:", dto);

    let user;
    try {
      user = await this.prisma.user.findUnique({
        where: { id: Number(userId) },
      });
      console.log("User from DB:", user);
    } catch (err) {
      console.error("Prisma findUnique failed:", err);
      throw new InternalServerErrorException("DB error while finding user");
    }

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.passwordHash) {
      console.error("passwordHash IS NULL in the DB");
      throw new UnauthorizedException("Password is not set for this user");
    }

    try {
      const isMatch = await bcrypt.compare(dto.oldPassword, user.passwordHash);
      console.log("Password match result:", isMatch);

      if (!isMatch) {
        throw new UnauthorizedException("Current password is incorrect");
      }
    } catch (err) {
      console.error("bcrypt.compare failed:", err);
      throw new InternalServerErrorException("Password comparison failed");
    }

    try {
      const rounds = this.configService.get("bcrypt.rounds") || 12;
      console.log("bcrypt rounds:", rounds);

      const newHash = await bcrypt.hash(dto.newPassword, rounds);
      console.log("New password hash generated");

      await this.prisma.user.update({
        where: { id: Number(userId) },
        data: { passwordHash: newHash },
      });
      console.log("Password updated in DB");

      await this.prisma.userSession.updateMany({
        where: { userId: Number(userId), isActive: true },
        data: { isActive: false },
      });
      console.log("Sessions invalidated");

      await this.createAuditLog({
        userId: Number(userId),
        action: "UPDATE",
        entityType: "PASSWORD",
        entityId: Number(userId),
        description: "Password changed successfully",
      });
      console.log("Audit log created");

      return { message: "Password changed successfully" };

    } catch (err) {
      console.error("FINAL ERROR:", err);
      throw new InternalServerErrorException("Password change failed");
    }
  }

  async logout(token: string): Promise<{ message: string }> {
    try {
      console.log('Logging out with token:', token ? token.substring(0, 20) + '...' : 'No token');
      
      if (!token) {
        console.log('No token provided for logout');
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

      console.log(`Logout successful. Deactivated ${result.count} session(s)`);
      return { message: 'Logged out successfully' };
      
    } catch (error) {
      console.error('Logout failed:', error);
      return { message: 'Logged out successfully' };
    }
  }

  async logoutAll(userId: number): Promise<{ message: string }> {
    try {
      console.log('Logging out all sessions for user:', userId);
      
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

      console.log('Logout all successful');
      return { message: 'Logged out from all devices' };
    } catch (error) {
      console.error('Logout all failed:', error);
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
      console.log('Refreshing token for user:', userId);
      
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

      console.log('Token refreshed successfully');

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


// import { 
//   Injectable, 
//   UnauthorizedException, 
//   ConflictException, 
//   NotFoundException,
//   BadRequestException,
//   InternalServerErrorException,
//   Logger
// } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { PrismaService } from '../../database/prisma.service';
// import { LoginDto } from './dto/login.dto';
// import { RegisterDto } from './dto/register.dto';
// import { UpdateProfileDto } from './dto/update-profile.dto';
// import { ChangePasswordDto } from './dto/change-password.dto';
// import * as bcrypt from 'bcrypt';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class AuthService {
//   private readonly logger = new Logger(AuthService.name);
  
//   constructor(
//     private prisma: PrismaService,
//     private jwtService: JwtService,
//     private configService: ConfigService,
//   ) {}

//   /**
//    * Validate user by username/email and password
//    * Used by LocalStrategy
//    */
//   async validateUser(identifier: string, password: string): Promise<any> {
//     try {
//       const user = await this.prisma.user.findFirst({
//         where: {
//           OR: [{ username: identifier }, { email: identifier }],
//           isActive: true,
//         },
//         include: {
//           role: {
//             include: {
//               RolePermission: {
//                 include: { permission: true }
//               }
//             }
//           }
//         },
//       });

//       if (user && (await bcrypt.compare(password, user.passwordHash))) {
//         const { passwordHash, ...result } = user;
//         const permissions = user.role?.RolePermission?.map(rp => rp.permission) ?? [];
        
//         return {
//           ...result,
//           permissions,
//         };
//       }
//       return null;
//     } catch (error) {
//       this.logger.error(`Validation error: ${error.message}`, error.stack);
//       throw new InternalServerErrorException('Authentication service error');
//     }
//   }

//   /**
//    * Validate user by ID
//    * Used for JWT validation
//    */
//   async validateUserById(userId: number): Promise<any> {
//   try {
//     const user = await this.prisma.user.findUnique({
//       where: { id: Number(userId), isActive: true },
//       include: {
//         role: {
//           include: {
//             RolePermission: {
//               include: { 
//                 permission: {
//                   select: {
//                     id: true,
//                     code: true,
//                     name: true,
//                     resource: true,
//                     action: true,
//                     scope: true,
//                     description: true,
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
//     });

//     if (!user) {
//       return null;
//     }

//     const { passwordHash, ...result } = user;
//     const permissions = user.role?.RolePermission?.map(rp => rp.permission) || [];
    
//     return {
//       ...result,
//       role: user.role?.code || 'STUDENT', // Return CODE here too
//       roleId: user.roleId,
//       permissions: permissions.map(p => ({
//         code: p.code,
//         resource: p.resource,
//         action: p.action,
//         scope: p.scope,
//       }))
//     };
//   } catch (error) {
//     this.logger.error(`User validation error: ${error.message}`, error.stack);
//     throw new InternalServerErrorException('User validation error');
//   }
// }

//   /**
//    * Login user with email or username
//    */
//   // async login(loginDto: LoginDto) {
//   //   try {
//   //     this.logger.log(`Login attempt for: ${loginDto.email || loginDto.username}`);
      
//   //     // Validate input
//   //     if (!loginDto.email && !loginDto.username) {
//   //       throw new BadRequestException('Email or username is required');
//   //     }

//   //     // Build query condition
//   //     const whereCondition: any = { isActive: true };
      
//   //     if (loginDto.email && loginDto.username) {
//   //       whereCondition.OR = [
//   //         { email: loginDto.email },
//   //         { username: loginDto.username },
//   //       ];
//   //     } else if (loginDto.email) {
//   //       whereCondition.email = loginDto.email;
//   //     } else if (loginDto.username) {
//   //       whereCondition.username = loginDto.username;
//   //     }

//   //     // Find user
//   //     const user = await this.prisma.user.findFirst({
//   //       where: whereCondition,
//   //       include: {
//   //         role: {
//   //           include: {
//   //             RolePermission: {
//   //               include: { permission: true }
//   //             }
//   //           }
//   //         }
//   //       }
//   //     });

//   //     if (!user) {
//   //       this.logger.warn(`User not found: ${loginDto.email || loginDto.username}`);
//   //       throw new UnauthorizedException('Invalid credentials');
//   //     }

//   //     // Validate password
//   //     if (!user.passwordHash) {
//   //       this.logger.warn(`No password hash for user: ${user.email}`);
//   //       throw new UnauthorizedException('Invalid credentials');
//   //     }

//   //     const isValid = await bcrypt.compare(loginDto.password, user.passwordHash);
//   //     if (!isValid) {
//   //       this.logger.warn(`Invalid password for user: ${user.email}`);
//   //       throw new UnauthorizedException('Invalid credentials');
//   //     }

//   //     // Generate JWT token - IMPORTANT: Use role CODE, not name
//   //     const payload = { 
//   //       sub: user.id, 
//   //       email: user.email,
//   //       username: user.username,
//   //       role: user.role?.code || 'STUDENT', // Use CODE for consistency with @Roles decorator
//   //       roleId: user.roleId
//   //     };

//   //     const accessToken = await this.jwtService.signAsync(payload, {
//   //       secret: this.configService.get<string>('JWT_SECRET') || 'school-erp-super-secret-jwt-key-2024-min-32-chars-long!',
//   //       expiresIn: '24h'
//   //     });

//   //     // Create session
//   //     await this.prisma.userSession.create({
//   //       data: {
//   //         userId: user.id,
//   //         sessionToken: accessToken,
//   //         expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
//   //         isActive: true,
//   //       },
//   //     });

//   //     // Audit log
//   //     await this.createAuditLog({
//   //       userId: user.id,
//   //       action: 'LOGIN',
//   //       entityType: 'USER',
//   //       entityId: user.id,
//   //       description: `User logged in successfully`
//   //     });

//   //     // Extract permissions
//   //     const permissions = user.role?.RolePermission?.map(rp => rp.permission) ?? [];

//   //     this.logger.log(`Login successful for user: ${user.email}`);
      
//   //     return {
//   //       message: 'Login successful',
//   //       access_token: accessToken,
//   //       user: {
//   //         id: user.id,
//   //         email: user.email,
//   //         username: user.username,
//   //         firstName: user.firstName,
//   //         lastName: user.lastName,
//   //         role: user.role?.code || 'STUDENT', // Use CODE
//   //         roleId: user.roleId,
//   //         permissions: permissions
//   //       }
//   //     };

//   //   } catch (error) {
//   //     this.logger.error(`Login error: ${error.message}`, error.stack);
      
//   //     if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
//   //       throw error;
//   //     }
//   //     throw new UnauthorizedException('Invalid credentials');
//   //   }
//   // }

//   // src/modules/auth/auth.service.ts - Updated login method
// async login(loginDto: LoginDto) {
//   try {
//     this.logger.log(`Login attempt for: ${loginDto.email || loginDto.username}`);

//     // Validate input
//     if (!loginDto.email && !loginDto.username) {
//       throw new BadRequestException('Email or username is required');
//     }

//     // Build query condition
//     const whereCondition: any = { isActive: true };
    
//     if (loginDto.email && loginDto.username) {
//       whereCondition.OR = [
//         { email: loginDto.email },
//         { username: loginDto.username },
//       ];
//     } else if (loginDto.email) {
//       whereCondition.email = loginDto.email;
//     } else if (loginDto.username) {
//       whereCondition.username = loginDto.username;
//     }

//     // Find user with ALL necessary relations
//     const user = await this.prisma.user.findFirst({
//       where: whereCondition,
//       include: {
//         role: {
//           include: {
//             RolePermission: {
//               include: { 
//                 permission: {
//                   select: {
//                     id: true,
//                     code: true,
//                     name: true,
//                     resource: true,
//                     action: true,
//                     scope: true,
//                     description: true,
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     });

//     if (!user) {
//       this.logger.warn(`User not found: ${loginDto.email || loginDto.username}`);
//       throw new UnauthorizedException('Invalid credentials');
//     }

//     // Validate password
//     if (!user.passwordHash) {
//       this.logger.warn(`No password hash for user: ${user.email}`);
//       throw new UnauthorizedException('Invalid credentials');
//     }

//     const isValid = await bcrypt.compare(loginDto.password, user.passwordHash);
//     if (!isValid) {
//       this.logger.warn(`Invalid password for user: ${user.email}`);
//       throw new UnauthorizedException('Invalid credentials');
//     }

//     // CRITICAL: Get role CODE, not name
//     const roleCode = user.role?.code || 'STUDENT';
    
//     // Extract permissions
//     const permissions = user.role?.RolePermission?.map(rp => rp.permission) || [];

//     // Log for debugging
//     this.logger.debug(`User ${user.email} has role: ${roleCode} (name: ${user.role?.name})`);
//     this.logger.debug(`Permissions count: ${permissions.length}`);

//     // Generate JWT payload with role CODE
//     const payload = { 
//       sub: user.id, 
//       email: user.email,
//       username: user.username,
//       role: roleCode, // ← This MUST be the role CODE like "SUPER_ADMIN"
//       roleId: user.roleId,
//       permissions: permissions.map(p => ({
//         code: p.code,
//         resource: p.resource,
//         action: p.action,
//         scope: p.scope,
//       }))
//     };

//     // Log the payload for debugging
//     console.log('JWT Payload being generated:', JSON.stringify(payload, null, 2));

//     const accessToken = await this.jwtService.signAsync(payload, {
//       secret: this.configService.get<string>('JWT_SECRET') || 'school-erp-super-secret-jwt-key-2024-min-32-chars-long!',
//       expiresIn: '24h'
//     });

//     // Create session
//     await this.prisma.userSession.create({
//       data: {
//         userId: user.id,
//         sessionToken: accessToken,
//         expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
//         isActive: true,
//       },
//     });

//     // Update last login
//     await this.prisma.user.update({
//       where: { id: user.id },
//       data: { lastLogin: new Date() }
//     });

//     // Audit log
//     await this.createAuditLog({
//       userId: user.id,
//       action: 'LOGIN',
//       entityType: 'USER',
//       entityId: user.id,
//       description: `User logged in successfully with role: ${roleCode}`
//     });

//     this.logger.log(`Login successful for user: ${user.email} with role: ${roleCode}`);
    
//     return {
//       message: 'Login successful',
//       access_token: accessToken,
//       user: {
//         id: user.id,
//         email: user.email,
//         username: user.username,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         role: roleCode, // Return CODE in response too
//         roleId: user.roleId,
//         permissions: permissions.map(p => ({
//           code: p.code,
//           resource: p.resource,
//           action: p.action,
//           scope: p.scope,
//         }))
//       }
//     };

//   } catch (error) {
//     this.logger.error(`Login error: ${error.message}`, error.stack);
    
//     if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
//       throw error;
//     }
//     throw new UnauthorizedException('Invalid credentials');
//   }
// }

//   /**
//    * Register new user
//    */
//   async register(registerDto: RegisterDto) {
//     try {
//       this.logger.log(`Registration attempt for: ${registerDto.email}`);

//       // Check existing user
//       const existingUser = await this.prisma.user.findFirst({
//         where: { email: registerDto.email },
//       });

//       if (existingUser) {
//         throw new ConflictException('Email already exists');
//       }

//       // Validate and set role
//       let finalRoleId = registerDto.roleId;
      
//       if (finalRoleId) {
//         const requestedRole = await this.prisma.role.findUnique({
//           where: { id: finalRoleId }
//         });
        
//         if (!requestedRole) {
//           this.logger.warn(`Requested role ${finalRoleId} not found, using default STUDENT`);
//           finalRoleId = null;
//         }
//       }

//       if (!finalRoleId) {
//         const studentRole = await this.prisma.role.findFirst({
//           where: { name: 'STUDENT' }
//         });
//         finalRoleId = studentRole?.id || 1;
//       }

//       // Hash password
//       const passwordHash = await bcrypt.hash(registerDto.password, 12);

//       // Create user
//       const user = await this.prisma.user.create({
//         data: {
//           email: registerDto.email,
//           passwordHash: passwordHash,
//           firstName: registerDto.firstName,
//           lastName: registerDto.lastName,
//           username: registerDto.username || registerDto.email,
//           phone: registerDto.phone || '',
//           roleId: finalRoleId
//         },
//         include: { role: true }
//       });

//       // Audit log
//       await this.createAuditLog({
//         userId: user.id,
//         action: 'CREATE',
//         entityType: 'USER',
//         entityId: user.id,
//         description: `User registered with role: ${user.role?.name || 'STUDENT'}`
//       });

//       this.logger.log(`User created: ${user.email} with role: ${user.role?.name}`);

//       return {
//         message: 'User registered successfully',
//         user: {
//           id: user.id,
//           email: user.email,
//           firstName: user.firstName,
//           lastName: user.lastName,
//           username: user.username,
//           roleId: user.roleId,
//           role: user.role?.code // Use CODE
//         }
//       };

//     } catch (error) {
//       this.logger.error(`Registration error: ${error.message}`, error.stack);
//       if (error instanceof ConflictException) {
//         throw error;
//       }
//       throw new InternalServerErrorException('Registration failed');
//     }
//   }

//   /**
//    * Get user profile
//    */
//   async getProfile(userId: number) {
//     try {
//       const user = await this.prisma.user.findUnique({
//         where: { id: Number(userId), isActive: true },
//         include: {
//           role: {
//             include: {
//               RolePermission: {
//                 include: { permission: true }
//               }
//             }
//           }
//         },
//       });

//       if (!user) {
//         throw new NotFoundException('User not found');
//       }

//       const { passwordHash, ...result } = user;
//       const permissions = user.role?.RolePermission?.map(rp => rp.permission) ?? [];

//       return {
//         ...result,
//         permissions,
//         role: {
//           ...result.role,
//           code: result.role?.code || 'STUDENT' // Include role code
//         }
//       };
//     } catch (error) {
//       this.logger.error(`Profile retrieval error: ${error.message}`, error.stack);
//       if (error instanceof NotFoundException) {
//         throw error;
//       }
//       throw new InternalServerErrorException('Profile retrieval failed');
//     }
//   }

//   /**
//    * Update user profile
//    */
//   async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
//     try {
//       // Check email uniqueness
//       if (updateProfileDto.email) {
//         const existingUser = await this.prisma.user.findFirst({
//           where: {
//             email: updateProfileDto.email,
//             id: { not: Number(userId) },
//           },
//         });

//         if (existingUser) {
//           throw new ConflictException('Email already taken by another user');
//         }
//       }

//       const user = await this.prisma.user.update({
//         where: { id: Number(userId) },
//         data: updateProfileDto,
//         include: {
//           role: {
//             include: {
//               RolePermission: {
//                 include: { permission: true }
//               }
//             }
//           }
//         },
//       });

//       const { passwordHash, ...result } = user;
//       const permissions = user.role?.RolePermission?.map(rp => rp.permission) ?? [];

//       // Audit log
//       await this.createAuditLog({
//         userId: Number(userId),
//         action: 'UPDATE',
//         entityType: 'PROFILE',
//         entityId: Number(userId),
//         description: `Profile updated - Fields: ${Object.keys(updateProfileDto).join(', ')}`
//       });

//       this.logger.log(`Profile updated for user ID: ${userId}`);

//       return {
//         message: 'Profile updated successfully',
//         user: {
//           ...result,
//           permissions,
//         },
//       };
//     } catch (error) {
//       this.logger.error(`Profile update error: ${error.message}`, error.stack);
//       if (error instanceof ConflictException) {
//         throw error;
//       }
//       throw new InternalServerErrorException('Profile update failed');
//     }
//   }

//   async changePassword(userId: number, dto: ChangePasswordDto) {
//   try {
//     this.logger.log(`Password change request for user ID: ${userId}`);

//     // Get user
//     const user = await this.prisma.user.findUnique({
//       where: { id: Number(userId) },
//     });

//     if (!user) {
//       throw new NotFoundException("User not found");
//     }

//     if (!user.passwordHash) {
//       throw new UnauthorizedException("Password is not set for this user");
//     }

//     // Verify current password
//     const isMatch = await bcrypt.compare(dto.oldPassword, user.passwordHash);
//     if (!isMatch) {
//       throw new UnauthorizedException("Current password is incorrect");
//     }

//     // Hash new password
//     const rounds = this.configService.get<number>("bcrypt.rounds") || 12;
//     const newHash = await bcrypt.hash(dto.newPassword, rounds);

//     // Update password
//     await this.prisma.user.update({
//       where: { id: Number(userId) },
//       data: { passwordHash: newHash },
//     });

//     // Invalidate all sessions
//     await this.prisma.userSession.updateMany({
//       where: { userId: Number(userId), isActive: true },
//       data: { isActive: false },
//     });

//     // Audit log
//     await this.createAuditLog({
//       userId: Number(userId),
//       action: "UPDATE",
//       entityType: "PASSWORD",
//       entityId: Number(userId),
//       description: "Password changed successfully",
//     });

//     this.logger.log(`Password changed successfully for user ID: ${userId}`);

//     return { message: "Password changed successfully" };

//   } catch (error) {
//     this.logger.error(`Password change error: ${error.message}`, error.stack);
//     if (
//       error instanceof NotFoundException || 
//       error instanceof UnauthorizedException
//     ) {
//       throw error;
//     }
//     throw new InternalServerErrorException("Password change failed");
//   }
// }
//   /**
//    * Change user password
//    */
//   // async changePassword(userId: number, dto: ChangePasswordDto) {
//   //   try {
//   //     this.logger.log(`Password change request for user ID: ${userId}`);

//   //     // Validate input
//   //     if (dto.newPassword !== dto.confirmPassword) {
//   //       throw new BadRequestException('New password and confirmation do not match');
//   //     }

//   //     // Get user
//   //     const user = await this.prisma.user.findUnique({
//   //       where: { id: Number(userId) },
//   //     });

//   //     if (!user) {
//   //       throw new NotFoundException("User not found");
//   //     }

//   //     if (!user.passwordHash) {
//   //       throw new UnauthorizedException("Password is not set for this user");
//   //     }

//   //     // Verify current password
//   //     const isMatch = await bcrypt.compare(dto.oldPassword, user.passwordHash);
//   //     if (!isMatch) {
//   //       throw new UnauthorizedException("Current password is incorrect");
//   //     }

//   //     // Hash new password
//   //     const rounds = this.configService.get<number>("bcrypt.rounds") || 12;
//   //     const newHash = await bcrypt.hash(dto.newPassword, rounds);

//   //     // Update password
//   //     await this.prisma.user.update({
//   //       where: { id: Number(userId) },
//   //       data: { passwordHash: newHash },
//   //     });

//   //     // Invalidate all sessions
//   //     await this.prisma.userSession.updateMany({
//   //       where: { userId: Number(userId), isActive: true },
//   //       data: { isActive: false },
//   //     });

//   //     // Audit log
//   //     await this.createAuditLog({
//   //       userId: Number(userId),
//   //       action: "UPDATE",
//   //       entityType: "PASSWORD",
//   //       entityId: Number(userId),
//   //       description: "Password changed successfully",
//   //     });

//   //     this.logger.log(`Password changed successfully for user ID: ${userId}`);

//   //     return { message: "Password changed successfully" };

//   //   } catch (error) {
//   //     this.logger.error(`Password change error: ${error.message}`, error.stack);
//   //     if (
//   //       error instanceof NotFoundException || 
//   //       error instanceof UnauthorizedException ||
//   //       error instanceof BadRequestException
//   //     ) {
//   //       throw error;
//   //     }
//   //     throw new InternalServerErrorException("Password change failed");
//   //   }
//   // }

//   /**
//    * Logout user (invalidate current session)
//    */
//   async logout(token: string): Promise<{ message: string }> {
//     try {
//       if (!token) {
//         return { message: 'Logged out successfully' };
//       }

//       const result = await this.prisma.userSession.updateMany({
//         where: { 
//           sessionToken: token,
//           isActive: true 
//         },
//         data: { isActive: false },
//       });

//       this.logger.log(`Logged out ${result.count} session(s)`);
//       return { message: 'Logged out successfully' };
      
//     } catch (error) {
//       this.logger.error(`Logout error: ${error.message}`, error.stack);
//       return { message: 'Logged out successfully' };
//     }
//   }

//   /**
//    * Logout from all devices
//    */
//   async logoutAll(userId: number): Promise<{ message: string }> {
//     try {
//       await this.prisma.userSession.updateMany({
//         where: { userId: Number(userId), isActive: true },
//         data: { isActive: false },
//       });

//       await this.createAuditLog({
//         userId: Number(userId),
//         action: 'LOGOUT_ALL',
//         entityType: 'SESSION',
//         entityId: Number(userId),
//         description: 'Logged out from all devices'
//       });

//       this.logger.log(`Logged out all sessions for user ID: ${userId}`);
//       return { message: 'Logged out from all devices' };
//     } catch (error) {
//       this.logger.error(`Logout all error: ${error.message}`, error.stack);
//       throw new InternalServerErrorException('Logout all failed');
//     }
//   }

//   /**
//    * Delete user account (admin only)
//    */
//   async deleteUser(userId: number, currentUserId: number) {
//     if (userId === currentUserId) {
//       throw new BadRequestException('You cannot delete your own account');
//     }

//     const user = await this.prisma.user.findUnique({
//       where: { id: Number(userId) },
//       include: { role: true },
//     });

//     if (!user) {
//       throw new NotFoundException('User not found');
//     }

//     if (user.role.isSystem && ['SUPER_ADMIN', 'ADMIN'].includes(user.role.code || '')) {
//       throw new BadRequestException('Cannot delete system administrator accounts');
//     }

//     // Soft delete
//     await this.prisma.user.update({
//       where: { id: Number(userId) },
//       data: { isActive: false },
//     });

//     // Invalidate all sessions
//     await this.prisma.userSession.updateMany({
//       where: { userId: Number(userId) },
//       data: { isActive: false },
//     });

//     // Audit log
//     await this.createAuditLog({
//       userId: Number(currentUserId),
//       action: 'DELETE',
//       entityType: 'USER',
//       entityId: Number(userId),
//       description: `User deleted by admin (ID: ${currentUserId})`
//     });

//     this.logger.log(`User ID: ${userId} deleted by admin ID: ${currentUserId}`);
//     return { message: 'User deleted successfully' };
//   }

//   /**
//    * Get active sessions for user
//    */
//   async getActiveSessions(userId: number) {
//     try {
//       const sessions = await this.prisma.userSession.findMany({
//         where: {
//           userId: Number(userId),
//           isActive: true,
//           expiresAt: { gt: new Date() },
//         },
//         orderBy: { createdAt: 'desc' },
//       });

//       return sessions;
//     } catch (error) {
//       this.logger.error(`Get sessions error: ${error.message}`, error.stack);
//       throw new InternalServerErrorException('Sessions retrieval failed');
//     }
//   }

//   /**
//    * Refresh JWT token
//    */
//   async refreshToken(userId: number): Promise<{ access_token: string; token_type: string; expires_in: string }> {
//     try {
//       const user = await this.validateUserById(userId);
//       if (!user) {
//         throw new UnauthorizedException('User not found');
//       }

//       // Use role CODE in payload
//       const payload = { 
//         sub: user.id, 
//         email: user.email,
//         role: user.role?.code || 'STUDENT',
//         roleId: user.roleId
//       };

//       const token = await this.jwtService.signAsync(payload, {
//         secret: this.configService.get<string>('JWT_SECRET') || 'school-erp-super-secret-jwt-key-2024-min-32-chars-long!',
//         expiresIn: '24h'
//       });

//       // Update session expiration
//       const expiresAt = new Date();
//       expiresAt.setHours(expiresAt.getHours() + 24);

//       await this.prisma.userSession.updateMany({
//         where: { 
//           userId: Number(userId), 
//           isActive: true 
//         },
//         data: { expiresAt },
//       });

//       this.logger.log(`Token refreshed for user ID: ${userId}`);

//       return {
//         access_token: token,
//         token_type: 'Bearer',
//         expires_in: '24h',
//       };
//     } catch (error) {
//       this.logger.error(`Token refresh error: ${error.message}`, error.stack);
//       throw new InternalServerErrorException('Token refresh failed');
//     }
//   }

//   /**
//    * Health check endpoint
//    */
//   async healthCheck() {
//     let dbStatus = 'disconnected';
//     try {
//       await this.prisma.$queryRaw`SELECT 1`;
//       dbStatus = 'connected';
//     } catch (error) {
//       dbStatus = 'error';
//       this.logger.error(`Database health check failed: ${error.message}`);
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

  
//   /**
//    * Create default roles (for seeding)
//    */
//   async createDefaultRoles() {
//     const defaultRoles = [
//       { 
//         name: 'Super Administrator', 
//         code: 'SUPER_ADMIN',
//         description: 'Full system access', 
//         isSystem: true
//       },
//       { 
//         name: 'Administrator', 
//         code: 'ADMIN',
//         description: 'School administrator', 
//         isSystem: true
//       },
//       { 
//         name: 'Teacher', 
//         code: 'TEACHER',
//         description: 'Teacher role', 
//         isSystem: false
//       },
//       { 
//         name: 'Student', 
//         code: 'STUDENT',
//         description: 'Student role', 
//         isSystem: false
//       },
//       { 
//         name: 'Parent', 
//         code: 'PARENT',
//         description: 'Parent role', 
//         isSystem: false
//       }
//     ];

//     for (const roleData of defaultRoles) {
//       await this.prisma.role.upsert({
//         where: { code: roleData.code },
//         update: {},
//         create: roleData
//       });
//     }

//     this.logger.log('Default roles created successfully');
//     return { message: 'Default roles setup complete' };
//   }

//   /**
//    * Create audit log entry
//    */


  
//   private async createAuditLog(auditData: {
//     userId: number;
//     action: string;
//     entityType: string;
//     entityId: number;
//     description?: string;
//     ipAddress?: string;
//     userAgent?: string;
//   }) {
//     try {
//       await this.prisma.auditLog.create({
//         data: {
//           userId: auditData.userId,
//           action: auditData.action,
//           entityType: auditData.entityType,
//           entityId: auditData.entityId,
//           description: auditData.description,
//           timestamp: new Date(),
//         },
//       });
//     } catch (error) {
//       this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
//     }
//   }
// }