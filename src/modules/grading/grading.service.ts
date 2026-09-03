
import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ForbiddenException,
  ConflictException 
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'; // Specific error class
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateExamWithSubjectsDto } from './dto/create-exam-with-subjects.dto';

import { ReportCardDto } from './dto/report-card.dto';
import { PublishReportCardDto } from './dto/publish-report-card.dto';
import { ExportReportDto } from './dto/export-report.dto';
import { VerifyExamResultDto } from './dto/verify-exam-result.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { CreateExamTypeDto } from './dto/create-exam-type.dto';
import { UpdateExamTypeDto } from './dto/update-exam-type.dto';
// Define constants locally
const EXAM_STATUS = {
  SCHEDULED: 'SCHEDULED',
  ONGOING: 'ONGOING', 
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  POSTPONED: 'POSTPONED',
};

const DEFAULT_GRADE_SCALE = [
  { grade: 'A+', minPercent: 90, maxPercent: 100, gradePoint: 4.0 },
  { grade: 'A', minPercent: 80, maxPercent: 89, gradePoint: 3.7 },
  { grade: 'B+', minPercent: 70, maxPercent: 79, gradePoint: 3.3 },
  { grade: 'B', minPercent: 60, maxPercent: 69, gradePoint: 3.0 },
  { grade: 'C+', minPercent: 50, maxPercent: 59, gradePoint: 2.7 },
  { grade: 'C', minPercent: 40, maxPercent: 49, gradePoint: 2.3 },
  { grade: 'D', minPercent: 33, maxPercent: 39, gradePoint: 2.0 },
  { grade: 'F', minPercent: 0, maxPercent: 32, gradePoint: 0.0 },
];

@Injectable()
export class GradingService {
  private gradeScaleCache: any[] = null;
  private gradeScaleCacheTime: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000;
  constructor(private prisma: PrismaService) {}

  // ========== BASIC GRADE MANAGEMENT ========== //

  /**
 * Get grade scales with caching to reduce database queries
 * Cache expires every 5 minutes
 */

  async getGradeScales() {
  return this.getCachedGradeScales();
}

private async getCachedGradeScales() {
  const now = Date.now();
  
  // Check if cache is valid
  if (this.gradeScaleCache && (now - this.gradeScaleCacheTime) < this.CACHE_TTL) {
    return this.gradeScaleCache;
  }
  
  // Fetch fresh data
  this.gradeScaleCache = await this.prisma.gradeScale.findMany({
    where: { isActive: true },
    orderBy: { minPercent: 'desc' },
  });
  
  this.gradeScaleCacheTime = now;
  
  return this.gradeScaleCache;
}

/**
 * Invalidate grade scale cache (call when grade scales are updated)
 */
private invalidateGradeScaleCache() {
  this.gradeScaleCache = null;
  this.gradeScaleCacheTime = 0;
}


  async createGrade(createGradeDto: any, enteredById: number) {
    const { studentId, examId, subjectId, marksObtained, maxMarks, remarks } = createGradeDto;

    await this.validateStudentExists(studentId);
    await this.getExamById(examId);
    await this.validateSubjectExists(subjectId);

    if (marksObtained > maxMarks) {
      throw new BadRequestException('Marks obtained cannot exceed maximum marks');
    }

    const existingGrade = await this.prisma.examResult.findFirst({
      where: { studentId, examId, subjectId },
    });

    if (existingGrade) {
      throw new ConflictException('Grade already exists for this student, exam, and subject');
    }

    const percentage = (marksObtained / maxMarks) * 100;
    const grade = await this.calculateGrade(percentage);

    return this.prisma.examResult.create({
      data: {
        studentId,
        examId,
        subjectId,
        theoryMarks: marksObtained,
        totalMarks: marksObtained,
        maxMarks,
        percentage,
        grade: grade,
        isAbsent: false,
        enteredBy: enteredById,
        isVerified: false,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentId: true,
          },
        },
        exam: true,
        subject: true,
      },
    });
  }

  async createBulkGrades(bulkGradesDto: any, enteredById: number) {
    const { examId, records } = bulkGradesDto;

    await this.getExamById(examId);
    const results = [];
    const errors = [];

    for (const record of records) {
      try {
        if (record.marksObtained > record.maxMarks) {
          errors.push({ studentId: record.studentId, error: 'Marks exceed maximum' });
          continue;
        }

        const existingGrade = await this.prisma.examResult.findFirst({
          where: { 
            studentId: record.studentId, 
            examId, 
            subjectId: record.subjectId 
          },
        });

        if (existingGrade) {
          errors.push({ studentId: record.studentId, error: 'Grade already exists' });
          continue;
        }

        await this.validateStudentExists(record.studentId);
        await this.validateSubjectExists(record.subjectId);

        const percentage = (record.marksObtained / record.maxMarks) * 100;
        const grade = await this.calculateGrade(percentage);

        const createdGrade = await this.prisma.examResult.create({
          data: {
            studentId: record.studentId,
            examId,
            subjectId: record.subjectId,
            theoryMarks: record.marksObtained,
            totalMarks: record.marksObtained,
            maxMarks: record.maxMarks,
            percentage,
            grade: record.grade || grade,
            isAbsent: false,
            enteredBy: enteredById,
            isVerified: false,
          },
        });

        results.push(createdGrade);
      } catch (error:any) {
        errors.push({ studentId: record.studentId, error: error.message });
      }
    }

    return {
      success: results,
      errors,
      summary: {
        total: records.length,
        successful: results.length,
        failed: errors.length,
      },
    };
  }

  // ========== EXAM MANAGEMENT ========== //
