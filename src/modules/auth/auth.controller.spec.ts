import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext } from '@nestjs/common';

// ─── Mock AuthService ─────────────────────────────────────────────────────────
const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
  changePassword: jest.fn(),
  logout: jest.fn(),
  logoutAll: jest.fn(),
  getActiveSessions: jest.fn(),
  refreshToken: jest.fn(),
  deleteUser: jest.fn(),
};

// ─── Guard overrides ──────────────────────────────────────────────────────────
// Use CanActivate interface directly — avoids accessing private members of real guard classes

class MockJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Inject mock user for all protected routes
    if (!request.user) {
      request.user = { id: 1, userId: 1, role: 'SUPER_ADMIN', email: 'admin@school.com' };
    }
    return true;
  }
}

class MockRolesGuard implements CanActivate {
  canActivate(): boolean { return true; }
}

class MockThrottlerGuard implements CanActivate {
  canActivate(): boolean { return true; }
}

// ─── Shared response fixtures ─────────────────────────────────────────────────
const loginResponse = {
  message: 'Login successful',
  access_token: 'test_jwt_token',
  user: {
    id: 1,
    email: 'admin@school.com',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    roleId: 1,
    permissions: [],
  },
};

const profileResponse = {
  id: 1,
  email: 'admin@school.com',
  username: 'admin',
  firstName: 'Admin',
  lastName: 'User',
  isActive: true,
  role: { id: 1, name: 'ADMIN', code: 'ADMIN' },
  permissions: [],
};

