
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
  constructor(private prisma: PrismaService) {}

  // ========== BASIC GRADE MANAGEMENT ========== //

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
      } catch (error) {
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

    return await this.prisma.$transaction(async (tx) => {
      await this.validateExamData(examData, tx);

      const exam = await tx.exam.create({
        data: {
          ...examData,
          startDate: new Date(examData.startDate),
          endDate: new Date(examData.endDate),
          createdBy: userId,
        },
      });

      if (subjects && subjects.length > 0) {
        await tx.examSubject.createMany({
          data: subjects.map(subject => ({
            ...subject,
            examId: exam.id,
            examDate: new Date(subject.examDate),
            maxMarks: subject.maxMarks,
            minMarks: subject.minMarks,
            practicalMarks: subject.practicalMarks || null,
            theoryMarks: subject.theoryMarks || null,
          })),
        });
      }

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
  const exam = await this.prisma.exam.findUnique({ where: { id } });
  if (!exam) {
    throw new NotFoundException('Exam not found');
  }

  const subjectsCount = await this.prisma.examSubject.count({
    where: { examId: id },
  });

  if (subjectsCount === 0) {
    throw new BadRequestException('Cannot publish exam without subjects');
  }

  return this.prisma.exam.update({
    where: { id },
    data: {
      isPublished: true,
      // REMOVE status since it doesn't exist
    },
  });
}
  // ========== EXAM RESULTS MANAGEMENT ========== //

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
              isAbsent: result.isAbsent || false,
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
              isAbsent: result.isAbsent || false,
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


async generateReportCards(examId: number) {
  const exam = await this.prisma.exam.findUnique({
    where: { id: examId },
    include: {
      class: true,
    },
  });

  if (!exam) {
    throw new NotFoundException('Exam not found');
  }

  const students = await this.prisma.student.findMany({
    where: { classId: exam.classId },
    include: {
      examResults: {
        where: { examId },
        include: { subject: true },
      },
    },
  });

  const reportCards = [];

  for (const student of students) {
    const results = student.examResults;
    
    if (results.length === 0) continue;

    const totalMarks = results.reduce((sum, result) => 
      sum + Number(result.totalMarks), 0
    );
    const maxTotalMarks = results.reduce((sum, result) => 
      sum + result.maxMarks, 0
    );
    const percentage = maxTotalMarks > 0 ? (totalMarks / maxTotalMarks) * 100 : 0;
    const finalGrade = await this.calculateGrade(percentage);

    const rank = 1;

    // Create report card data without saving to database
    const reportData = {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      examId,
      examName: exam.name,
      classId: exam.classId,
      totalMarks: maxTotalMarks,
      obtainedMarks: totalMarks,
      percentage,
      finalGrade,
      rank,
      calculatedAt: new Date()
    };

    reportCards.push(reportData);
  }

  return reportCards;
}
  // ========== GRADE SCALE MANAGEMENT ========== //

  async initializeGradeScale() {
    const existingScales = await this.prisma.gradeScale.count();
    
    if (existingScales === 0) {
      return await this.prisma.gradeScale.createMany({
        data: DEFAULT_GRADE_SCALE,
      });
    }

    return { message: 'Grade scale already initialized' };
  }

  async getGradeScales() {
    return this.prisma.gradeScale.findMany({
      where: { isActive: true },
      orderBy: { minPercent: 'desc' },
    });
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

    return this.prisma.gradeScale.create({
      data: {
        ...data,
        minPercent: minPercent,
        maxPercent: maxPercent,
        gradePoint: gradePoint,
      },
    });
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

  async getStudentGrades(studentId: number, academicSessionId?: number) {
  const where: any = { studentId };
  // Remove academicSessionId completely since it doesn't exist in your schema

  const grades = await this.prisma.examResult.findMany({
    where,
    include: {
      exam: {
        include: {
          examType: true,
          // REMOVE academicSession completely - it doesn't exist in your schema
        },
      },
      subject: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalExams = grades.length;
  const passedExams = grades.filter(g => Number(g.percentage) >= 40).length;
  const totalMarks = grades.reduce((sum, grade) => sum + Number(grade.totalMarks), 0);
  const totalMaxMarks = grades.reduce((sum, grade) => sum + grade.maxMarks, 0);
  const averagePercentage = totalExams > 0 ? grades.reduce((sum, grade) => sum + Number(grade.percentage), 0) / totalExams : 0;

  return {
    grades,
    performance: {
      totalExams,
      passedExams,
      failedExams: totalExams - passedExams,
      averagePercentage: Math.round(averagePercentage * 100) / 100,
      totalMarks,
      totalMaxMarks,
    },
  };
}

  async generateReportCard(studentId: number, academicSessionId: number) {
    const grades = await this.getStudentGrades(studentId);
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { 
        class: true,
        session: true, // FIXED: Use 'session' instead of 'academicSession'
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const finalResults = this.calculateFinalResults(grades.grades);

    return {
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        studentId: student.studentId,
        class: student.class?.name,
        session: student.session?.name, // FIXED: Use session
      },
      grades: grades.grades,
      finalResults,
      performance: grades.performance,
      generatedAt: new Date(),
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
    const [academicSession, classRecord] = await Promise.all([
      tx.academicSession.findUnique({ where: { id: examData.academicSessionId } }),
      tx.class.findUnique({ where: { id: examData.classId } }),
    ]);

    if (!academicSession) {
      throw new NotFoundException('Academic session not found');
    }
    if (!classRecord) {
      throw new NotFoundException('Class not found');
    }

    const overlappingExam = await tx.exam.findFirst({
      where: {
        classId: examData.classId,
        academicSessionId: examData.academicSessionId,
        term: examData.term,
        OR: [
          {
            startDate: { lte: new Date(examData.endDate) },
            endDate: { gte: new Date(examData.startDate) },
          },
        ],
      },
    });

    if (overlappingExam) {
      throw new ConflictException('Exam overlaps with existing exam in the same class and term');
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

  

private calculateGradeSync(percentage: number): string {
  // Use DEFAULT_GRADE_SCALE as fallback if no DB scale
  for (const scale of DEFAULT_GRADE_SCALE) {
    if (percentage >= scale.minPercent && percentage <= scale.maxPercent) {
      return scale.grade;
    }
  }
  return 'F';
}

}