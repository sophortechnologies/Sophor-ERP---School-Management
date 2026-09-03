import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import {
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// ─── Prisma mock ──────────────────────────────────────────────────────────────
const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  userSession: {
    create: jest.fn(),
    updateMany: jest.fn(),
    findMany: jest.fn(),
  },
  role: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    upsert: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
};

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('mocked_jwt_token'),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue(12),
};

// ─── Shared test fixtures ─────────────────────────────────────────────────────
const hashedPassword = bcrypt.hashSync('Admin123!', 10);

const mockRole = {
  id: 1,
  name: 'ADMIN',
  code: 'ADMIN',
  isSystem: true,
  RolePermission: [],
};

const mockUser = {
  id: 1,
  email: 'admin@school.com',
  username: 'admin',
  firstName: 'Admin',
  lastName: 'User',
  passwordHash: hashedPassword,
  roleId: 1,
  role: mockRole,
  isActive: true,
  passwordExpiresAt: null,
};

// ─── Test suite ───────────────────────────────────────────────────────────────
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ── login ──────────────────────────────────────────────────────────────────
  describe('login()', () => {
    it('should return access_token on valid email + password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockPrisma.userSession.create.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.login({
        email: 'admin@school.com',
        password: 'Admin123!',
      });

      expect(result.access_token).toBe('mocked_jwt_token');
      expect(result.message).toBe('Login successful');
      expect(result.user.email).toBe('admin@school.com');
    });

    it('should return access_token on valid username + password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockPrisma.userSession.create.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.login({
        username: 'admin',
        password: 'Admin123!',
      });

      expect(result.access_token).toBeDefined();
    });

    it('should throw BadRequestException when no identifier provided', async () => {
      await expect(service.login({ password: 'Admin123!' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@school.com', password: 'Admin123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.login({ email: 'admin@school.com', password: 'WrongPass!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is expired', async () => {
      const expiredUser = {
        ...mockUser,
        passwordExpiresAt: new Date('2020-01-01'),
      };
      mockPrisma.user.findFirst.mockResolvedValue(expiredUser);

      await expect(
        service.login({ email: 'admin@school.com', password: 'Admin123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should create a UserSession after successful login', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockPrisma.userSession.create.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      await service.login({ email: 'admin@school.com', password: 'Admin123!' });

      expect(mockPrisma.userSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockUser.id,
            isActive: true,
          }),
        }),
      );
    });
  });

  // ── register ───────────────────────────────────────────────────────────────
  describe('register()', () => {
    const registerDto = {
      email: 'newuser@school.com',
      password: 'Test@1234',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      roleId: 4,
    };

    it('should create a new user and return success message', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.role.findFirst.mockResolvedValue({ id: 4, name: 'STUDENT' });
      mockPrisma.user.create.mockResolvedValue({
        id: 99,
        ...registerDto,
        passwordHash: 'hashed',
        roleId: 4,
        role: { id: 4, name: 'STUDENT' },
      });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(result.message).toBe('User registered successfully');
      expect(result.user.email).toBe('newuser@school.com');
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ── getProfile ─────────────────────────────────────────────────────────────
  describe('getProfile()', () => {
    it('should return user profile without passwordHash', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile(1);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toBe('admin@school.com');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile(9999)).rejects.toThrow(NotFoundException);
    });
  });

  // ── changePassword ─────────────────────────────────────────────────────────
  describe('changePassword()', () => {
    const dto = { oldPassword: 'Admin123!', newPassword: 'NewPass@2026!' };

    it('should update passwordHash when old password is correct', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({ ...mockUser });
      mockPrisma.userSession.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.changePassword(1, dto);

      expect(result.message).toBe('Password changed successfully');
      expect(mockPrisma.user.update).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when old password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.changePassword(1, { oldPassword: 'WrongOld!', newPassword: 'New@2026!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.changePassword(9999, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should invalidate all active sessions after password change', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);
      mockPrisma.userSession.updateMany.mockResolvedValue({ count: 2 });
      mockPrisma.auditLog.create.mockResolvedValue({});

      await service.changePassword(1, dto);

      expect(mockPrisma.userSession.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 1, isActive: true }),
          data: { isActive: false },
        }),
      );
    });
  });

  // ── logout ─────────────────────────────────────────────────────────────────
  describe('logout()', () => {
    it('should mark session as inactive and return success', async () => {
      mockPrisma.userSession.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.logout('some_token');

      expect(result.message).toBe('Logged out successfully');
      expect(mockPrisma.userSession.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ sessionToken: 'some_token', isActive: true }),
          data: { isActive: false },
        }),
      );
    });

    it('should return success even with no token', async () => {
      const result = await service.logout('');
      expect(result.message).toBe('Logged out successfully');
    });
  });

  // ── logoutAll ──────────────────────────────────────────────────────────────
  describe('logoutAll()', () => {
    it('should deactivate all sessions for the user', async () => {
      mockPrisma.userSession.updateMany.mockResolvedValue({ count: 3 });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.logoutAll(1);

      expect(result.message).toBe('Logged out from all devices');
      expect(mockPrisma.userSession.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 1, isActive: true }),
        }),
      );
    });
  });

  // ── deleteUser ─────────────────────────────────────────────────────────────
  describe('deleteUser()', () => {
    it('should throw BadRequestException when deleting own account', async () => {
      await expect(service.deleteUser(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when target user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteUser(2, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when deleting a system admin', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        id: 2,
        role: { ...mockRole, isSystem: true, name: 'SUPER_ADMIN' },
      });

      await expect(service.deleteUser(2, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should deactivate non-admin user and return success', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        id: 2,
        role: { ...mockRole, isSystem: false, name: 'TEACHER' },
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.userSession.updateMany.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.deleteUser(2, 1);

      expect(result.message).toBe('User deleted successfully');
    });
  });
});