// ─── Test suite ───────────────────────────────────────────────────────────────
describe('AuthController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard).useClass(MockJwtAuthGuard)
      .overrideGuard(RolesGuard).useClass(MockRolesGuard)
      .overrideGuard(ThrottlerGuard).useClass(MockThrottlerGuard)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── POST /auth/login ──────────────────────────────────────────────────────
  describe('POST /auth/login', () => {
    it('should return 200 and access_token on valid credentials', async () => {
      mockAuthService.login.mockResolvedValue(loginResponse);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@school.com', password: 'Admin123!' })
        .expect(200);

      expect(res.body.access_token).toBe('test_jwt_token');
      expect(res.body.message).toBe('Login successful');
      expect(res.body.user.email).toBe('admin@school.com');
    });

    it('should return 200 with username instead of email', async () => {
      mockAuthService.login.mockResolvedValue(loginResponse);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin', password: 'Admin123!' })
        .expect(200);

      expect(res.body.access_token).toBeDefined();
    });

    it('should return 401 when service throws UnauthorizedException', async () => {
      const { UnauthorizedException } = require('@nestjs/common');
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'wrong@school.com', password: 'wrong' })
        .expect(401);
    });

    it('should return 400 when password is missing', async () => {
      // ValidationPipe catches missing required fields
      mockAuthService.login.mockResolvedValue(loginResponse);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@school.com' }) // no password
        .expect(400);
    });

    it('should call authService.login with the request body', async () => {
      mockAuthService.login.mockResolvedValue(loginResponse);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@school.com', password: 'Admin123!' });

      expect(mockAuthService.login).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'admin@school.com', password: 'Admin123!' }),
      );
    });

    it('should return user object with expected fields', async () => {
      mockAuthService.login.mockResolvedValue(loginResponse);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@school.com', password: 'Admin123!' })
        .expect(200);

      expect(res.body.user).toMatchObject({
        id: expect.any(Number),
        email: expect.any(String),
        role: expect.any(String),
      });
    });
  });

  // ── POST /auth/register ───────────────────────────────────────────────────
  describe('POST /auth/register', () => {
    const registerPayload = {
      email: 'newuser@school.com',
      password: 'Test@1234',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      roleId: 4,
    };

    it('should return 201 and user data on successful registration', async () => {
      mockAuthService.register.mockResolvedValue({
        message: 'User registered successfully',
        user: { id: 5, email: 'newuser@school.com', role: 'STUDENT' },
      });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerPayload)
        .expect(201);

      expect(res.body.message).toBe('User registered successfully');
      expect(res.body.user.email).toBe('newuser@school.com');
    });

    it('should return 409 when email already exists', async () => {
      const { ConflictException } = require('@nestjs/common');
      mockAuthService.register.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerPayload)
        .expect(409);
    });

    it('should return 400 when email format is invalid', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...registerPayload, email: 'not-an-email' })
        .expect(400);
    });
  });

  // ── GET /auth/profile ─────────────────────────────────────────────────────
  describe('GET /auth/profile', () => {
    it('should return 200 and user profile', async () => {
      mockAuthService.getProfile.mockResolvedValue(profileResponse);

      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer test_jwt_token')
        .expect(200);

      expect(res.body.id).toBe(1);
      expect(res.body.email).toBe('admin@school.com');
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    it('should call authService.getProfile with userId from token', async () => {
      mockAuthService.getProfile.mockResolvedValue(profileResponse);

      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer test_jwt_token');

      // MockJwtAuthGuard sets user.id = 1
      expect(mockAuthService.getProfile).toHaveBeenCalledWith(1);
    });

    it('should return 404 when user does not exist', async () => {
      const { NotFoundException } = require('@nestjs/common');
      mockAuthService.getProfile.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer test_jwt_token')
        .expect(404);
    });
  });

  // ── PUT /auth/profile ─────────────────────────────────────────────────────
  describe('PUT /auth/profile', () => {
    it('should return 200 and updated profile', async () => {
      mockAuthService.updateProfile.mockResolvedValue({
        message: 'Profile updated successfully',
        user: { ...profileResponse, firstName: 'Updated' },
      });

      const res = await request(app.getHttpServer())
        .put('/auth/profile')
        .set('Authorization', 'Bearer test_jwt_token')
        .send({ firstName: 'Updated' })
        .expect(200);

      expect(res.body.message).toBe('Profile updated successfully');
    });

    it('should return 409 when email is already taken', async () => {
      const { ConflictException } = require('@nestjs/common');
      mockAuthService.updateProfile.mockRejectedValue(
        new ConflictException('Email already taken by another user'),
      );

      await request(app.getHttpServer())
        .put('/auth/profile')
        .set('Authorization', 'Bearer test_jwt_token')
        .send({ email: 'taken@school.com' })
        .expect(409);
    });
  });

  // ── POST /auth/change-password ────────────────────────────────────────────
  describe('POST /auth/change-password', () => {
    const changePasswordPayload = {
      oldPassword: 'Admin123!',
      newPassword: 'NewAdmin@2026!',
    };

    it('should return 200 on successful password change', async () => {
      mockAuthService.changePassword.mockResolvedValue({
        message: 'Password changed successfully',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', 'Bearer test_jwt_token')
        .send(changePasswordPayload)
        .expect(201); // NestJS @Post without @HttpCode returns 201

      expect(res.body.message).toBe('Password changed successfully');
    });

    it('should return 401 when old password is incorrect', async () => {
      const { UnauthorizedException } = require('@nestjs/common');
      mockAuthService.changePassword.mockRejectedValue(
        new UnauthorizedException('Current password is incorrect'),
      );

      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', 'Bearer test_jwt_token')
        .send({ oldPassword: 'WrongPass!', newPassword: 'NewPass@2026!' })
        .expect(401);
    });

    it('should return 400 when newPassword is missing', async () => {
      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', 'Bearer test_jwt_token')
        .send({ oldPassword: 'Admin123!' }) // missing newPassword
        .expect(400);
    });
  });

  // ── POST /auth/logout ─────────────────────────────────────────────────────
  describe('POST /auth/logout', () => {
    it('should return 201 and success message', async () => {
      mockAuthService.logout.mockResolvedValue({ message: 'Logged out successfully' });

      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer test_jwt_token')
        .expect(201); // NestJS @Post without @HttpCode returns 201

      expect(res.body.message).toBe('Logged out successfully');
    });

    it('should pass the Bearer token to authService.logout', async () => {
      mockAuthService.logout.mockResolvedValue({ message: 'Logged out successfully' });

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer test_jwt_token');

      expect(mockAuthService.logout).toHaveBeenCalledWith('test_jwt_token');
    });
  });

  // ── POST /auth/logout-all ─────────────────────────────────────────────────
  describe('POST /auth/logout-all', () => {
    it('should return 201 and logout-all message', async () => {
      mockAuthService.logoutAll.mockResolvedValue({ message: 'Logged out from all devices' });

      const res = await request(app.getHttpServer())
        .post('/auth/logout-all')
        .set('Authorization', 'Bearer test_jwt_token')
        .expect(201); // NestJS @Post without @HttpCode returns 201

      expect(res.body.message).toBe('Logged out from all devices');
    });
  });

  // ── GET /auth/sessions ────────────────────────────────────────────────────
  describe('GET /auth/sessions', () => {
    it('should return 200 and array of sessions', async () => {
      const sessions = [
        { id: 1, userId: 1, sessionToken: 'tok1', isActive: true, createdAt: new Date() },
      ];
      mockAuthService.getActiveSessions.mockResolvedValue(sessions);

      const res = await request(app.getHttpServer())
        .get('/auth/sessions')
        .set('Authorization', 'Bearer test_jwt_token')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
    });
  });

  // ── POST /auth/refresh-token ──────────────────────────────────────────────
  describe('POST /auth/refresh-token', () => {
    it('should return 201 with new access_token', async () => {
      mockAuthService.refreshToken.mockResolvedValue({
        access_token: 'new_jwt_token',
        token_type: 'Bearer',
        expires_in: '24h',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Authorization', 'Bearer test_jwt_token')
        .expect(201); // NestJS @Post without @HttpCode returns 201

      expect(res.body.access_token).toBe('new_jwt_token');
      expect(res.body.token_type).toBe('Bearer');
    });
  });

  // ── DELETE /auth/users/:id ────────────────────────────────────────────────
  describe('DELETE /auth/users/:id', () => {
    it('should return 200 when user is deleted successfully', async () => {
      mockAuthService.deleteUser.mockResolvedValue({ message: 'User deleted successfully' });

      const res = await request(app.getHttpServer())
        .delete('/auth/users/2')
        .set('Authorization', 'Bearer test_jwt_token')
        .expect(200);

      expect(res.body.message).toBe('User deleted successfully');
    });

    it('should return 400 when ID is not a valid number', async () => {
      await request(app.getHttpServer())
        .delete('/auth/users/notanumber')
        .set('Authorization', 'Bearer test_jwt_token')
        .expect(400);
    });

    it('should return 404 when target user does not exist', async () => {
      const { NotFoundException } = require('@nestjs/common');
      mockAuthService.deleteUser.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await request(app.getHttpServer())
        .delete('/auth/users/999')
        .set('Authorization', 'Bearer test_jwt_token')
        .expect(404);
    });
  });

  // ── GET /auth/debug-info ──────────────────────────────────────────────────
  describe('GET /auth/debug-info', () => {
    it('should return 200 with debug metadata', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/debug-info')
        .expect(200);

      expect(res.body.message).toBeDefined();
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.nodeVersion).toBeDefined();
    });
  });
});
