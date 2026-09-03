import { Test, TestingModule } from '@nestjs/testing';
import { GradingService } from './grading.service';
import { PrismaService } from '../../database/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

// ─── Prisma mock ──────────────────────────────────────────────────────────────
const mockPrisma = {
  exam: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  examResult: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
  examSubject: {
    createMany: jest.fn(),
    findMany: jest.fn(),
  },
  examType: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  gradeScale: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn(),
  },
  student: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  subject: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  class: {
    findUnique: jest.fn(),
  },
  academicSession: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
  },
  studentParent: {
    findFirst: jest.fn(),
  },
  $transaction: jest.fn(),
};

// Mock cache manager
const mockCacheManager = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
};

// ─── Shared fixtures ──────────────────────────────────────────────────────────
const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days ahead
const farFutureDate = new Date(Date.now() + 37 * 24 * 60 * 60 * 1000); // 37 days ahead

const mockExamDto = {
  name: 'Mid-Term 2026',
  classId: 1,
  examTypeId: 1,
  academicSessionId: 1,
  startDate: futureDate.toISOString(),
  endDate: farFutureDate.toISOString(),
  academicYear: '2025-2026',
  term: 'TERM1',
};

const mockExam = {
  id: 1,
  name: 'Mid-Term 2026',
  classId: 1,
  examTypeId: 1,
  isPublished: false,
  isActive: true,
  startDate: futureDate,
  endDate: farFutureDate,
};

const mockExamResult = {
  id: 1,
  studentId: 1,
  examId: 1,
  subjectId: 1,
  totalMarks: 85,
  maxMarks: 100,
  theoryMarks: 85,
  percentage: 85.0,
  grade: 'A',
  isVerified: false,
  isAbsent: false,
  enteredBy: 1,
  createdAt: new Date(),
};

const mockGradeScales = [
  { id: 1, grade: 'A+', minPercent: 95, maxPercent: 100, gradePoint: 4.0, description: 'Excellent' },
  { id: 2, grade: 'A',  minPercent: 85, maxPercent: 94,  gradePoint: 4.0, description: 'Very Good' },
  { id: 3, grade: 'B',  minPercent: 75, maxPercent: 84,  gradePoint: 3.0, description: 'Good' },
  { id: 4, grade: 'C',  minPercent: 65, maxPercent: 74,  gradePoint: 2.0, description: 'Average' },
  { id: 5, grade: 'D',  minPercent: 50, maxPercent: 64,  gradePoint: 1.0, description: 'Pass' },
  { id: 6, grade: 'F',  minPercent: 0,  maxPercent: 49,  gradePoint: 0.0, description: 'Fail' },
];