async createExam(createExamDto: any, userId: number) {
  const { subjects, ...examData } = createExamDto;

  // FIX ISSUE 1: Validate required fields
  if (!examData.name) {
    throw new BadRequestException('Exam name is required');
  }
  if (!examData.classId) {
    throw new BadRequestException('Class ID is required');
  }
  if (!examData.examTypeId) {
    throw new BadRequestException('Exam type ID is required');
  }
  if (!examData.startDate || !examData.endDate) {
    throw new BadRequestException('Start date and end date are required');
  }

  // FIX ISSUE 2: Validate date range
  const startDate = new Date(examData.startDate);
  const endDate = new Date(examData.endDate);
  
  if (startDate >= endDate) {
    throw new BadRequestException('Start date must be before end date');
  }
  
  if (startDate < new Date()) {
    throw new BadRequestException('Start date cannot be in the past');
  }

  // FIX ISSUE 3: Check for duplicate exam
  const existingExam = await this.prisma.exam.findFirst({
    where: {
      name: examData.name,
      classId: examData.classId,
      term: examData.term,
      academicYear: examData.academicYear,
    },
  });

  if (existingExam) {
    throw new ConflictException(
      `Exam with name "${examData.name}" already exists for this class and term`
    );
  }

  return await this.prisma.$transaction(async (tx) => {
    // Validate exam data (class, exam type, etc.)
    await this.validateExamData(examData, tx);

    // Create the exam
    const exam = await tx.exam.create({
      data: {
        name: examData.name,
        examTypeId: examData.examTypeId,
        classId: examData.classId,
        academicSessionId: examData.academicSessionId,
        academicYear: examData.academicYear,
        term: examData.term,
        startDate: startDate,
        endDate: endDate,
        description: examData.description || null,
        isPublished: false,
        isActive: true,
        totalWeightage: examData.totalWeightage || null,
        passingCriteria: examData.passingCriteria || null,
        instructions: examData.instructions || null,
        createdBy: userId,
      },
    });

    // FIX ISSUE 4: Validate and create subjects if provided
    if (subjects && subjects.length > 0) {
      // Check for duplicate subject IDs
      const subjectIds = subjects.map(s => s.subjectId);
      const uniqueSubjectIds = new Set(subjectIds);
      
      if (subjectIds.length !== uniqueSubjectIds.size) {
        throw new BadRequestException('Duplicate subjects found in the list');
      }

      // Convert Set to number array with type assertion
      const subjectIdList = Array.from(uniqueSubjectIds) as number[];

      // Validate all subjects exist and are active
      const validSubjects = await tx.subject.findMany({
        where: { 
          id: { in: subjectIdList }, 
          isActive: true 
        },
        select: { id: true },
      });

      if (validSubjects.length !== uniqueSubjectIds.size) {
        throw new BadRequestException('One or more subjects are invalid or inactive');
      }

      // Validate max marks are positive
      for (const subject of subjects) {
        if (subject.maxMarks <= 0) {
          throw new BadRequestException(`Max marks for subject ${subject.subjectId} must be greater than 0`);
        }
        if (subject.minMarks < 0) {
          throw new BadRequestException(`Min marks for subject ${subject.subjectId} cannot be negative`);
        }
        if (subject.minMarks > subject.maxMarks) {
          throw new BadRequestException(`Min marks cannot exceed max marks for subject ${subject.subjectId}`);
        }
      }

      // Create exam subjects
      await tx.examSubject.createMany({
        data: subjects.map(subject => ({
          examId: exam.id,
          subjectId: subject.subjectId,
          examDate: new Date(subject.examDate),
          startTime: subject.startTime || null,
          endTime: subject.endTime || null,
          duration: subject.duration || null,
          maxMarks: subject.maxMarks,
          minMarks: subject.minMarks,
          isTheory: subject.isTheory ?? true,
          isPractical: subject.isPractical ?? false,
          practicalMarks: subject.practicalMarks || null,
          theoryMarks: subject.theoryMarks || null,
          roomNumber: subject.roomNumber || null,
          instructions: subject.instructions || null,
        })),
      });
    }

    // Return exam with full details
    return this.getExamWithDetails(exam.id);
  });
}
  async findAllExams(filters: {
  classId?: number;
  academicSessionId?: number;
  term?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { classId, academicSessionId, term, status, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where = {
    ...(classId && { classId }),
    // Remove academicSessionId since it doesn't exist in your schema
    ...(term && { term }),
    // Remove status since it doesn't exist in your schema
  };

  const [exams, total] = await Promise.all([
    this.prisma.exam.findMany({
      where,
      include: {
        examType: true,
        class: true,
        // REMOVE academicSession since it doesn't exist
        examSubjects: {
          include: {
            subject: true,
          },
        },
        _count: {
          select: {
            examResults: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { startDate: 'desc' },
    }),
    this.prisma.exam.count({ where }),
  ]);

  return {
    exams,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}


  async findExamById(id: number) {
    const exam = await this.getExamWithDetails(id);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    return exam;
  }

  
  async updateExam(id: number, updateExamDto: any, userId: number) {
    const exam = await this.prisma.exam.findUnique({ where: { id } });
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (exam.isPublished) {
      throw new ForbiddenException('Cannot update published exam');
    }

    const updateData: any = { ...updateExamDto };
    
    // Remove properties that don't exist in Exam model
    delete updateData.academicSession; // This is a relation, not a direct field
    delete updateData.reportCard; // This is a relation, not a direct field
    
    if (updateExamDto.startDate) {
      updateData.startDate = new Date(updateExamDto.startDate);
    }
    if (updateExamDto.endDate) {
      updateData.endDate = new Date(updateExamDto.endDate);
    }

    // FIXED: Only include valid status values
    if (updateExamDto.status && !Object.values(EXAM_STATUS).includes(updateExamDto.status)) {
      throw new BadRequestException('Invalid exam status');
    }

    const updatedExam = await this.prisma.exam.update({
      where: { id },
      data: updateData,
    });

    return this.getExamWithDetails(updatedExam.id);
  }

async publishExam(id: number, userId: number) {
  const exam = await this.prisma.exam.findUnique({
    where: { id },
    include: {
      examResults: true,
      examSubjects: true,
    },
  });

  if (!exam) {
    throw new NotFoundException('Exam not found');
  }

  // Check if all subjects have results
  const subjectsWithResults = new Set(exam.examResults.map(r => r.subjectId));
  const allSubjectsHaveResults = exam.examSubjects.every(s => subjectsWithResults.has(s.subjectId));

  if (!allSubjectsHaveResults) {
    const missingSubjects = exam.examSubjects.filter(s => !subjectsWithResults.has(s.subjectId));
    throw new BadRequestException(
      `Cannot publish exam. Missing results for subjects: ${missingSubjects.map(s => s.subjectId).join(', ')}`
    );
  }

  // Check if all results are verified
  const unverifiedResults = exam.examResults.filter(r => !r.isVerified);
  if (unverifiedResults.length > 0) {
    throw new BadRequestException(
      `Cannot publish exam. ${unverifiedResults.length} results are not verified.`
    );
  }

  // Generate and save report cards before publishing
  await this.generateReportCards(id);

  return this.prisma.exam.update({
    where: { id },
    data: {
      isPublished: true,
    },
  });
}
  // ========== EXAM RESULTS MANAGEMENT ========== //


  async verifyResults(examId: number, studentId: number, userId: number) {
    const results = await this.prisma.examResult.findMany({
      where: { examId, studentId },
    });

    if (results.length === 0) {
      throw new NotFoundException('No results found for verification');
    }

    return await this.prisma.examResult.updateMany({
      where: { examId, studentId },
      data: {
        isVerified: true,
        verifiedBy: userId,
      },
    });
  }

  // ========== GRADE SCALE MANAGEMENT ========== //

 async initializeGradeScale() {
  const existingScales = await this.prisma.gradeScale.count();
  
  if (existingScales === 0) {
    const result = await this.prisma.gradeScale.createMany({
      data: DEFAULT_GRADE_SCALE,
    });
    
    // Invalidate cache after initialization
    this.invalidateGradeScaleCache();
    
    return result;
  }

  return { message: 'Grade scale already initialized' };
}

async createGradeScale(createGradeScaleDto: any) {
  const { minPercent, maxPercent, gradePoint, ...data } = createGradeScaleDto;

  const overlappingScale = await this.prisma.gradeScale.findFirst({
    where: {
      OR: [
        {
          minPercent: { lte: maxPercent },
          maxPercent: { gte: minPercent },
        },
      ],
      isActive: true,
    },
  });

  if (overlappingScale) {
    throw new ConflictException('Grade scale range overlaps with existing scale');
  }

  const result = await this.prisma.gradeScale.create({
    data: {
      ...data,
      minPercent: minPercent,
      maxPercent: maxPercent,
      gradePoint: gradePoint,
    },
  });

  // Invalidate cache when grade scale changes
  this.invalidateGradeScaleCache();

  return result;
}
  // ========== ANALYTICS & REPORTS ========== //

  async getExamStatistics(examId: number) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: {
        class: true,
        examResults: {
          include: {
            student: true,
            subject: true,
          },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const results = exam.examResults;
    const totalStudents = await this.prisma.student.count({
      where: { classId: exam.classId },
    });

    const subjectWiseStats = await this.prisma.examResult.groupBy({
      by: ['subjectId'],
      where: { examId },
      _count: { studentId: true },
      _avg: { percentage: true },
      _max: { percentage: true },
      _min: { percentage: true },
    });

    const gradeDistribution = await this.prisma.examResult.groupBy({
      by: ['grade'],
      where: { examId },
      _count: { grade: true },
    });

    return {
      exam: {
        id: exam.id,
        name: exam.name,
        totalStudents,
        studentsWithResults: results.length,
      },
      subjectWiseStats,
      gradeDistribution,
      overall: {
        averagePercentage: results.length > 0 ? 
          results.reduce((sum, r) => sum + Number(r.percentage), 0) / results.length : 0,
        passPercentage: results.length > 0 ? 
          (results.filter(r => r.grade !== 'F').length / results.length) * 100 : 0,
      },
    };
  }


  async updateGradeScale(id: number, updateGradeScaleDto: any) {
  const result = await this.prisma.gradeScale.update({
    where: { id },
    data: updateGradeScaleDto,
  });

  // Invalidate cache when grade scale changes
  this.invalidateGradeScaleCache();

  return result;
}

async deleteGradeScale(id: number) {
  const result = await this.prisma.gradeScale.update({
    where: { id },
    data: { isActive: false },
  });

  // Invalidate cache when grade scale changes
  this.invalidateGradeScaleCache();

  return result;
}

async getStudentGrades(studentId: number, currentUser?: any) {
  const userRole = currentUser?.role?.name;
  const userId = currentUser?.id;

  // STUDENT can only see own grades
  if (userRole === 'STUDENT') {
    const student = await this.prisma.student.findUnique({
      where: { userId: userId },
      select: { id: true },
    });
    if (student?.id !== studentId) {
      throw new ForbiddenException('You can only view your own grades');
    }
  }
  
  // PARENT can only see linked children's grades
  if (userRole === 'PARENT') {
    const hasAccess = await this.prisma.studentParent.findFirst({
      where: { parent: { userId }, studentId },
    });
    if (!hasAccess) {
      throw new ForbiddenException('You can only view your children\'s grades');
    }
  }

  // Teacher and Admin can see all
  return this.prisma.examResult.findMany({
    where: { studentId },
    include: {
      exam: { include: { examType: true } },
      subject: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}
  async generateReportCard(studentId: number, academicSessionId: number) {
  const grades = await this.getStudentGrades(studentId);
  const student = await this.prisma.student.findUnique({
    where: { id: studentId },
    include: { 
      class: true,
      session: true,
    },
  });

  if (!student) {
    throw new NotFoundException('Student not found');
  }

  const finalResults = this.calculateFinalResults(grades);
  const performance = this.calculatePerformanceMetrics(grades);

  return {
    student: {
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      studentId: student.studentId,
      class: student.class?.name,
      session: student.session?.name,
    },
    grades: grades,
    finalResults,
    performance,
    generatedAt: new Date(),
  };
}

private calculatePerformanceMetrics(grades: any[]) {
  const totalExams = grades.length;
  const passedExams = grades.filter(g => Number(g.percentage) >= 40).length;
  const totalMarks = grades.reduce((sum, g) => sum + Number(g.totalMarks), 0);
  const totalMaxMarks = grades.reduce((sum, g) => sum + g.maxMarks, 0);
  const averagePercentage = totalExams > 0 
    ? grades.reduce((sum, g) => sum + Number(g.percentage), 0) / totalExams 
    : 0;

  return {
    totalExams,
    passedExams,
    failedExams: totalExams - passedExams,
    averagePercentage: Math.round(averagePercentage * 100) / 100,
    totalMarks,
    totalMaxMarks,
  };
}
  // ========== HELPER METHODS ========== //

  private async getExamById(examId: number) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    return exam;
  }

  private async validateStudentExists(studentId: number) {
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
  }

  private async validateSubjectExists(subjectId: number) {
    const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }
  }

  private async validateExamData(examData: any, tx: any) {
  // Validate Class exists
  const classRecord = await tx.class.findUnique({
    where: { id: examData.classId },
    select: { id: true, name: true, academicSessionId: true },
  });

  if (!classRecord) {
    throw new NotFoundException(`Class with ID ${examData.classId} not found`);
  }

  // Validate Exam Type exists
  const examType = await tx.examType.findUnique({
    where: { id: examData.examTypeId },
    select: { id: true, name: true, isActive: true },
  });

  if (!examType) {
    throw new NotFoundException(`Exam type with ID ${examData.examTypeId} not found`);
  }

  if (!examType.isActive) {
    throw new BadRequestException(`Exam type "${examType.name}" is not active`);
  }

  // Validate Academic Session (if provided)
  if (examData.academicSessionId) {
    const academicSession = await tx.academicSession.findUnique({
      where: { id: examData.academicSessionId },
      select: { id: true, isActive: true, startDate: true, endDate: true },
    });

    if (!academicSession) {
      throw new NotFoundException(`Academic session with ID ${examData.academicSessionId} not found`);
    }

    if (!academicSession.isActive) {
      throw new BadRequestException('Cannot create exam for an inactive academic session');
    }

    // Check if exam dates are within academic session
    const examStart = new Date(examData.startDate);
    const examEnd = new Date(examData.endDate);
    
    if (examStart < academicSession.startDate || examEnd > academicSession.endDate) {
      throw new BadRequestException(
        'Exam dates must be within the academic session date range'
      );
    }
  }

  // Check for overlapping exams in same class
  const overlappingExam = await tx.exam.findFirst({
    where: {
      classId: examData.classId,
      term: examData.term,
      OR: [
        {
          startDate: { lte: new Date(examData.endDate) },
          endDate: { gte: new Date(examData.startDate) },
        },
      ],
      id: { not: examData.id }, // Exclude current exam when updating
    },
  });

  if (overlappingExam) {
    throw new ConflictException(
      'Exam dates overlap with an existing exam in the same class and term'
    );
  }
}

 private async getExamWithDetails(id: number) {
  return this.prisma.exam.findUnique({
    where: { id },
    include: {
      examType: true,
      class: true,
      // REMOVE academicSession since it doesn't exist
      createdByUser: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      examSubjects: {
        include: {
          subject: true,
        },
      },
      examResults: {
        include: {
          student: true,
          subject: true,
          enteredByUser: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
    },
  });
}
  private async calculateGrade(percentage: number): Promise<string> {
    const gradeScale = await this.prisma.gradeScale.findFirst({
      where: {
        minPercent: { lte: percentage },
        maxPercent: { gte: percentage },
        isActive: true,
      },
      orderBy: { minPercent: 'desc' },
    });

    return gradeScale ? gradeScale.grade : 'F';
  }

  private calculateFinalResults(grades: any[]) {
    const totalMarks = grades.reduce((sum, grade) => sum + grade.maxMarks, 0);
    const obtainedMarks = grades.reduce((sum, grade) => sum + Number(grade.totalMarks), 0);
    const overallPercentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

    return {
      totalMarks,
      obtainedMarks,
      overallPercentage: Math.round(overallPercentage * 100) / 100,
      overallGrade: overallPercentage >= 40 ? 'PASS' : 'FAIL',
    };
  }

  // Additional compatibility methods
  async getReportCard(studentId: number) {
    // Get current academic session or use a default
    const currentSession = await this.prisma.academicSession.findFirst({
      where: { isActive: true },
      orderBy: { startDate: 'desc' },
    });

    if (!currentSession) {
      throw new NotFoundException('No active academic session found');
    }

    return this.generateReportCard(studentId, currentSession.id);
  }

  async createExamWithSubjects(
  dto: CreateExamWithSubjectsDto,
  userId: number,
) {
  return this.prisma.$transaction(async (tx) => {

    // 1️⃣ Validate Exam Type
    const examType = await tx.examType.findUnique({
      where: { id: dto.examTypeId },
    });
    if (!examType) {
      throw new BadRequestException('Invalid examTypeId');
    }

    // 2️⃣ Validate Academic Session
    const session = await tx.academicSession.findUnique({
      where: { id: dto.academicSessionId },
    });
    if (!session) {
      throw new BadRequestException('Invalid academicSessionId');
    }

    // ✅ FIX (missing in your code)
    // 3️⃣ Validate Class
    const classRecord = await tx.class.findUnique({
      where: { id: dto.classId },
    });
    if (!classRecord) {
      throw new BadRequestException('Invalid classId');
    }

    // 4️⃣ Create Exam (SAFE)
    const exam = await tx.exam.create({
      data: {
        name: dto.name,
        examTypeId: dto.examTypeId,
        classId: dto.classId,
        academicSessionId: dto.academicSessionId,
        academicYear: dto.academicYear,
        term: dto.term,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        description: dto.description,
        isPublished: dto.isPublished ?? false,
        totalWeightage: dto.totalWeightage,
        passingCriteria: dto.passingCriteria,
        instructions: dto.instructions,
        createdBy: userId,
      },
    });

    // 5️⃣ Prevent duplicate subjects
    const subjectIds = dto.subjects.map(s => s.subjectId);
    const uniqueSubjectIds = new Set(subjectIds);

    if (subjectIds.length !== uniqueSubjectIds.size) {
      throw new BadRequestException('Duplicate subjectId detected');
    }

    // 6️⃣ Validate subjects exist
    const subjectsCount = await tx.subject.count({
      where: { id: { in: [...uniqueSubjectIds] } },
    });

    if (subjectsCount !== uniqueSubjectIds.size) {
      throw new BadRequestException('One or more subjects do not exist');
    }

    // 7️⃣ Create Exam Subjects
    await tx.examSubject.createMany({
      data: dto.subjects.map(s => ({
        examId: exam.id,
        subjectId: s.subjectId,
        examDate: new Date(s.examDate),
        startTime: s.startTime,
        endTime: s.endTime,
        duration: s.duration,
        maxMarks: s.maxMarks,
        minMarks: s.minMarks,
        isTheory: s.isTheory ?? true,
        isPractical: s.isPractical ?? false,
        practicalMarks: s.practicalMarks ?? null,
        theoryMarks: s.theoryMarks ?? null,
        roomNumber: s.roomNumber,
        instructions: s.instructions,
      })),
    });

    // 8️⃣ Response
    return {
      statusCode: 201,
      message: 'Exam created with subjects successfully',
      data: {
        examId: exam.id,
        subjectsCount: dto.subjects.length,
      },
    };
  });
}

  async getAcademicHistory(studentId: number) {
    return this.getStudentGrades(studentId);
  }

  async getClassPerformance(classId: number, examId?: number) {
    const where: any = {};
    if (examId) {
      where.examId = examId;
    } else {
      where.exam = { classId };
    }

    const grades = await this.prisma.examResult.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentId: true,
          },
        },
        subject: true,
        exam: true,
      },
    });

    const totalStudents = await this.prisma.student.count({ where: { classId } });
    const studentsWithGrades = [...new Set(grades.map(g => g.studentId))].length;

    const subjectPerformance = await this.calculateSubjectPerformance(grades);

    return {
      classId,
      totalStudents,
      studentsWithGrades,
      subjectPerformance,
      grades,
    };
  }

  private async calculateSubjectPerformance(grades: any[]) {
    const subjectGroups = grades.reduce((groups, grade) => {
      const subjectId = grade.subjectId;
      if (!groups[subjectId]) {
        groups[subjectId] = {
          subject: grade.subject,
          grades: [],
          totalMarks: 0,
          maxMarks: 0,
        };
      }
      groups[subjectId].grades.push(grade);
      groups[subjectId].totalMarks += Number(grade.totalMarks);
      groups[subjectId].maxMarks += grade.maxMarks;
      return groups;
    }, {});

    return Object.values(subjectGroups).map((group: any) => ({
      subject: group.subject,
      averageMarks: group.totalMarks / group.grades.length,
      averagePercentage: (group.totalMarks / group.maxMarks) * 100,
      passedStudents: group.grades.filter((g: any) => Number(g.percentage) >= 40).length,
      totalStudents: group.grades.length,
    }));
  }
  // ================= REPORT CARD =================

async getStudentReportCard(dto: ReportCardDto) {
  if (dto.examId) {
    return this.generateReportCards(dto.examId);
  }
  return this.getReportCard(dto.studentId);
}

async publishReportCards(dto: PublishReportCardDto, userId: number) {
  const exam = await this.prisma.exam.findUnique({
    where: { id: dto.examId },
  });

  if (!exam) {
    throw new NotFoundException('Exam not found');
  }

  return {
    message: 'Report cards published successfully',
    examId: dto.examId,
    publishedBy: userId,
    publishedAt: new Date(),
  };
}

async exportExamReport(dto: ExportReportDto) {
  const records = await this.generateReportCards(dto.examId);

  return {
    format: dto.format,
    totalRecords: records.length,
    data: records,
    exportedAt: new Date(),
  };
}



async verifyExam(dto: VerifyExamResultDto, userId: number) {
  return this.verifyResults(dto.examId, dto.studentId, userId);
}



async getAnalytics(dto: AnalyticsQueryDto) {
  if (dto.examId) {
    return this.getExamStatistics(dto.examId);
  }

  if (dto.classId) {
    return this.getClassPerformance(dto.classId);
  }

  throw new BadRequestException('examId or classId is required');
}




async createExamType(dto: CreateExamTypeDto, userId: number) {
    try {
      return await this.prisma.examType.create({
        data: {
          name: dto.name,
          description: dto.description,
          weightage: new Prisma.Decimal(dto.weightage),
          order: dto.order ?? 0,
          isActive: dto.isActive ?? true,
          
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          
          throw new ConflictException('An exam type with this name already exists.');
        }
      }
      throw error; 
    }
  }

  async getAllExamTypes(filters?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ExamTypeWhereInput = {};
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [examTypes, total] = await Promise.all([
      this.prisma.examType.findMany({
        where,
        skip,
        take: limit,
        orderBy: { order: 'asc' },
      }),
      this.prisma.examType.count({ where }),
    ]);

    return {
      data: examTypes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getExamTypeById(id: number) {
    const examType = await this.prisma.examType.findUnique({
      where: { id },
    });

    if (!examType) {
      throw new NotFoundException(`Exam type with ID ${id} not found.`);
    }

    return examType;
  }

  async updateExamType(id: number, dto: Partial<CreateExamTypeDto>, userId: number) {
    await this.getExamTypeById(id); 

    try {
      return await this.prisma.examType.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          weightage: dto.weightage !== undefined ? new Prisma.Decimal(dto.weightage) : undefined,
          order: dto.order,
          isActive: dto.isActive,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('An exam type with this name already exists.');
        }
      }
      throw error;
    }
  }

  async deleteExamType(id: number) {
    await this.getExamTypeById(id); 

    return await this.prisma.examType.update({
      where: { id },
      data: { isActive: false },
    });

  
  }

  
private async calculateGradeSync(percentage: number): Promise<string> {
  const gradeScales = await this.getCachedGradeScales();
  const scale = gradeScales.find(s => percentage >= s.minPercent && percentage <= s.maxPercent);
  return scale?.grade || 'F';
}

async enterBulkResults(bulkResultsDto: any, userId: number) {
  const { examId, results } = bulkResultsDto;

  const exam = await this.prisma.exam.findUnique({
    where: { id: examId },
    include: { examSubjects: true },
  });

  if (!exam) {
    throw new NotFoundException('Exam not found');
  }

  if (!exam.isPublished) {
    throw new ForbiddenException('Cannot enter results for unpublished exam');
  }

  // Check for duplicate subject per student
  const studentSubjectMap = new Map();
  for (const result of results) {
    const key = `${result.studentId}-${result.subjectId}`;
    if (studentSubjectMap.has(key)) {
      throw new BadRequestException(
        `Duplicate subject ${result.subjectId} for student ${result.studentId}`
      );
    }
    studentSubjectMap.set(key, true);
  }

  return await this.prisma.$transaction(async (tx) => {
    const createdResults = [];

    for (const result of results) {
      const subjectInExam = exam.examSubjects.find(
        es => es.subjectId === result.subjectId
      );

      if (!subjectInExam) {
        throw new BadRequestException(
          `Subject ID ${result.subjectId} not found in exam`
        );
      }

      if (!result.isAbsent) {
        const maxMarks = subjectInExam.maxMarks;
        const theoryMarks = result.theoryMarks || 0;
        const practicalMarks = result.practicalMarks || 0;
        const totalMarks = theoryMarks + practicalMarks;

        if (totalMarks > maxMarks) {
          throw new BadRequestException(
            `Total marks (${totalMarks}) exceed maximum marks (${maxMarks}) for student ${result.studentId}`
          );
        }

        const percentage = (totalMarks / maxMarks) * 100;
        const grade = await this.calculateGrade(percentage);

        const examResult = await tx.examResult.upsert({
          where: {
            examId_studentId_subjectId: {
              examId,
              studentId: result.studentId,
              subjectId: result.subjectId,
            },
          },
          update: {
            theoryMarks,
            practicalMarks,
            totalMarks,
            maxMarks,
            percentage,
            grade,
            isAbsent: false,
            remarks: result.remarks,
            enteredBy: userId,
          },
          create: {
            examId,
            studentId: result.studentId,
            subjectId: result.subjectId,
            theoryMarks,
            practicalMarks,
            totalMarks,
            maxMarks,
            percentage,
            grade,
            isAbsent: false,
            remarks: result.remarks,
            enteredBy: userId,
          },
        });

        createdResults.push(examResult);
      } else {
        const examResult = await tx.examResult.upsert({
          where: {
            examId_studentId_subjectId: {
              examId,
              studentId: result.studentId,
              subjectId: result.subjectId,
            },
          },
          update: {
            theoryMarks: null,
            practicalMarks: null,
            totalMarks: 0,
            maxMarks: subjectInExam.maxMarks,
            percentage: 0,
            grade: 'F',
            isAbsent: true,
            remarks: result.remarks || 'Absent',
            enteredBy: userId,
          },
          create: {
            examId,
            studentId: result.studentId,
            subjectId: result.subjectId,
            theoryMarks: null,
            practicalMarks: null,
            totalMarks: 0,
            maxMarks: subjectInExam.maxMarks,
            percentage: 0,
            grade: 'F',
            isAbsent: true,
            remarks: result.remarks || 'Absent',
            enteredBy: userId,
          },
        });

        createdResults.push(examResult);
      }
    }

    return createdResults;
  });
}


async generateReportCards(examId: number) {
  const exam = await this.prisma.exam.findUnique({
    where: { id: examId },
    include: { class: true, examResults: { include: { student: true } } },
  });

  if (!exam) {
    throw new NotFoundException('Exam not found');
  }

  const students = await this.prisma.student.findMany({
    where: { classId: exam.classId },
    include: { user: true },
  });

  const reportCards = [];

  for (const student of students) {
    const results = exam.examResults.filter(r => r.studentId === student.id);
    
    if (results.length === 0) continue;

    const totalMarks = results.reduce((sum, r) => sum + Number(r.totalMarks), 0);
    const maxTotalMarks = results.reduce((sum, r) => sum + r.maxMarks, 0);
    const percentage = maxTotalMarks > 0 ? (totalMarks / maxTotalMarks) * 100 : 0;
    const finalGrade = await this.calculateGrade(percentage);

    // Calculate rank
    const allStudentPercentages = await this.prisma.examResult.groupBy({
      by: ['studentId'],
      where: { examId },
      _avg: { percentage: true },
    });
    
    const sorted = allStudentPercentages.sort((a, b) => Number(b._avg.percentage) - Number(a._avg.percentage));
    const rank = sorted.findIndex(s => s.studentId === student.id) + 1;

    // SAVE TO DATABASE
    const reportCard = await this.prisma.reportCard.upsert({
      where: {
        studentId_examId: {
          studentId: student.id,
          examId: examId,
        },
      },
      update: {
        totalMarks: maxTotalMarks,
        obtainedMarks: totalMarks,
        percentage: percentage,
        finalGrade: finalGrade,
        rank: rank,
      },
      create: {
        studentId: student.id,
        examId: examId,
        classId: exam.classId,
        academicSessionId: exam.class.academicSessionId,
        totalMarks: maxTotalMarks,
        obtainedMarks: totalMarks,
        percentage: percentage,
        finalGrade: finalGrade,
        rank: rank,
      },
    });

    reportCards.push({
      ...reportCard,
      studentName: `${student.firstName} ${student.lastName}`,
      studentCode: student.studentId,
    });
  }

  return reportCards;
}

async generateTranscript(studentId: number, academicSessionId?: number, currentUser?: any) {
  // Authorization check
  if (currentUser?.role?.name === 'STUDENT') {
    const student = await this.prisma.student.findUnique({
      where: { userId: currentUser.id },
      select: { id: true },
    });
    if (student?.id !== studentId) {
      throw new ForbiddenException('You can only view your own transcript');
    }
  }

  const student = await this.prisma.student.findUnique({
    where: { id: studentId },
    include: { class: true, user: true },
  });

  if (!student) {
    throw new NotFoundException('Student not found');
  }

  const where: any = { studentId };
  if (academicSessionId) {
    where.exam = { academicSessionId };
  }

  const examResults = await this.prisma.examResult.findMany({
    where,
    include: {
      exam: {
        include: { examType: true },
      },
      subject: true,
    },
    orderBy: { exam: { startDate: 'asc' } },
  });

  // Calculate overall GPA
  let totalGradePoints = 0;
  let totalCredits = 0;

  for (const result of examResults) {
    const percentage = Number(result.percentage); // FIX: Convert Decimal to number
    const gradePoint = await this.getGradePoint(percentage);
    const credits = 1;
    totalGradePoints += gradePoint * credits;
    totalCredits += credits;
  }

  const overallGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

  return {
    student: {
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      studentCode: student.studentId,
      class: student.class?.name,
    },
    summary: {
      totalExams: examResults.length,
      totalSubjects: new Set(examResults.map(r => r.subjectId)).size,
      overallGPA: Math.round(overallGPA * 100) / 100,
    },
    generatedAt: new Date(),
  };
}

private async getGradePoint(percentage: number): Promise<number> {
  const gradeScales = await this.getCachedGradeScales();
  const scale = gradeScales.find(s => percentage >= s.minPercent && percentage <= s.maxPercent);
  return scale?.gradePoint || 0;
}

}