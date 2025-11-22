
// import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { PrismaClient } from '@prisma/client';
// import * as bcrypt from 'bcryptjs';

// @Injectable()
// export class AuthService {
//   private prisma: PrismaClient;

//   constructor(private jwtService: JwtService) {
//     this.prisma = new PrismaClient();
//   }

//   async login(loginDto: any, ipAddress: string, userAgent: string) {
//     const { username, password } = loginDto;

//     try {
//       // Find user by username or email
//       const user = await this.prisma.user.findFirst({
//         where: {
//           OR: [
//             { username },
//             { email: username }
//           ],
//         },
//         include: {
//           role: true,
//         },
//       });

//       if (!user) {
//         throw new UnauthorizedException('Invalid username or password');
//       }

//       // For development - use simple password check
//       let isPasswordValid = false;
      
//       // Try bcrypt first, then plain text fallback for development
//       try {
//         isPasswordValid = await bcrypt.compare(password, user.passwordHash);
//       } catch (e) {
//         // If bcrypt fails, check plain text (for development)
//         isPasswordValid = password === user.passwordHash;
//       }

//       if (!isPasswordValid) {
//         throw new UnauthorizedException('Invalid username or password');
//       }

//       // Check if user is active
//       if (!user.isActive) {
//         throw new UnauthorizedException('Account is deactivated');
//       }

//       // Update last login
//       await this.prisma.user.update({
//         where: { id: user.id },
//         data: { lastLogin: new Date() },
//       });

//       // Create JWT token
//       const token = this.jwtService.sign({
//         username: user.username,
//         sub: user.id,
//         role: user.role.name,
//       });

//       // Get accessible modules for user
//       const accessibleModules = await this.getUserModules(user.roleId);

//       return {
//         access_token: token,
//         token_type: 'Bearer',
//         expires_in: '24h',
//         user: {
//           id: user.id,
//           username: user.username,
//           email: user.email,
//           firstName: user.firstName,
//           lastName: user.lastName,
//           phone: user.phone,
//           role: user.role.name,
//           permissions: user.role.permissions,
//           lastLogin: user.lastLogin,
//           accessibleModules,
//         },
//       };
//     } catch (error) {
//       if (error instanceof UnauthorizedException) {
//         throw error;
//       }
//       throw new UnauthorizedException('Login failed');
//     }
//   }

//   async register(registerDto: any) {
//     const { username, email, password, roleId, firstName, lastName, phone } = registerDto;

//     try {
//       // Check if user already exists
//       const existingUser = await this.prisma.user.findFirst({
//         where: {
//           OR: [
//             { username },
//             { email },
//           ],
//         },
//       });

//       if (existingUser) {
//         throw new ConflictException('Username or email already exists');
//       }

//       // Validate role
//       const allowedRoles = [3, 4, 5, 6, 7]; // teacher, student, parent, accountant, librarian
//       if (!allowedRoles.includes(roleId)) {
//         throw new BadRequestException('Invalid role ID. Allowed roles: 3=teacher, 4=student, 5=parent, 6=accountant, 7=librarian');
//       }

//       // Hash password
//       const hashedPassword = await bcrypt.hash(password, 12);

//       // Create user - using passwordHash field
//       const user = await this.prisma.user.create({
//         data: {
//           username,
//           email,
//           passwordHash: hashedPassword,
//           firstName,
//           lastName,
//           phone,
//           roleId,
//           isActive: true,
//         },
//         include: {
//           role: true,
//         },
//       });

//       // Get accessible modules
//       const accessibleModules = await this.getUserModules(roleId);

//       return {
//         message: 'User registered successfully',
//         user: {
//           id: user.id,
//           username: user.username,
//           email: user.email,
//           firstName: user.firstName,
//           lastName: user.lastName,
//           phone: user.phone,
//           roleId: user.roleId,
//           isActive: user.isActive,
//           lastLogin: user.lastLogin,
//           createdAt: user.createdAt,
//           updatedAt: user.updatedAt,
//           role: user.role,
//           accessibleModules,
//         },
//       };
//     } catch (error) {
//       if (error instanceof ConflictException || error instanceof BadRequestException) {
//         throw error;
//       }
//       throw new BadRequestException('Registration failed');
//     }
//   }

//   async getProfile(userId: number) {
//     try {
//       const user = await this.prisma.user.findUnique({
//         where: { id: userId },
//         include: {
//           role: true,
//         },
//       });

//       if (!user) {
//         throw new NotFoundException('User not found');
//       }

//       const accessibleModules = await this.getUserModules(user.roleId);

//       return {
//         ...user,
//         accessibleModules,
//       };
//     } catch (error) {
//       throw new NotFoundException('User not found');
//     }
//   }

//   async updateProfile(userId: number, updateProfileDto: any) {
//     const { email, ...otherData } = updateProfileDto;

