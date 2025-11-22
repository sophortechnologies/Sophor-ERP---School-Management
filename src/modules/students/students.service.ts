import { 
  Injectable, 
  NotFoundException, 
  ConflictException,
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateStudentAdmissionDto } from './dto/create-student-admission.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentFilterDto } from './dto/student-filter.dto';
import { BulkAdmissionDto } from './dto/bulk-admission.dto';
import { Student, StudentWithDetails, AdmissionStats } from './entities/student.entity';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  // FR1.4 - Generate unique Student ID
  private async generateStudentId(sessionId: string): Promise<string> {
    const session = await this.prisma.academicSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Academic session not found');
    }

    const year = new Date().getFullYear().toString().slice(-2);
    const prefix = 'STU';
    
    const lastStudent = await this.prisma.student.findFirst({
      where: {
        sessionId: sessionId,
        studentId: {
          startsWith: prefix + year
        }
      },
      orderBy: { studentId: 'desc' },
    });

    let sequence = 1;
    if (lastStudent?.studentId) {
      const lastSequence = parseInt(lastStudent.studentId.slice(-4)) || 0;
      sequence = lastSequence + 1;
    }

    return `${prefix}${year}${sequence.toString().padStart(4, '0')}`;
  }

  // FR1.4 - Generate unique Admission Number
  private async generateAdmissionNumber(sessionId: string): Promise<string> {
    const session = await this.prisma.academicSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Academic session not found');
    }

    const year = new Date().getFullYear().toString();
    const prefix = 'ADM';
    
    const lastAdmission = await this.prisma.student.findFirst({
      where: {
        sessionId: sessionId,
        admissionNumber: {
          startsWith: prefix + year
        }
      },
      orderBy: { admissionNumber: 'desc' },
    });

    let sequence = 1;
    if (lastAdmission?.admissionNumber) {
      const lastSequence = parseInt(lastAdmission.admissionNumber.slice(-4)) || 0;
      sequence = lastSequence + 1;
    }

    return `${prefix}${year}${sequence.toString().padStart(4, '0')}`;
  }

  // FR1.5 - Validate student data
  private async validateStudentData(createStudentDto: CreateStudentAdmissionDto): Promise<void> {
    if (createStudentDto.dateOfBirth && createStudentDto.dateOfBirth >= new Date()) {
      throw new BadRequestException('Date of birth must be in the past');
    }

    if (createStudentDto.email) {
      const existingStudent = await this.prisma.student.findFirst({
        where: { 
          email: createStudentDto.email
        },
      });
      if (existingStudent) {
        throw new ConflictException('Student with this email already exists');
      }
    }

    if (createStudentDto.phone) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(createStudentDto.phone)) {
        throw new BadRequestException('Invalid phone number format');
      }
    }

    if (createStudentDto.classId) {
      const classExists = await this.prisma.class.findUnique({
        where: { id: createStudentDto.classId },
      });
      if (!classExists) {
        throw new NotFoundException('Class not found');
      }
    }

    const sessionExists = await this.prisma.academicSession.findUnique({
      where: { id: createStudentDto.sessionId },
    });
    if (!sessionExists) {
      throw new NotFoundException('Academic session not found');
    }
  }

  // FR1.7 - Automatic class assignment
  private async assignClassAutomatically(createStudentDto: CreateStudentAdmissionDto): Promise<string> {
    const availableClasses = await this.prisma.class.findMany({
      where: { 
        isActive: true,
        currentStrength: { lt: this.prisma.class.fields.capacity as any }
      },
      orderBy: { grade: 'asc' }
    });

    if (availableClasses.length === 0) {
      throw new BadRequestException('No available classes with capacity');
    }

    return availableClasses[0].id;
  }

  private async getStudentRoleId(tx: any): Promise<string> {
    const studentRole = await tx.role.findFirst({
      where: { name: 'student' }
    });

    if (!studentRole) {
      throw new InternalServerErrorException('Student role not found in system');
    }

    return studentRole.id;
  }

  // FR1.1 & FR1.2 - Create new student admission
  async create(createStudentDto: CreateStudentAdmissionDto, userId: string): Promise<Student> {
    await this.validateStudentData(createStudentDto);

    let classId = createStudentDto.classId;
    let assignedAutomatically = false;
    
    if (!classId) {
      classId = await this.assignClassAutomatically(createStudentDto);
      assignedAutomatically = true;
    }

    const studentId = await this.generateStudentId(createStudentDto.sessionId);
    const admissionNumber = await this.generateAdmissionNumber(createStudentDto.sessionId);
    const confirmationNumber = `CONF${Date.now()}`;

    const username = studentId.toLowerCase();
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            username,
            email: createStudentDto.email || `${username}@school.edu`,
            passwordHash,
            firstName: createStudentDto.firstName,
            lastName: createStudentDto.lastName,
            phone: createStudentDto.phone,
            roleId: await this.getStudentRoleId(tx),
            isActive: true,
            isVerified: true,
          },
        });

        const student = await tx.student.create({
          data: {
            // Personal Information
            firstName: createStudentDto.firstName,
            lastName: createStudentDto.lastName,
            dateOfBirth: createStudentDto.dateOfBirth,
            gender: createStudentDto.gender,
            bloodGroup: createStudentDto.bloodGroup,
            nationality: createStudentDto.nationality || 'Ethiopian',
            religion: createStudentDto.religion,
            category: createStudentDto.category,
            
            // Contact Information
            email: createStudentDto.email,
            phone: createStudentDto.phone,
            address: createStudentDto.address,
            city: createStudentDto.city,
            state: createStudentDto.state,
            pincode: createStudentDto.pincode,
            
            // Guardian Information
            guardianName: createStudentDto.guardianName,
            guardianRelation: createStudentDto.guardianRelation,
            guardianPhone: createStudentDto.guardianPhone,
            guardianEmail: createStudentDto.guardianEmail,
            guardianOccupation: createStudentDto.guardianOccupation,
            guardianIncome: createStudentDto.guardianIncome,
            
            // Previous Education
            previousSchool: createStudentDto.previousSchool,
            previousClass: createStudentDto.previousClass,
            previousPercentage: createStudentDto.previousPercentage,
            tcNumber: createStudentDto.tcNumber,
            tcDate: createStudentDto.tcDate,
            
            // Health Information
            medicalConditions: createStudentDto.medicalConditions,
            allergies: createStudentDto.allergies,
            emergencyContact: createStudentDto.emergencyContact,
            
            // Documents
            photoUrl: createStudentDto.photoUrl,
            birthCertificateUrl: createStudentDto.birthCertificateUrl,
            tcUrl: createStudentDto.tcUrl,
            aadharUrl: createStudentDto.aadharUrl,
            
            // New Admission Fields
            admissionTestMarks: createStudentDto.admissionTestMarks,
            admissionTestRank: createStudentDto.admissionTestRank,
            admissionRemarks: createStudentDto.admissionRemarks,
            idProofUrl: createStudentDto.idProofUrl,
            transcriptUrl: createStudentDto.transcriptUrl,
            medicalCertificateUrl: createStudentDto.medicalCertificateUrl,
            otherDocuments: createStudentDto.otherDocuments || [],
            
            // System Fields
            studentId,
            admissionNumber,
            userId: user.id,
            classId,
            sessionId: createStudentDto.sessionId,
            rollNumber: createStudentDto.rollNumber,
            admissionDate: new Date(),
            confirmationNumber,
            assignedAutomatically,
            admissionStage: 'Registered',
            receiptGenerated: false,
            status: 'Active',
            isActive: true,
          },
          include: {
            class: {
              include: {
                classTeacher: {
                  select: { firstName: true, lastName: true }
                }
              }
            },
            session: true
          }
        });

        // FR1.9 - Create admission log
        await tx.admissionLog.create({
          data: {
            studentId: student.id,
            action: 'STUDENT_REGISTERED',
            details: {
              studentId: student.studentId,
              admissionNumber: student.admissionNumber,
              class: student.class.name,
              assignedAutomatically
            },
            performedBy: userId,
          },
        });

        await tx.class.update({
          where: { id: classId },
          data: {
            currentStrength: { increment: 1 }
          }
        });

        return student;
      });

      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Student with similar details already exists');
        }
      }
      throw new InternalServerErrorException('Failed to create student admission');
    }
  }

  // Get all students with filtering and pagination
  async findAll(filters: StudentFilterDto): Promise<{
    students: StudentWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { search, classId, sessionId, status, gender, admissionDateFrom, admissionDateTo, page = 1, limit = 10 } = filters;
    
    const skip = (page - 1) * limit;
    
    const where: any = {
      AND: []
    };

    if (search) {
      (where.AND as any[]).push({
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { studentId: { contains: search, mode: 'insensitive' } },
          { admissionNumber: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { guardianName: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (classId) (where.AND as any[]).push({ classId });
    if (sessionId) (where.AND as any[]).push({ sessionId });
    if (status) (where.AND as any[]).push({ status });
    if (gender) (where.AND as any[]).push({ gender });

    if (admissionDateFrom || admissionDateTo) {
      const dateFilter: any = {};
      if (admissionDateFrom) dateFilter.gte = new Date(admissionDateFrom);
      if (admissionDateTo) dateFilter.lte = new Date(admissionDateTo);
      (where.AND as any[]).push({ admissionDate: dateFilter });
    }

    if ((where.AND as any[]).length === 0) {
      delete where.AND;
    }

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        include: {
          class: {
            select: {
              name: true,
              section: true,
              classTeacher: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          session: {
            select: {
              name: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.student.count({ where }),
    ]);

    const studentsWithDetails: StudentWithDetails[] = students.map(student => {
      // Create a safe student object with proper typing
      const safeStudent = student as any;
      return {
        ...student,
        className: safeStudent.class?.name || 'N/A',
        section: safeStudent.class?.section || 'N/A',
        sessionName: safeStudent.session?.name || 'N/A',
        classTeacher: safeStudent.class?.classTeacher ? 
          `${safeStudent.class.classTeacher.firstName} ${safeStudent.class.classTeacher.lastName}` : 'Not Assigned'
      };
    });

    return {
      students: studentsWithDetails,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
// Get student by ID with details
async findOne(id: string): Promise<StudentWithDetails> {
  const student = await this.prisma.student.findUnique({
    where: { id },
    include: {
      class: {
        include: {
          classTeacher: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          }
        }
      },
      session: true,
      user: {
        select: {
          username: true,
          email: true,
          isActive: true
        }
      },
      attendances: {
        take: 30,
        orderBy: { date: 'desc' },
      },
     examResults: {
  include: {
    exam: true
  },
  take: 10,
  orderBy: { createdAt: 'desc' },
},
      _count: {
        select: {
          attendances: true,
          examResults: true,
          feePayments: true
        }
      }
    },
  });

  if (!student) {
    throw new NotFoundException(`Student with ID ${id} not found`);
  }

  const attendancePercentage = await this.calculateAttendancePercentage(student.id);
  const totalFeesPaid = await this.calculateTotalFeesPaid(student.id);

  // Use type assertion to safely access relations
  const studentWithRelations = student as any;

  return {
    ...student,
    className: studentWithRelations.class?.name || 'N/A',
    section: studentWithRelations.class?.section || 'N/A',
    sessionName: studentWithRelations.session?.name || 'N/A',
    classTeacher: studentWithRelations.class?.classTeacher ? 
      `${studentWithRelations.class.classTeacher.firstName} ${studentWithRelations.class.classTeacher.lastName}` : 'Not Assigned',
    attendancePercentage,
    totalFeesPaid,
    totalFeesDue: 0,
  };
}
  // FR1.8 - Update student details
  async update(id: string, updateStudentDto: UpdateStudentDto, userId: string): Promise<Student> {
    const existingStudent = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    if (updateStudentDto.email && updateStudentDto.email !== existingStudent.email) {
      const emailExists = await this.prisma.student.findFirst({
        where: { 
          email: updateStudentDto.email,
          id: { not: id }
        },
      });
      if (emailExists) {
        throw new ConflictException('Another student with this email already exists');
      }
    }

    try {
      const student = await this.prisma.student.update({
        where: { id },
        data: updateStudentDto,
      });

      await this.prisma.admissionLog.create({
        data: {
          studentId: id,
          action: 'STUDENT_UPDATED',
          details: {
            updatedFields: Object.keys(updateStudentDto),
            performedBy: userId
          },
          performedBy: userId,
        },
      });

      return student;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Student with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  // Delete student
  async remove(id: string, userId: string): Promise<void> {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.student.delete({
          where: { id },
        });

        await tx.user.delete({
          where: { id: student.userId },
        });

        await tx.class.update({
          where: { id: student.classId },
          data: {
            currentStrength: { decrement: 1 }
          }
        });

        await tx.admissionLog.create({
          data: {
            studentId: id,
            action: 'STUDENT_DELETED',
            details: {
              studentId: student.studentId,
              admissionNumber: student.admissionNumber
            },
            performedBy: userId,
          },
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Student with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  // FR1.10 - Generate admission confirmation
  async generateAdmissionConfirmation(id: string): Promise<{ confirmationNumber: string; receiptUrl: string }> {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        class: true,
        session: true
      }
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    if (student.receiptGenerated) {
      throw new BadRequestException('Receipt already generated for this student');
    }

    const confirmationNumber = `CONF${Date.now()}`;
    const receiptUrl = `/receipts/admission/${student.id}.pdf`;

    await this.prisma.student.update({
      where: { id },
      data: {
        confirmationNumber,
        receiptGenerated: true,
        admissionStage: 'Completed'
      }
    });

    return {
      confirmationNumber,
      receiptUrl
    };
  }

  // FR1.9 - Get admission history
  async getAdmissionHistory(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    return this.prisma.admissionLog.findMany({
      where: { studentId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Bulk admission
  async bulkCreate(bulkAdmissionDto: BulkAdmissionDto, userId: string): Promise<{ success: number; failures: any[] }> {
    const results = {
      success: 0,
      failures: []
    };

    for (const [index, studentData] of bulkAdmissionDto.students.entries()) {
      try {
        await this.create(studentData, userId);
        results.success++;
      } catch (error: any) {
        results.failures.push({
          index,
          data: studentData,
          error: error.message
        });
      }
    }

    return results;
  }

  // Get admission statistics
  async getAdmissionStats(sessionId?: string): Promise<AdmissionStats> {
    const where: any = {};
    if (sessionId) {
      where.sessionId = sessionId;
    }

    const [
      totalApplications,
      approvedApplications,
      pendingApplications,
      applicationsByClass,
    ] = await Promise.all([
      this.prisma.student.count({ where }),
      this.prisma.student.count({
        where: { ...where, admissionStage: 'Registered' }
      }),
      this.prisma.student.count({
        where: { ...where, admissionStage: 'Applied' }
      }),
      this.prisma.student.groupBy({
        by: ['classId'],
        where,
        _count: {
          _all: true
        }
      }),
    ]);

    const classesWithNames = await Promise.all(
      applicationsByClass.map(async (item) => {
        const classData = await this.prisma.class.findUnique({
          where: { id: item.classId },
          select: { name: true }
        });
        return {
          className: classData?.name || 'Unknown',
          count: item._count._all
        };
      })
    );

    // Get monthly data for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyApplications = await this.prisma.student.groupBy({
      by: ['admissionDate'],
      where: {
        ...where,
        admissionDate: {
          gte: sixMonthsAgo
        }
      },
      _count: {
        _all: true
      }
    });

    const monthlyData = monthlyApplications.map(item => ({
      month: item.admissionDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
      count: item._count._all
    }));

    return {
      totalApplications,
      approvedApplications,
      pendingApplications,
      rejectedApplications: totalApplications - approvedApplications - pendingApplications,
      applicationsByClass: classesWithNames,
      applicationsByMonth: monthlyData
    };
  }

  // Helper methods
  private async calculateAttendancePercentage(studentId: string): Promise<number> {
    const attendanceRecords = await this.prisma.attendance.findMany({
      where: { studentId },
    });

    if (attendanceRecords.length === 0) return 0;

    const presentCount = attendanceRecords.filter(record => record.status === 'Present').length;
    return Number(((presentCount / attendanceRecords.length) * 100).toFixed(2));
  }

  private async calculateTotalFeesPaid(studentId: string): Promise<number> {
    const feePayments = await this.prisma.feeTransaction.aggregate({
      where: { studentId, status: 'Paid' },
      _sum: { amount: true },
    });

    return Number(feePayments._sum.amount || 0);
  }

  // Find by student ID
  async findByStudentId(studentId: string): Promise<StudentWithDetails> {
    const student = await this.prisma.student.findUnique({
      where: { studentId },
      include: {
        class: {
          select: {
            name: true,
            section: true,
            classTeacher: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        session: {
          select: {
            name: true
          }
        }
      }
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Use type assertion to safely access relations
    const studentWithRelations = student as any;

    return {
      ...student,
      className: studentWithRelations.class?.name || 'N/A',
      section: studentWithRelations.class?.section || 'N/A',
      sessionName: studentWithRelations.session?.name || 'N/A',
      classTeacher: studentWithRelations.class?.classTeacher ? 
        `${studentWithRelations.class.classTeacher.firstName} ${studentWithRelations.class.classTeacher.lastName}` : 'Not Assigned'
    };
  }

  // Change student status
  async changeStatus(id: string, status: string, userId: string): Promise<Student> {
    const student = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    const updatedStudent = await this.prisma.student.update({
      where: { id },
      data: { status },
    });

    await this.prisma.admissionLog.create({
      data: {
        studentId: id,
        action: 'STATUS_CHANGED',
        details: {
          from: student.status,
          to: status,
          performedBy: userId
        },
        performedBy: userId,
      },
    });

    return updatedStudent;
  }
}