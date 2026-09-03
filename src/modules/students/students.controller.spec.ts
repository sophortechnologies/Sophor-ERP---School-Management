import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, CanActivate, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { StudentController } from './students.controller';
import { StudentService } from './students.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Reflector } from '@nestjs/core';

// ─── Mock StudentService ──────────────────────────────────────────────────────
const mockStudentService = {
  createStudent: jest.fn(),
  loginStudent: jest.fn(),
  activateStudentAccount: jest.fn(),
  bulkCreateStudents: jest.fn(),
  getAdmissionStatistics: jest.fn(),
  searchStudents: jest.fn(),
  convertInquiryToStudent: jest.fn(),
  findAll: jest.fn(),
  uploadStudentDocument: jest.fn(),
  getStudentDocuments: jest.fn(),
  generateAdmissionForm: jest.fn(),
  generateConfirmationReceipt: jest.fn(),
  getAdmissionHistory: jest.fn(),
  getDashboard: jest.fn(),
  assignClass: jest.fn(),
  restoreStudent: jest.fn(),
  scheduleAdmissionTest: jest.fn(),
  recordAdmissionTestResult: jest.fn(),
  findOne: jest.fn(),
  updateStudent: jest.fn(),
  softDeleteStudent: jest.fn(),
  updateStudentStatus: jest.fn(),
};

// ─── Guard overrides ──────────────────────────────────────────────────────────
class MockJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    // Simulate authenticated admin user for all protected routes
    if (!req.user) {
      req.user = { id: 1, userId: 1, role: 'SUPER_ADMIN', email: 'admin@school.com' };
    }
    return true;
  }
}

class MockRolesGuard implements CanActivate {
  canActivate(): boolean { return true; }
}

// ─── Shared fixtures ──────────────────────────────────────────────────────────
const mockStudent = {
  id: 1,
  studentId: 'STU20260001',
  firstName: 'Sara',
  lastName: 'Tekle',
  email: 'sara@student.com',
  status: 'ACTIVE',
  classId: 1,
  sectionId: 1,
  createdAt: new Date().toISOString(),
};

const validCreatePayload = {
  firstName: 'Sara',
  lastName: 'Tekle',
  email: 'sara@student.com',
  phone: '+251911111111',
  gender: 'FEMALE',
  dateOfBirth: '2010-05-15',
  address: 'Addis Ababa',
  city: 'Addis Ababa',
  state: 'Addis Ababa',
  pincode: '100000',
  nationality: 'Ethiopian',
  guardianName: 'Marta Tekle',
  guardianPhone: '+251922222222',
  guardianRelation: 'MOTHER',
  sessionId: 1,
  termsAccepted: true,
};