//     try {
//       // Check if email is taken by another user
//       if (email) {
//         const existingUser = await this.prisma.user.findFirst({
//           where: {
//             email,
//             NOT: { id: userId },
//           },
//         });

//         if (existingUser) {
//           throw new ConflictException('Email already taken by another user');
//         }
//       }

//       const user = await this.prisma.user.update({
//         where: { id: userId },
//         data: {
//           ...otherData,
//           ...(email && { email }),
//         },
//         include: {
//           role: true,
//         },
//       });

//       const accessibleModules = await this.getUserModules(user.roleId);

//       return {
//         message: 'Profile updated successfully',
//         user: {
//           ...user,
//           accessibleModules,
//         },
//       };
//     } catch (error) {
//       if (error instanceof ConflictException) {
//         throw error;
//       }
//       throw new BadRequestException('Profile update failed');
//     }
//   }

//   async changePassword(userId: number, changePasswordDto: any) {
//     const { currentPassword, newPassword } = changePasswordDto;

//     try {
//       const user = await this.prisma.user.findUnique({
//         where: { id: userId },
//       });

//       if (!user) {
//         throw new NotFoundException('User not found');
//       }

//       // Verify current password
//       let isCurrentPasswordValid = false;
//       try {
//         isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
//       } catch (e) {
//         isCurrentPasswordValid = currentPassword === user.passwordHash;
//       }

//       if (!isCurrentPasswordValid) {
//         throw new UnauthorizedException('Current password is incorrect');
//       }

//       // Hash new password
//       const hashedNewPassword = await bcrypt.hash(newPassword, 12);

//       // Update passwordHash
//       await this.prisma.user.update({
//         where: { id: userId },
//         data: { passwordHash: hashedNewPassword },
//       });

//       return {
//         message: 'Password changed successfully',
//       };
//     } catch (error) {
//       if (error instanceof UnauthorizedException || error instanceof NotFoundException) {
//         throw error;
//       }
//       throw new BadRequestException('Password change failed');
//     }
//   }

//   async logout(token: string) {
//     // Simple logout - no session management
//     return {
//       message: 'Logged out successfully',
//     };
//   }

//   async logoutAll(userId: number) {
//     // Simple logout all - no session management
//     return {
//       message: 'Logged out from all devices',
//     };
//   }

//   async getActiveSessions(userId: number) {
//     // Return empty sessions array since Session model doesn't exist
//     return {
//       data: [],
//     };
//   }

//   async refreshToken(userId: number) {
//     try {
//       const user = await this.prisma.user.findUnique({
//         where: { id: userId },
//         include: { role: true },
//       });

//       if (!user) {
//         throw new UnauthorizedException('User not found');
//       }

//       const newToken = this.jwtService.sign({
//         username: user.username,
//         sub: user.id,
//         role: user.role.name,
//       });

//       return {
//         access_token: newToken,
//         token_type: 'Bearer',
//         expires_in: '24h',
//       };
//     } catch (error) {
//       throw new UnauthorizedException('Token refresh failed');
//     }
//   }

//   async deleteUser(userId: number, currentUserId: number) {
//     if (userId === currentUserId) {
//       throw new BadRequestException('Cannot delete your own account');
//     }

//     try {
//       const userToDelete = await this.prisma.user.findUnique({
//         where: { id: userId },
//         include: { role: true },
//       });

//       if (!userToDelete) {
//         throw new NotFoundException('User not found');
//       }

//       // Prevent deletion of system admin accounts
//       if (userToDelete.role.name === 'super_admin' || userToDelete.role.name === 'admin') {
//         throw new BadRequestException('Cannot delete system administrator accounts');
//       }

//       // Delete user
//       await this.prisma.user.delete({ where: { id: userId } });

//       return {
//         message: 'User deleted successfully',
//       };
//     } catch (error) {
//       if (error instanceof BadRequestException || error instanceof NotFoundException) {
//         throw error;
//       }
//       throw new BadRequestException('User deletion failed');
//     }
//   }

//   async validateUserById(userId: number) {
//     try {
//       return await this.prisma.user.findUnique({
//         where: { id: userId },
//         include: { role: true },
//       });
//     } catch (error) {
//       return null;
//     }
//   }

//   async healthCheck() {
//     // Check database connection
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

