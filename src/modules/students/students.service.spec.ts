import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from './students.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

// ─── Prisma transaction mock helper ──────────────────────────────────────────
// Returns a tx object that mirrors the mocked prisma methods so $transaction
// callbacks receive the same mock interface.
const makeTx = (overrides: Partial<typeof mockPrisma> = {}) => ({
  ...mockPrisma,
  ...overrides,
});

// ─── Prisma mock ──────────────────────────────────────────────────────────────
const mockPrisma = {
  student: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  role: {
    findUnique: jest.fn(),
  },
  academicSession: {
    findUnique: jest.fn(),
  },
  class: {
    findUnique: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  studentParent: {
    deleteMany: jest.fn(),
  },
  examResult: {
    count: jest.fn(),
  },
  attendance: {
    count: jest.fn(),
  },
  bill: {
    count: jest.fn(),
  },
  bookIssue: {
    count: jest.fn(),
  },
  studentDocument: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  studentInquiry: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  admissionTest: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('student_jwt_token'),
};

const mockEmailService = {
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
};

// ─── Shared fixtures ──────────────────────────────────────────────────────────
const validCreateDto = {
  firstName: 'Sara',
  lastName: 'Tekle',
  email: 'sara@student.com',
  phone: '0911111111',
  gender: 'FEMALE',
  dateOfBirth: '2010-05-15',
  address: 'Addis Ababa',
  city: 'Addis Ababa',
  state: 'Addis Ababa',
  pincode: '1000',
  nationality: 'Ethiopian',
  guardianName: 'Marta Tekle',
  guardianPhone: '0922222222',
  guardianRelation: 'MOTHER',
  sessionId: 1,
  termsAccepted: true,
};

const mockStudent = {
  id: 1,
  studentId: 'STU20260001',
  firstName: 'Sara',
  lastName: 'Tekle',
  email: 'sara@student.com',
  status: 'ACTIVE',
  userId: 10,
  classId: 1,
  sectionId: 1,
  deletedAt: null,
  user: { id: 10, isActive: true, email: 'sara@student.com' },
};

const deletedStudent = {
  ...mockStudent,
  status: 'DELETED',
  deletedAt: new Date(),
};

// ─── Test suite ───────────────────────────────────────────────────────────────
describe('StudentService', () => {
  let service: StudentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
    jest.clearAllMocks();
  });

  // ── createStudent ──────────────────────────────────────────────────────────
  describe('createStudent()', () => {
    beforeEach(() => {
      // $transaction executes the callback with a tx object
      mockPrisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = makeTx();
        // Inside transaction, these are the calls made:
        tx.student.findFirst = jest.fn().mockResolvedValue(null); // no duplicate email
        tx.academicSession.findUnique = jest.fn().mockResolvedValue({ id: 1 }); // valid session
        tx.role.findUnique = jest.fn().mockResolvedValue({ id: 4 }); // STUDENT role
        tx.user.findUnique = jest.fn().mockResolvedValue(null); // email not taken
        tx.user.create = jest.fn().mockResolvedValue({ id: 10 });
        tx.student.findFirst = jest.fn().mockResolvedValue(null); // for generateStudentId
        tx.student.create = jest.fn().mockResolvedValue(mockStudent);
        tx.student.update = jest.fn().mockResolvedValue(mockStudent);
        tx.auditLog.create = jest.fn().mockResolvedValue({});
        // classAutoAssignmentConfig is needed for autoAssign
        (tx as any).classAutoAssignmentConfig = {
          findMany: jest.fn().mockResolvedValue([]),
        };
        return cb(tx);
      });
    });

    it('should create a student and return the record', async () => {
      const result = await service.createStudent(validCreateDto, 1);
      expect(result).toMatchObject({ id: 1, firstName: 'Sara' });
    });

    it('should throw BadRequestException when termsAccepted is false', async () => {
      await expect(
        service.createStudent({ ...validCreateDto, termsAccepted: false }, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should fire-and-forget welcome email after successful creation', async () => {
      await service.createStudent(validCreateDto, 1);
      // Give the async fire-and-forget a tick to execute
      await new Promise(r => setImmediate(r));
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'sara@student.com' }),
      );
    });

    it('should NOT send email when student has no email address', async () => {
      const noEmailDto = { ...validCreateDto, email: undefined };
      mockPrisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = makeTx();
        tx.student.findFirst = jest.fn().mockResolvedValue(null);
        tx.academicSession.findUnique = jest.fn().mockResolvedValue({ id: 1 });
        tx.role.findUnique = jest.fn().mockResolvedValue({ id: 4 });
        tx.user.findUnique = jest.fn().mockResolvedValue(null);
        tx.user.create = jest.fn().mockResolvedValue({ id: 10 });
        tx.student.create = jest.fn().mockResolvedValue({ ...mockStudent, email: null });
        tx.student.update = jest.fn().mockResolvedValue(mockStudent);
        tx.auditLog.create = jest.fn().mockResolvedValue({});
        (tx as any).classAutoAssignmentConfig = { findMany: jest.fn().mockResolvedValue([]) };
        return cb(tx);
      });

      await service.createStudent(noEmailDto, 1);
      await new Promise(r => setImmediate(r));
      expect(mockEmailService.sendWelcomeEmail).not.toHaveBeenCalled();
    });
  });

  // ── findOne ────────────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('should return the student record when found', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(mockStudent);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.firstName).toBe('Sara');
    });

    it('should throw NotFoundException when student does not exist', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(null);

      await expect(service.findOne(9999)).rejects.toThrow(NotFoundException);
    });
  });

  // ── updateStudentStatus ────────────────────────────────────────────────────
  describe('updateStudentStatus()', () => {
    it('should update student status successfully', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(mockStudent);
      mockPrisma.student.update.mockResolvedValue({ ...mockStudent, status: 'ENROLLED' });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.updateStudentStatus(1, 'ENROLLED', 1);

      expect(result.status).toBe('ENROLLED');
      expect(mockPrisma.student.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'ENROLLED' } }),
      );
    });

    it('should throw BadRequestException for invalid status string', async () => {
      await expect(
        service.updateStudentStatus(1, 'INVALID_STATUS', 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when student does not exist', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStudentStatus(9999, 'ACTIVE', 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should include reason in audit log description when provided', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(mockStudent);
      mockPrisma.student.update.mockResolvedValue({ ...mockStudent, status: 'WITHDRAWN' });
      mockPrisma.auditLog.create.mockResolvedValue({});

      await service.updateStudentStatus(1, 'WITHDRAWN', 1, 'Family relocation');

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            description: expect.stringContaining('Family relocation'),
          }),
        }),
      );
    });
  });

  // ── softDeleteStudent ──────────────────────────────────────────────────────
  describe('softDeleteStudent()', () => {
    beforeEach(() => {
      mockPrisma.student.findUnique.mockResolvedValue(mockStudent);
      // Default: no blocking dependencies
      mockPrisma.examResult.count.mockResolvedValue(0);
      mockPrisma.attendance.count.mockResolvedValue(0);
      mockPrisma.bill.count.mockResolvedValue(0);
      mockPrisma.bookIssue.count.mockResolvedValue(0);
    });

    it('should soft-delete student when no dependencies exist', async () => {
      mockPrisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = makeTx();
        tx.studentParent.deleteMany = jest.fn().mockResolvedValue({});
        tx.student.update = jest.fn().mockResolvedValue({});
        tx.user.update = jest.fn().mockResolvedValue({});
        tx.auditLog.create = jest.fn().mockResolvedValue({});
        return cb(tx);
      });

      const result = await service.softDeleteStudent(1, 1);
      expect(result.message).toBe('Student deleted successfully');
    });

    it('should throw NotFoundException when student does not exist', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(null);

      await expect(service.softDeleteStudent(9999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when exam results exist', async () => {
      mockPrisma.examResult.count.mockResolvedValue(3);

      await expect(service.softDeleteStudent(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when attendance records exist', async () => {
      mockPrisma.attendance.count.mockResolvedValue(10);

      await expect(service.softDeleteStudent(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when unpaid bills exist', async () => {
      mockPrisma.bill.count.mockResolvedValue(2);

      await expect(service.softDeleteStudent(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when books are currently issued', async () => {
      mockPrisma.bookIssue.count.mockResolvedValue(1);

      await expect(service.softDeleteStudent(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── restoreStudent ─────────────────────────────────────────────────────────
  describe('restoreStudent()', () => {
    it('should restore a deleted student and reactivate user', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(deletedStudent);
      mockPrisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = makeTx();
        tx.student.update = jest.fn().mockResolvedValue({ ...deletedStudent, status: 'ACTIVE' });
        tx.user.update = jest.fn().mockResolvedValue({});
        tx.auditLog.create = jest.fn().mockResolvedValue({});
        return cb(tx);
      });

      const result = await service.restoreStudent(1, 1);

      expect(result.message).toBe('Student restored successfully');
    });

    it('should throw NotFoundException when student does not exist', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(null);

      await expect(service.restoreStudent(9999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when student is not deleted', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(mockStudent); // status: ACTIVE

      await expect(service.restoreStudent(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should set status to ACTIVE in the transaction', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(deletedStudent);

      let capturedUpdate: any;
      mockPrisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = makeTx();
        tx.student.update = jest.fn().mockImplementation((args: any) => {
          capturedUpdate = args;
          return Promise.resolve({});
        });
        tx.user.update = jest.fn().mockResolvedValue({});
        tx.auditLog.create = jest.fn().mockResolvedValue({});
        return cb(tx);
      });

      await service.restoreStudent(1, 1);

      expect(capturedUpdate.data).toMatchObject({ status: 'ACTIVE', deletedAt: null });
    });

    it('should reactivate the linked user account', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(deletedStudent);

      let userUpdateArgs: any;
      mockPrisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = makeTx();
        tx.student.update = jest.fn().mockResolvedValue({});
        tx.user.update = jest.fn().mockImplementation((args: any) => {
          userUpdateArgs = args;
          return Promise.resolve({});
        });
        tx.auditLog.create = jest.fn().mockResolvedValue({});
        return cb(tx);
      });

      await service.restoreStudent(1, 1);

      expect(userUpdateArgs.data).toEqual({ isActive: true });
      expect(userUpdateArgs.where).toEqual({ id: deletedStudent.userId });
    });
  });

  // ── loginStudent ───────────────────────────────────────────────────────────
  describe('loginStudent()', () => {
    const loginDto = { studentId: 'STU20260001', password: 'Student@2026!' };

    it('should return JWT token on valid credentials', async () => {
      const passwordHash = require('bcrypt').hashSync('Student@2026!', 10);
      mockPrisma.student.findUnique.mockResolvedValue({
        ...mockStudent,
        status: 'ACTIVE',
        user: {
          id: 10,
          email: 'sara@student.com',
          passwordHash,
          isActive: true,
          firstName: 'Sara',
          lastName: 'Tekle',
          roleId: 4,
        },
      });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.loginStudent(loginDto);

      expect(result.token).toBeDefined();
      expect(result.message).toBe('Login successful');
    });

    it('should throw BadRequestException when student is PENDING', async () => {
      mockPrisma.student.findUnique.mockResolvedValue({
        ...mockStudent,
        status: 'PENDING',
        user: { id: 10, passwordHash: 'hash', isActive: true },
      });

      await expect(service.loginStudent(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when student not found', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(null);

      await expect(service.loginStudent(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException on wrong password', async () => {
      const passwordHash = require('bcrypt').hashSync('CorrectPass!', 10);
      mockPrisma.student.findUnique.mockResolvedValue({
        ...mockStudent,
        status: 'ACTIVE',
        user: {
          id: 10,
          passwordHash,
          isActive: true,
          email: 'sara@student.com',
          firstName: 'Sara',
          lastName: 'Tekle',
          roleId: 4,
        },
      });

      await expect(
        service.loginStudent({ studentId: 'STU20260001', password: 'WrongPass!' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── searchStudents ─────────────────────────────────────────────────────────
  describe('searchStudents()', () => {
    it('should return up to 10 matching students', async () => {
      const mockResults = [mockStudent, { ...mockStudent, id: 2 }];
      mockPrisma.student.findMany.mockResolvedValue(mockResults);

      const result = await service.searchStudents('Sara');

      expect(result).toHaveLength(2);
      expect(mockPrisma.student.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });

    it('should return empty array when no match found', async () => {
      mockPrisma.student.findMany.mockResolvedValue([]);

      const result = await service.searchStudents('nonexistent');

      expect(result).toEqual([]);
    });
  });
});