// ─── Test suite ───────────────────────────────────────────────────────────────
describe('StudentController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentController],
      providers: [
        { provide: StudentService, useValue: mockStudentService },
      ],
    })
      .overrideGuard(JwtAuthGuard).useClass(MockJwtAuthGuard)
      .overrideGuard(RolesGuard).useClass(MockRolesGuard)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── POST /students/login (public) ─────────────────────────────────────────
  describe('POST /students/login', () => {
    it('should return 200 and token on valid credentials', async () => {
      mockStudentService.loginStudent.mockResolvedValue({
        message: 'Login successful',
        token: 'student_jwt_token',
        user: { id: 10, studentId: 'STU20260001', firstName: 'Sara' },
      });

      const res = await request(app.getHttpServer())
        .post('/students/login')
        .send({ studentId: 'STU20260001', password: 'Student@2026!' })
        .expect(201); // @Post returns 201 by default when no @HttpCode override

      expect(res.body.token).toBeDefined();
      expect(res.body.message).toBe('Login successful');
    });

    it('should return 400 when service throws BadRequestException', async () => {
      const { BadRequestException } = require('@nestjs/common');
      mockStudentService.loginStudent.mockRejectedValue(
        new BadRequestException('Invalid student ID or password'),
      );

      await request(app.getHttpServer())
        .post('/students/login')
        .send({ studentId: 'INVALID', password: 'wrong' })
        .expect(400);
    });
  });

  // ── POST /students/activate-student/:studentId (public) ───────────────────
  describe('POST /students/activate-student/:studentId', () => {
    it('should return 201 and success message', async () => {
      mockStudentService.activateStudentAccount.mockResolvedValue({
        message: 'Student account activated successfully. You can now login.',
        studentId: 'STU20260001',
      });

      const res = await request(app.getHttpServer())
        .post('/students/activate-student/STU20260001')
        .send({ password: 'Student@2026!' })
        .expect(201);

      expect(res.body.message).toContain('activated successfully');
    });

    it('should return 400 when password does not meet requirements', async () => {
      const { BadRequestException } = require('@nestjs/common');
      mockStudentService.activateStudentAccount.mockRejectedValue(
        new BadRequestException('Password must be at least 8 characters'),
      );

      await request(app.getHttpServer())
        .post('/students/activate-student/STU20260001')
        .send({ password: 'weak' })
        .expect(400);
    });

    it('should return 404 when student is not found', async () => {
      const { NotFoundException } = require('@nestjs/common');
      mockStudentService.activateStudentAccount.mockRejectedValue(
        new NotFoundException('Student or user not found'),
      );

      await request(app.getHttpServer())
        .post('/students/activate-student/STU99999999')
        .send({ password: 'Student@2026!' })
        .expect(404);
    });
  });

  // ── GET /students/statistics ──────────────────────────────────────────────
  describe('GET /students/statistics', () => {
    it('should return 200 with admission statistics', async () => {
      mockStudentService.getAdmissionStatistics.mockResolvedValue({
        total: 150,
        byStatus: [{ status: 'ACTIVE', _count: 120 }],
        summary: { pending: 10, approved: 120, admitted: 100 },
      });

      const res = await request(app.getHttpServer())
        .get('/students/statistics')
        .set('Authorization', 'Bearer test_token')
        .expect(200);

      expect(res.body.total).toBe(150);
      expect(res.body.summary).toBeDefined();
    });
  });

  // ── GET /students/search ──────────────────────────────────────────────────
  describe('GET /students/search', () => {
    it('should return 200 with matching students', async () => {
      mockStudentService.searchStudents.mockResolvedValue([mockStudent]);

      const res = await request(app.getHttpServer())
        .get('/students/search?q=Sara')
        .set('Authorization', 'Bearer test_token')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].firstName).toBe('Sara');
    });

    it('should call searchStudents with the q param', async () => {
      mockStudentService.searchStudents.mockResolvedValue([]);

      await request(app.getHttpServer())
        .get('/students/search?q=Abebe')
        .set('Authorization', 'Bearer test_token');

      expect(mockStudentService.searchStudents).toHaveBeenCalledWith('Abebe');
    });

    it('should return empty array when no matches found', async () => {
      mockStudentService.searchStudents.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get('/students/search?q=nonexistent')
        .set('Authorization', 'Bearer test_token')
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });

  // ── POST /students (create) ───────────────────────────────────────────────
  describe('POST /students', () => {
    it('should return 201 and the created student', async () => {
      mockStudentService.createStudent.mockResolvedValue(mockStudent);

      const res = await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', 'Bearer test_token')
        .send(validCreatePayload)
        .expect(201);

      expect(res.body.studentId).toBe('STU20260001');
      expect(res.body.firstName).toBe('Sara');
    });

    it('should return 400 when termsAccepted is false', async () => {
      const { BadRequestException } = require('@nestjs/common');
      mockStudentService.createStudent.mockRejectedValue(
        new BadRequestException('Terms and conditions must be accepted'),
      );

      await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', 'Bearer test_token')
        .send({ ...validCreatePayload, termsAccepted: false })
        .expect(400);
    });

    it('should call createStudent with the userId from JWT', async () => {
      mockStudentService.createStudent.mockResolvedValue(mockStudent);

      await request(app.getHttpServer())
        .post('/students')
        .set('Authorization', 'Bearer test_token')
        .send(validCreatePayload);

      // MockJwtAuthGuard injects user.id = 1
      expect(mockStudentService.createStudent).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: 'Sara' }),
        1,        // userId
        undefined, // no file in this test
      );
    });
  });

  // ── GET /students ─────────────────────────────────────────────────────────
  describe('GET /students', () => {
    it('should return 200 with paginated student list', async () => {
      mockStudentService.findAll.mockResolvedValue({
        count: 1,
        total_pages: 1,
        current_page: 1,
        page_size: 10,
        next: null,
        previous: null,
        data: [mockStudent],
      });

      const res = await request(app.getHttpServer())
        .get('/students')
        .set('Authorization', 'Bearer test_token')
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.count).toBe(1);
    });
  });

  // ── GET /students/:id ─────────────────────────────────────────────────────
  describe('GET /students/:id', () => {
    it('should return 200 with student when found', async () => {
      mockStudentService.findOne.mockResolvedValue(mockStudent);

      const res = await request(app.getHttpServer())
        .get('/students/1')
        .set('Authorization', 'Bearer test_token')
        .expect(200);

      expect(res.body.id).toBe(1);
      expect(res.body.firstName).toBe('Sara');
    });

    it('should return 404 when student does not exist', async () => {
      const { NotFoundException } = require('@nestjs/common');
      mockStudentService.findOne.mockRejectedValue(
        new NotFoundException('Student not found'),
      );

      await request(app.getHttpServer())
        .get('/students/9999')
        .set('Authorization', 'Bearer test_token')
        .expect(404);
    });

    it('should return 400 when id is not a number', async () => {
      await request(app.getHttpServer())
        .get('/students/notanumber')
        .set('Authorization', 'Bearer test_token')
        .expect(400);
    });
  });

  // ── PATCH /students/:id ───────────────────────────────────────────────────
  describe('PATCH /students/:id', () => {
    it('should return 200 with updated student', async () => {
      mockStudentService.updateStudent.mockResolvedValue({
        ...mockStudent,
        firstName: 'Meron',
      });

      const res = await request(app.getHttpServer())
        .patch('/students/1')
        .set('Authorization', 'Bearer test_token')
        .send({ firstName: 'Meron' })
        .expect(200);

      expect(res.body.firstName).toBe('Meron');
    });

    it('should return 404 when student to update does not exist', async () => {
      const { NotFoundException } = require('@nestjs/common');
      mockStudentService.updateStudent.mockRejectedValue(
        new NotFoundException('Student not found'),
      );

      await request(app.getHttpServer())
        .patch('/students/9999')
        .set('Authorization', 'Bearer test_token')
        .send({ firstName: 'Meron' })
        .expect(404);
    });
  });

  // ── DELETE /students/:id ──────────────────────────────────────────────────
  describe('DELETE /students/:id', () => {
    it('should return 200 and success message', async () => {
      mockStudentService.softDeleteStudent.mockResolvedValue({
        message: 'Student deleted successfully',
      });

      const res = await request(app.getHttpServer())
        .delete('/students/1')
        .set('Authorization', 'Bearer test_token')
        .expect(200);

      expect(res.body.message).toBe('Student deleted successfully');
    });

    it('should return 400 when student has dependencies', async () => {
      const { BadRequestException } = require('@nestjs/common');
      mockStudentService.softDeleteStudent.mockRejectedValue(
        new BadRequestException('Cannot delete: 3 exam results exist'),
      );

      await request(app.getHttpServer())
        .delete('/students/1')
        .set('Authorization', 'Bearer test_token')
        .expect(400);
    });

    it('should return 404 when student does not exist', async () => {
      const { NotFoundException } = require('@nestjs/common');
      mockStudentService.softDeleteStudent.mockRejectedValue(
        new NotFoundException('Student not found'),
      );

      await request(app.getHttpServer())
        .delete('/students/9999')
        .set('Authorization', 'Bearer test_token')
        .expect(404);
    });
  });

  // ── PATCH /students/:id/restore ───────────────────────────────────────────
  describe('PATCH /students/:id/restore', () => {
    it('should return 200 and success message', async () => {
      mockStudentService.restoreStudent.mockResolvedValue({
        message: 'Student restored successfully',
      });

      const res = await request(app.getHttpServer())
        .patch('/students/1/restore')
        .set('Authorization', 'Bearer test_token')
        .expect(200);

      expect(res.body.message).toBe('Student restored successfully');
    });

    it('should return 400 when student is not deleted', async () => {
      const { BadRequestException } = require('@nestjs/common');
      mockStudentService.restoreStudent.mockRejectedValue(
        new BadRequestException('Student is not deleted — nothing to restore'),
      );

      await request(app.getHttpServer())
        .patch('/students/1/restore')
        .set('Authorization', 'Bearer test_token')
        .expect(400);
    });
  });

  // ── PATCH /students/:studentId/assign-class ───────────────────────────────
  describe('PATCH /students/:studentId/assign-class', () => {
    it('should return 200 when class assigned successfully', async () => {
      mockStudentService.assignClass.mockResolvedValue({
        ...mockStudent,
        classId: 2,
        sectionId: 3,
      });

      const res = await request(app.getHttpServer())
        .patch('/students/1/assign-class')
        .set('Authorization', 'Bearer test_token')
        .send({ classId: 2, section: 'B' })
        .expect(200);

      expect(res.body.classId).toBe(2);
    });

    it('should return 400 when section is full', async () => {
      const { BadRequestException } = require('@nestjs/common');
      mockStudentService.assignClass.mockRejectedValue(
        new BadRequestException('Section "B" is full (30/30)'),
      );

      await request(app.getHttpServer())
        .patch('/students/1/assign-class')
        .set('Authorization', 'Bearer test_token')
        .send({ classId: 2, section: 'B' })
        .expect(400);
    });

    it('should return 404 when class does not exist', async () => {
      const { NotFoundException } = require('@nestjs/common');
      mockStudentService.assignClass.mockRejectedValue(
        new NotFoundException('Class not found'),
      );

      await request(app.getHttpServer())
        .patch('/students/1/assign-class')
        .set('Authorization', 'Bearer test_token')
        .send({ classId: 9999 })
        .expect(404);
    });
  });

  // ── GET /students/:id/dashboard ───────────────────────────────────────────
  describe('GET /students/:id/dashboard', () => {
    it('should return 200 with dashboard data', async () => {
      mockStudentService.getDashboard.mockResolvedValue({
        profile: { id: 1, name: 'Sara Tekle', class: 'Grade 5' },
        attendance: { last30: { present: 20, absent: 2, percentage: 90.9 } },
        latestResults: [],
        upcomingExams: [],
      });

      const res = await request(app.getHttpServer())
        .get('/students/1/dashboard')
        .set('Authorization', 'Bearer test_token')
        .expect(200);

      expect(res.body.profile).toBeDefined();
      expect(res.body.attendance).toBeDefined();
    });

    it('should return 404 when student not found', async () => {
      const { NotFoundException } = require('@nestjs/common');
      mockStudentService.getDashboard.mockRejectedValue(
        new NotFoundException('Student not found'),
      );

      await request(app.getHttpServer())
        .get('/students/9999/dashboard')
        .set('Authorization', 'Bearer test_token')
        .expect(404);
    });
  });

  // ── GET /students/:id/documents ───────────────────────────────────────────
  describe('GET /students/:id/documents', () => {
    it('should return 200 with document list', async () => {
      mockStudentService.getStudentDocuments.mockResolvedValue([
        { id: 1, documentType: 'PHOTO', fileName: 'photo.jpg', studentId: 1 },
      ]);

      const res = await request(app.getHttpServer())
        .get('/students/1/documents')
        .set('Authorization', 'Bearer test_token')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].documentType).toBe('PHOTO');
    });
  });

  // ── POST /students/:id/schedule-test ─────────────────────────────────────
  describe('POST /students/:id/schedule-test', () => {
    it('should return 201 and test record', async () => {
      mockStudentService.scheduleAdmissionTest.mockResolvedValue({
        id: 1,
        studentId: 1,
        testType: 'WRITTEN',
        testDate: new Date().toISOString(),
      });

      const res = await request(app.getHttpServer())
        .post('/students/1/schedule-test')
        .set('Authorization', 'Bearer test_token')
        .send({ testDate: new Date(Date.now() + 7 * 86400000).toISOString(), testType: 'WRITTEN' })
        .expect(201);

      expect(res.body.testType).toBe('WRITTEN');
    });
  });

  // ── POST /students/:id/record-test-result ─────────────────────────────────
  describe('POST /students/:id/record-test-result', () => {
    it('should return 201 and updated test record', async () => {
      mockStudentService.recordAdmissionTestResult.mockResolvedValue({
        id: 1,
        studentId: 1,
        score: 85,
        remarks: 'PASS: Good performance',
      });

      const res = await request(app.getHttpServer())
        .post('/students/1/record-test-result')
        .set('Authorization', 'Bearer test_token')
        .send({ score: 85, result: 'PASS', remarks: 'Good performance' })
        .expect(201);

      expect(res.body.score).toBe(85);
    });

    it('should return 404 when no test is scheduled for the student', async () => {
      const { NotFoundException } = require('@nestjs/common');
      mockStudentService.recordAdmissionTestResult.mockRejectedValue(
        new NotFoundException('No admission test found for this student'),
      );

      await request(app.getHttpServer())
        .post('/students/9999/record-test-result')
        .set('Authorization', 'Bearer test_token')
        .send({ score: 70, result: 'PASS' })
        .expect(404);
    });
  });

  // ── POST /students/bulk ───────────────────────────────────────────────────
  describe('POST /students/bulk', () => {
    it('should return 201 with summary of successful and failed creations', async () => {
      mockStudentService.bulkCreateStudents.mockResolvedValue({
        successful: [{ studentId: 'STU20260001', status: 'SUCCESS' }],
        failed: [],
      });

      const res = await request(app.getHttpServer())
        .post('/students/bulk')
        .set('Authorization', 'Bearer test_token')
        .send({ students: [validCreatePayload] })
        .expect(201);

      expect(res.body.successful).toHaveLength(1);
      expect(res.body.failed).toHaveLength(0);
    });
  });

  // ── GET /students/:id/admission-form ─────────────────────────────────────
  describe('GET /students/:id/admission-form', () => {
    it('should return 200 with admission form data', async () => {
      mockStudentService.generateAdmissionForm.mockResolvedValue({
        student: mockStudent,
        formId: 'ADM-STU20260001-123456',
        generatedAt: new Date().toISOString(),
      });

      const res = await request(app.getHttpServer())
        .get('/students/1/admission-form')
        .set('Authorization', 'Bearer test_token')
        .expect(200);

      expect(res.body.formId).toMatch(/^ADM-/);
    });
  });
});