//   private async getUserModules(roleId: number) {
//     // Mock modules data - replace with actual database query
//     const modules = [
//       {
//         id: 1,
//         name: 'Dashboard',
//         description: 'System dashboard and overview',
//         path: '/dashboard',
//         icon: 'mdi-view-dashboard',
//         order: 1,
//         permissions: {
//           canView: true,
//           canCreate: true,
//           canEdit: true,
//           canDelete: true,
//         },
//       },
//       {
//         id: 2,
//         name: 'User Management',
//         description: 'User authentication and management system',
//         path: '/users',
//         icon: 'mdi-account-cog',
//         order: 2,
//         permissions: {
//           canView: roleId === 1, // Only super_admin
//           canCreate: roleId === 1,
//           canEdit: roleId === 1,
//           canDelete: roleId === 1,
//         },
//       },
//       {
//         id: 3,
//         name: 'Student Management',
//         description: 'Student admission and management',
//         path: '/students',
//         icon: 'mdi-account-school',
//         order: 3,
//         permissions: {
//           canView: [1, 2, 3].includes(roleId), // super_admin, admin, teacher
//           canCreate: [1, 2].includes(roleId),
//           canEdit: [1, 2, 3].includes(roleId),
//           canDelete: [1, 2].includes(roleId),
//         },
//       },
//     ];

//     return modules.filter(module => module.permissions.canView);
//   }
// }

import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private prisma: PrismaClient;

  constructor(private jwtService: JwtService) {
    this.prisma = new PrismaClient();
  }

  async login(loginDto: any, ipAddress: string, userAgent: string) {
    const { username, password } = loginDto;

    try {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { username },
            { email: username }
          ],
        },
        include: {
          role: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid username or password');
      }

      let isPasswordValid = false;
      
      try {
        isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      } catch (e) {
        isPasswordValid = password === user.passwordHash;
      }

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid username or password');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      const token = this.jwtService.sign({
        username: user.username,
        sub: user.id,
        role: user.role.name,
      });

      const accessibleModules = await this.getUserModules(user.roleId);

      return {
        access_token: token,
        token_type: 'Bearer',
        expires_in: '24h',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role.name,
          permissions: user.role.permissions,
          lastLogin: user.lastLogin,
          accessibleModules,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Login failed');
    }
  }

  async register(registerDto: any) {
    const { username, email, password, roleId, firstName, lastName, phone } = registerDto;

    try {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { username },
            { email },
          ],
        },
      });

      if (existingUser) {
        throw new ConflictException('Username or email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await this.prisma.user.create({
        data: {
          username,
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          phone,
          roleId,
          isActive: true,
        },
        include: {
          role: true,
        },
      });

      const accessibleModules = await this.getUserModules(roleId);

      return {
        message: 'User registered successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          roleId: user.roleId,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          role: user.role,
          accessibleModules,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Registration failed');
    }
  }

  async getProfile(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const accessibleModules = await this.getUserModules(user.roleId);

      return {
        ...user,
        accessibleModules,
      };
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async updateProfile(userId: string, updateProfileDto: any) {
    const { email, ...otherData } = updateProfileDto;

    try {
      if (email) {
        const existingUser = await this.prisma.user.findFirst({
          where: {
            email,
            NOT: { id: userId },
          },
        });

        if (existingUser) {
          throw new ConflictException('Email already taken by another user');
        }
      }

      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...otherData,
          ...(email && { email }),
        },
        include: {
          role: true,
        },
      });

      const accessibleModules = await this.getUserModules(user.roleId);

      return {
        message: 'Profile updated successfully',
        user: {
          ...user,
          accessibleModules,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Profile update failed');
    }
  }

  async changePassword(userId: string, changePasswordDto: any) {
    const { currentPassword, newPassword } = changePasswordDto;

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      let isCurrentPasswordValid = false;
      try {
        isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      } catch (e) {
        isCurrentPasswordValid = currentPassword === user.passwordHash;
      }

      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      await this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashedNewPassword },
      });

      return {
        message: 'Password changed successfully',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Password change failed');
    }
  }

  async logout(token: string) {
    return {
      message: 'Logged out successfully',
    };
  }

  async logoutAll(userId: string) {
    return {
      message: 'Logged out from all devices',
    };
  }

  async getActiveSessions(userId: string) {
    return {
      data: [],
    };
  }

  async refreshToken(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newToken = this.jwtService.sign({
        username: user.username,
        sub: user.id,
        role: user.role.name,
      });

      return {
        access_token: newToken,
        token_type: 'Bearer',
        expires_in: '24h',
      };
    } catch (error) {
      throw new UnauthorizedException('Token refresh failed');
    }
  }

  async deleteUser(userId: string, currentUserId: string) {
    if (userId === currentUserId) {
      throw new BadRequestException('Cannot delete your own account');
    }

    try {
      const userToDelete = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (!userToDelete) {
        throw new NotFoundException('User not found');
      }

      if (userToDelete.role.name === 'super_admin' || userToDelete.role.name === 'admin') {
        throw new BadRequestException('Cannot delete system administrator accounts');
      }

      await this.prisma.user.delete({ where: { id: userId } });

      return {
        message: 'User deleted successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('User deletion failed');
    }
  }

  async validateUserById(userId: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });
    } catch (error) {
      return null;
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

  private async getUserModules(roleId: string) {
    const modules = [
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
          canDelete: true,
        },
      },
    ];

    return modules.filter(module => module.permissions.canView);
  }
}