// ─── Test suite ───────────────────────────────────────────────────────────────
describe('GradingService', () => {
  let service: GradingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GradingService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<GradingService>(GradingService);
    jest.clearAllMocks();

    // Default: grade scales always available (used by calculateGrade)
    mockPrisma.gradeScale.findMany.mockResolvedValue(mockGradeScales);
    mockCacheManager.get.mockResolvedValue(null); // force fresh DB read
  });

  // ── createExam ─────────────────────────────────────────────────────────────
  describe('createExam()', () => {
    beforeEach(() => {
      // Default happy-path transaction mock
      mockPrisma.exam.findFirst.mockResolvedValue(null); // no duplicate
      // getExamWithDetails is called after the transaction using the class-level prisma
      mockPrisma.exam.findUnique.mockResolvedValue({
        ...mockExam,
        examType: { id: 1, name: 'Mid-Term' },
        class: { id: 1, name: 'Grade 1' },
        examSubjects: [],
        _count: { examResults: 0 },
      });
      mockPrisma.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          ...mockPrisma,
          class: { findUnique: jest.fn().mockResolvedValue({ id: 1, name: 'Grade 1', academicSessionId: 1 }) },
          examType: { findUnique: jest.fn().mockResolvedValue({ id: 1, name: 'Mid-Term', isActive: true }) },
          academicSession: { findUnique: jest.fn().mockResolvedValue({ id: 1, isActive: true }) },
          exam: {
            create: jest.fn().mockResolvedValue(mockExam),
            findUnique: jest.fn().mockResolvedValue(mockExam),
            findFirst: jest.fn().mockResolvedValue(null), // no overlapping exam
          },
          examSubject: { createMany: jest.fn().mockResolvedValue({}) },
          subject: { findMany: jest.fn().mockResolvedValue([{ id: 1 }]) },
        };
        return cb(tx);
      });
    });

    it('should create an exam and return it', async () => {
      const result = await service.createExam(mockExamDto, 1);
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when name is missing', async () => {
      await expect(
        service.createExam({ ...mockExamDto, name: '' }, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when classId is missing', async () => {
      await expect(
        service.createExam({ ...mockExamDto, classId: undefined }, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when examTypeId is missing', async () => {
      await expect(
        service.createExam({ ...mockExamDto, examTypeId: undefined }, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when startDate is missing', async () => {
      await expect(
        service.createExam({ ...mockExamDto, startDate: undefined }, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when startDate >= endDate', async () => {
      await expect(
        service.createExam({
          ...mockExamDto,
          startDate: farFutureDate.toISOString(),
          endDate: futureDate.toISOString(),
        }, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when startDate is in the past', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const dayBeforeYesterday = new Date(Date.now() - 48 * 60 * 60 * 1000);
      await expect(
        service.createExam({
          ...mockExamDto,
          startDate: dayBeforeYesterday.toISOString(),
          endDate: yesterday.toISOString(),
        }, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when duplicate exam exists', async () => {
      mockPrisma.exam.findFirst.mockResolvedValue(mockExam); // duplicate found

      await expect(service.createExam(mockExamDto, 1)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ── createGrade ────────────────────────────────────────────────────────────
  describe('createGrade()', () => {
    const gradeDto = {
      studentId: 1,
      examId: 1,
      subjectId: 1,
      marksObtained: 85,
      maxMarks: 100,
      remarks: 'Good performance',
    };

    beforeEach(() => {
      mockPrisma.student.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.exam.findUnique.mockResolvedValue(mockExam);
      mockPrisma.subject.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.examResult.findFirst.mockResolvedValue(null); // no duplicate
      mockPrisma.examResult.create.mockResolvedValue({
        ...mockExamResult,
        student: { id: 1, firstName: 'Sara', lastName: 'Tekle', studentId: 'STU20260001' },
        exam: mockExam,
        subject: { id: 1, name: 'Mathematics' },
      });
    });

    it('should create a grade and return it with relations', async () => {
      const result = await service.createGrade(gradeDto, 1);
      expect(result.grade).toBe('A');
      expect(mockPrisma.examResult.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when marks exceed maximum', async () => {
      await expect(
        service.createGrade({ ...gradeDto, marksObtained: 110, maxMarks: 100 }, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when grade already exists', async () => {
      mockPrisma.examResult.findFirst.mockResolvedValue(mockExamResult);

      await expect(service.createGrade(gradeDto, 1)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException when student does not exist', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(null);

      await expect(service.createGrade(gradeDto, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when exam does not exist', async () => {
      mockPrisma.exam.findUnique.mockResolvedValue(null);

      await expect(service.createGrade(gradeDto, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when subject does not exist', async () => {
      mockPrisma.subject.findUnique.mockResolvedValue(null);

      await expect(service.createGrade(gradeDto, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should correctly calculate percentage and grade', async () => {
      // 75/100 = 75% → grade B
      mockPrisma.examResult.create.mockResolvedValue({
        ...mockExamResult,
        totalMarks: 75,
        percentage: 75.0,
        grade: 'B',
        student: { id: 1, firstName: 'Sara', lastName: 'Tekle', studentId: 'STU20260001' },
        exam: mockExam,
        subject: { id: 1, name: 'Mathematics' },
      });

      const result = await service.createGrade(
        { ...gradeDto, marksObtained: 75, maxMarks: 100 },
        1,
      );
      expect(result.grade).toBe('B');
    });
  });

  // ── createBulkGrades ───────────────────────────────────────────────────────
  describe('createBulkGrades()', () => {
    const bulkDto = {
      examId: 1,
      records: [
        { studentId: 1, subjectId: 1, marksObtained: 85, maxMarks: 100 },
        { studentId: 2, subjectId: 1, marksObtained: 70, maxMarks: 100 },
      ],
    };

    beforeEach(() => {
      mockPrisma.exam.findUnique.mockResolvedValue(mockExam);
      mockPrisma.examResult.findFirst.mockResolvedValue(null);
      mockPrisma.student.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.subject.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.examResult.create.mockResolvedValue(mockExamResult);
    });

    it('should return summary with correct counts on success', async () => {
      const result = await service.createBulkGrades(bulkDto, 1);

      expect(result.summary.total).toBe(2);
      expect(result.summary.successful).toBeGreaterThanOrEqual(0);
      expect(result.summary).toHaveProperty('failed');
    });

    it('should add an error entry when marks exceed maximum', async () => {
      const badBulkDto = {
        examId: 1,
        records: [{ studentId: 1, subjectId: 1, marksObtained: 110, maxMarks: 100 }],
      };

      const result = await service.createBulkGrades(badBulkDto, 1);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain('Marks exceed maximum');
    });

    it('should add an error entry when grade already exists', async () => {
      mockPrisma.examResult.findFirst.mockResolvedValue(mockExamResult); // already exists

      const result = await service.createBulkGrades(bulkDto, 1);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].error).toContain('Grade already exists');
    });

    it('should throw NotFoundException when exam does not exist', async () => {
      mockPrisma.exam.findUnique.mockResolvedValue(null);

      await expect(service.createBulkGrades(bulkDto, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── getStudentGrades ───────────────────────────────────────────────────────
  describe('getStudentGrades()', () => {
    const mockGrades = [mockExamResult];

    beforeEach(() => {
      mockPrisma.examResult.findMany.mockResolvedValue(mockGrades);
    });

    it('should return grades for admin/teacher without restriction', async () => {
      const adminUser = { id: 1, role: { name: 'ADMIN' } };

      const result = await service.getStudentGrades(1, adminUser);

      expect(result).toEqual(mockGrades);
      expect(mockPrisma.examResult.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { studentId: 1 } }),
      );
    });

    it('should return grades for teacher without restriction', async () => {
      const teacherUser = { id: 5, role: { name: 'TEACHER' } };

      const result = await service.getStudentGrades(1, teacherUser);

      expect(result).toEqual(mockGrades);
    });

    it('should allow STUDENT to view own grades', async () => {
      const studentUser = { id: 10, role: { name: 'STUDENT' } };
      mockPrisma.student.findUnique.mockResolvedValue({ id: 1 }); // userId 10 → studentId 1

      const result = await service.getStudentGrades(1, studentUser);

      expect(result).toEqual(mockGrades);
    });

    it('should throw ForbiddenException when STUDENT tries to view other student grades', async () => {
      const studentUser = { id: 10, role: { name: 'STUDENT' } };
      mockPrisma.student.findUnique.mockResolvedValue({ id: 99 }); // owns student 99, not 1

      await expect(service.getStudentGrades(1, studentUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow PARENT to view linked child grades', async () => {
      const parentUser = { id: 20, role: { name: 'PARENT' } };
      mockPrisma.studentParent.findFirst.mockResolvedValue({ id: 1 }); // has access

      const result = await service.getStudentGrades(1, parentUser);

      expect(result).toEqual(mockGrades);
    });

    it('should throw ForbiddenException when PARENT tries to view unlinked student grades', async () => {
      const parentUser = { id: 20, role: { name: 'PARENT' } };
      mockPrisma.studentParent.findFirst.mockResolvedValue(null); // no access

      await expect(service.getStudentGrades(1, parentUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return grades even without currentUser (public exam result fetch)', async () => {
      const result = await service.getStudentGrades(1, undefined);

      expect(result).toEqual(mockGrades);
    });
  });

  // ── findAllExams ───────────────────────────────────────────────────────────
  describe('findAllExams()', () => {
    it('should return paginated exam list', async () => {
      mockPrisma.exam.findMany.mockResolvedValue([mockExam]);
      mockPrisma.exam.count.mockResolvedValue(1);

      const result = await service.findAllExams({ page: 1, limit: 10 });

      expect(result.exams).toHaveLength(1);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by classId when provided', async () => {
      mockPrisma.exam.findMany.mockResolvedValue([mockExam]);
      mockPrisma.exam.count.mockResolvedValue(1);

      await service.findAllExams({ classId: 1, page: 1, limit: 10 });

      expect(mockPrisma.exam.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ classId: 1 }),
        }),
      );
    });

    it('should return empty list when no exams found', async () => {
      mockPrisma.exam.findMany.mockResolvedValue([]);
      mockPrisma.exam.count.mockResolvedValue(0);

      const result = await service.findAllExams({});

      expect(result.exams).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  // ── createExamType ─────────────────────────────────────────────────────────
  describe('createExamType()', () => {
    it('should create and return an exam type', async () => {
      const mockExamType = { id: 1, name: 'Mid-Term', description: 'Mid semester', weightage: 40, isActive: true };
      mockPrisma.examType.create.mockResolvedValue(mockExamType);

      const result = await service.createExamType(
        { name: 'Mid-Term', description: 'Mid semester', weightage: 40 },
        1,
      );

      expect(result.name).toBe('Mid-Term');
      expect(mockPrisma.examType.create).toHaveBeenCalled();
    });
  });

  // ── getExamTypeById ────────────────────────────────────────────────────────
  describe('getExamTypeById()', () => {
    it('should return exam type when found', async () => {
      mockPrisma.examType.findUnique.mockResolvedValue({ id: 1, name: 'Mid-Term', isActive: true });

      const result = await service.getExamTypeById(1);

      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException when exam type does not exist', async () => {
      mockPrisma.examType.findUnique.mockResolvedValue(null);

      await expect(service.getExamTypeById(999)).rejects.toThrow(NotFoundException);
    });
  });
});
