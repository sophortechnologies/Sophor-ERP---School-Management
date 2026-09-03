import { 
  Injectable, 
  Logger,
  NotFoundException, 
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UploadDocumentDto } from './dto/document-upload.dto';
import { AssignClassDto } from './dto/assign-class.dto';
import { PrismaService } from '../../database/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentQueryDto } from './dto/student-query.dto';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

 

async createStudent(
  createStudentDto: CreateStudentDto,
  creatorUserId: number,
  profileImage?: string, 

) {
  if (!createStudentDto.termsAccepted) {
    throw new BadRequestException('Terms and conditions must be accepted');
  }

  // Hoist these so they are accessible after the transaction for email sending
  let studentCode: string;
  let tempPassword: string;

  const result = await this.prisma.$transaction(async (tx) => {
    // 1️⃣ Validate input data
    await this.validateStudentData(createStudentDto, tx);

    // 2️⃣ Generate unique student code
    studentCode = await this.generateStudentId(tx);

    // 3️⃣ Ensure STUDENT role exists
    const studentRole = await tx.role.findUnique({
      where: { name: 'STUDENT' },
      select: { id: true },
    });

    if (!studentRole) {
      throw new InternalServerErrorException('STUDENT role not found');
    }

    // 4️⃣ Check email uniqueness
    if (createStudentDto.email) {
      const existingUser = await tx.user.findUnique({
        where: { email: createStudentDto.email },
        select: { id: true },
      });

      if (existingUser) {
        throw new BadRequestException('A user with this email already exists');
      }
    }

    

    // 5️⃣ Create USER
    tempPassword = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await tx.user.create({
      data: {
        username: studentCode,
        email: createStudentDto.email ?? `${studentCode}@school.local`,
        phone: createStudentDto.phone,
        passwordHash,
        roleId: studentRole.id,
        firstName: createStudentDto.firstName,
        lastName: createStudentDto.lastName,
        profileImage,
        isActive: true,
      },
      select: { id: true },
    });

    
const student = await tx.student.create({
  data: {
    studentId: studentCode,
    firstName: createStudentDto.firstName,
    lastName: createStudentDto.lastName,
    email: createStudentDto.email,
    phone: createStudentDto.phone,
    gender: createStudentDto.gender,
    dateOfBirth: new Date(createStudentDto.dateOfBirth),
    address: createStudentDto.address,
    city: createStudentDto.city,
    state: createStudentDto.state,
    pincode: createStudentDto.pincode,
    nationality: createStudentDto.nationality,
    guardianName: createStudentDto.guardianName,
    guardianPhone: createStudentDto.guardianPhone,
    guardianEmail: createStudentDto.guardianEmail,
    guardianRelation: createStudentDto.guardianRelation,
    guardianOccupation: createStudentDto.guardianOccupation,
    sessionId: createStudentDto.sessionId,
    classId: createStudentDto.classId,
    status: 'PENDING',
    createdBy: creatorUserId,
    userId: user.id,
  },
});


// Auto-assign class and section if not already assigned
if (!createStudentDto.classId) {
  const autoAssignment = await this.autoAssignClassAndSection(createStudentDto, tx);
  if (autoAssignment.classId) {
    await tx.student.update({
      where: { id: student.id },
      data: {
        classId: autoAssignment.classId,
        sectionId: autoAssignment.sectionId,
        assignedByAuto: true,
      },
    });
  }
}

      // 7️⃣ Audit log
    await tx.auditLog.create({
      data: {
        userId: creatorUserId,
        action: 'STUDENT_CREATED',
        entityType: 'Student',
        entityId: student.id,
        description: `Student ${student.firstName} ${student.lastName} created`,
      },
    });

    return student;
  });

  // Send welcome email after the transaction commits — fire-and-forget so
  // an SMTP failure never rolls back or blocks the student creation response.
  if (createStudentDto.email) {
    this.emailService.sendWelcomeEmail({
      to: createStudentDto.email,
      studentId: studentCode,
      tempPassword: tempPassword,
      name: `${createStudentDto.firstName} ${createStudentDto.lastName}`,
    }).catch((err) => {
      this.logger.warn(`Welcome email failed for ${createStudentDto.email}: ${err.message}`);
    });
  }

  return result;
}


async updateStudentStatus(studentId: number, newStatus: string, userId: number, reason?: string) {
  const validStatuses = [
    'INQUIRY', 'APPLICATION_RECEIVED', 'DOCUMENTS_VERIFIED',
    'TEST_SCHEDULED', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED',
    'ENROLLED', 'ACTIVE', 'WITHDRAWN', 'ALUMNI', 'DELETED'
  ];
  
  if (!validStatuses.includes(newStatus)) {
    throw new BadRequestException(`Invalid status: ${newStatus}`);
  }
  
  const student = await this.prisma.student.findUnique({
    where: { id: studentId },
  });
  
  if (!student) {
    throw new NotFoundException('Student not found');
  }
  
  const updated = await this.prisma.student.update({
    where: { id: studentId },
    data: { status: newStatus },
  });
  
  await this.prisma.auditLog.create({
    data: {
      userId,
      action: 'STUDENT_STATUS_CHANGED',
      entityType: 'Student',
      entityId: studentId,
      description: `Status changed from ${student.status} to ${newStatus}${reason ? `: ${reason}` : ''}`,
    },
  });
  
  return updated;
}

async convertInquiryToStudent(inquiryId: number, createStudentDto: CreateStudentDto, userId: number) {
  const inquiry = await this.prisma.studentInquiry.findUnique({
    where: { id: inquiryId },
  });
  
  if (!inquiry) {
    throw new NotFoundException('Inquiry not found');
  }
  
  if (inquiry.status === 'CONVERTED') {
    throw new BadRequestException('Inquiry already converted to student');
  }
  
  // Merge inquiry data with DTO (use inquiry data as fallback)
  const mergedDto = {
    ...createStudentDto,
    firstName: createStudentDto.firstName || inquiry.firstName,
    lastName: createStudentDto.lastName || inquiry.lastName,
    email: createStudentDto.email || inquiry.email,
    phone: createStudentDto.phone || inquiry.phone,
  };
  
  const student = await this.createStudent(mergedDto, userId);
  
  await this.prisma.studentInquiry.update({
    where: { id: inquiryId },
    data: { status: 'CONVERTED' },
  });
  
  return student;
}

async scheduleAdmissionTest(studentId: number, testDate: Date, testType: string, userId: number) {
  const student = await this.findOne(studentId);
  
  const test = await this.prisma.admissionTest.create({
    data: {
      studentId,
      testType,
      testDate: new Date(testDate),
      createdBy: userId,
    },
  });
  
  // Update student status
  await this.updateStudentStatus(studentId, 'TEST_SCHEDULED', userId, `Test scheduled: ${testType}`);
  
  // Send email notification
  try {
    await this.emailService.sendTestScheduleEmail({
      to: student.email,
      studentId: student.studentId,
      testDate: testDate,
      testType: testType,
      name: `${student.firstName} ${student.lastName}`,
    });
  } catch (error) {
    this.logger.warn(`Failed to send test schedule email for student ${studentId}: ${error.message}`);
  }
  
  return test;
}

async recordAdmissionTestResult(studentId: number, score: number, result: string, remarks: string, userId: number) {
  const student = await this.findOne(studentId);
  
  const test = await this.prisma.admissionTest.findFirst({
    where: { studentId, testDate: { not: null } },
    orderBy: { testDate: 'desc' },
  });
  
  if (!test) {
    throw new NotFoundException('No admission test found for this student');
  }
  
  const updated = await this.prisma.admissionTest.update({
    where: { id: test.id },
    data: {
      score,
      remarks: `${result}: ${remarks || ''}`,
    },
  });
  
  // Update student status based on result
  const newStatus = result === 'PASS' ? 'APPROVED' : 'REJECTED';
  await this.updateStudentStatus(studentId, newStatus, userId, `Test result: ${result} (Score: ${score})`);
  
  return updated;
}
  async bulkCreateStudents(students: CreateStudentDto[], userId: number) {
    const MAX_BATCH_SIZE = 100;
  if (students.length > MAX_BATCH_SIZE) {
    throw new BadRequestException(`Cannot create more than ${MAX_BATCH_SIZE} students at once. Current: ${students.length}`);
  }
    const results = {
      successful: [],
      failed: []
    };

    for (const studentData of students) {
      try {
        const student = await this.createStudent(studentData, userId);
        results.successful.push({
          studentId: student.studentId,
          name: `${student.firstName} ${student.lastName}`,
          status: 'SUCCESS'
        });
      } catch (error:any) {
        results.failed.push({
          data: studentData,
          error: error.message,
          status: 'FAILED'
        });
      }
    }

    return results;
  }


async findAll(
  filters: StudentQueryDto,
  baseUrl: string,
) {
  const page = Number(filters.page ?? 1);
  const pageSize = Number(filters.limit ?? 10); // ✅ FIXED
  const skip = (page - 1) * pageSize;

  const { sessionId, classId, status, search } = filters;

  const where: any = {
    ...(sessionId && { sessionId }),
    ...(classId && { classId }),
    ...(status && { status }),
  };

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { studentId: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { guardianName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, count] = await Promise.all([
    this.prisma.student.findMany({
      where,
      include: {
        class: { select: { id: true, name: true } },
        session: { select: { id: true, name: true } },
        documents: {
          where: { documentType: 'PHOTO' },
          take: 1,
        },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.student.count({ where }),
  ]);

  const totalPages = Math.ceil(count / pageSize);

  return {
    count,
    total_pages: totalPages,
    current_page: page,
    page_size: pageSize, // ✅ response standard
    next:
      page < totalPages
        ? `${baseUrl}?page=${page + 1}&limit=${pageSize}`
        : null,
    previous:
      page > 1
        ? `${baseUrl}?page=${page - 1}&limit=${pageSize}`
        : null,
    data,
  };
}


    async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        class: true,
        session: true,
        documents: true,
        section: true, // Make sure your Prisma schema has this relation
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async updateStudent(id: number, updateStudentDto: UpdateStudentDto, userId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const updateData: any = {};

    // Only update fields that are provided in the DTO
    if (updateStudentDto.firstName !== undefined) updateData.firstName = updateStudentDto.firstName;
    if (updateStudentDto.lastName !== undefined) updateData.lastName = updateStudentDto.lastName;
    if (updateStudentDto.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(updateStudentDto.dateOfBirth);
    if (updateStudentDto.gender !== undefined) updateData.gender = updateStudentDto.gender;
    if (updateStudentDto.email !== undefined) updateData.email = updateStudentDto.email;
    if (updateStudentDto.phone !== undefined) updateData.phone = updateStudentDto.phone;
    if (updateStudentDto.address !== undefined) updateData.address = updateStudentDto.address;
    if (updateStudentDto.city !== undefined) updateData.city = updateStudentDto.city;
    if (updateStudentDto.state !== undefined) updateData.state = updateStudentDto.state;
    if (updateStudentDto.pincode !== undefined) updateData.pincode = updateStudentDto.pincode;
    if (updateStudentDto.nationality !== undefined) updateData.nationality = updateStudentDto.nationality;
    if (updateStudentDto.guardianName !== undefined) updateData.guardianName = updateStudentDto.guardianName;
    if (updateStudentDto.guardianPhone !== undefined) updateData.guardianPhone = updateStudentDto.guardianPhone;
    if (updateStudentDto.guardianEmail !== undefined) updateData.guardianEmail = updateStudentDto.guardianEmail;
    if (updateStudentDto.guardianRelation !== undefined) updateData.guardianRelation = updateStudentDto.guardianRelation;
    if (updateStudentDto.guardianOccupation !== undefined) updateData.guardianOccupation = updateStudentDto.guardianOccupation;
    if (updateStudentDto.classId !== undefined) updateData.classId = updateStudentDto.classId;
    if (updateStudentDto.status !== undefined) updateData.status = updateStudentDto.status;

    const updatedStudent = await this.prisma.student.update({
      where: { id },
      data: updateData,
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'STUDENT_ADMISSION_UPDATED',
        entityType: 'Student',
        entityId: updatedStudent.id,
        description: `Admission updated for ${updatedStudent.firstName} ${updatedStudent.lastName}`,
      },
    });

    return updatedStudent;
  }

  async uploadDocument(studentId: number, file: any, documentType: string, description: string, userId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    const document = await this.prisma.studentDocument.create({
      data: {
        studentId: studentId,
        documentType: documentType,
        fileName: file.originalname,
        fileUrl: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy: userId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'STUDENT_DOCUMENT_UPLOADED',
        entityType: 'StudentDocument',
        entityId: document.id,
        description: `Document ${documentType} uploaded for student ${student.firstName} ${student.lastName}`,
      },
    });

    return document;
  }

  async getStudentDocuments(studentId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return this.prisma.studentDocument.findMany({
      where: { studentId },
      orderBy: { uploadedAt: 'desc' },
    });
  }
  


  private async autoAssignClassAndSection(
  studentDto: CreateStudentDto,
  tx: any,
) {
  const configs = await tx.classAutoAssignmentConfig.findMany({
    where: {
      sessionId: studentDto.sessionId,
      isActive: true,
    },
  });

  const dob = new Date(studentDto.dateOfBirth);
  const age = new Date().getFullYear() - dob.getFullYear();

  for (const config of configs) {
    const criteria = config.criteria as any;

    // Age rule
    if (criteria.age) {
      if (age < criteria.age.min || age > criteria.age.max) continue;
    }

    // Gender rule
    if (criteria.gender && criteria.gender !== 'ANY') {
      if (criteria.gender !== studentDto.gender) continue;
    }

    const classId = criteria.assign.classId;

    // Section assignment (simple strategy)
    const section = await tx.section.findFirst({
      where: { classId },
      orderBy: { id: 'asc' },
    });

    return {
      classId,
      sectionId: section?.id ?? null,
    };
  }

  return { classId: null, sectionId: null };
}

async assignClassManually(
  studentId: number,
  dto: AssignClassDto,
  performedBy: number,
) {
  let sectionId: number | null = null;

  if (dto.section) {
    const sectionRecord = await this.prisma.section.findFirst({
      where: {
        classId: dto.classId,
        name: dto.section,
      },
    });
    sectionId = sectionRecord?.id ?? null;
  }

  return this.prisma.student.update({
    where: { id: studentId },
    data: {
      classId: dto.classId,
      sectionId,
      remarks: dto.remarks ?? null,
      updatedBy: performedBy,
    },
  });
}

async assignClass(
  studentId: number,
  classId: number,
  sectionName: string | null,
  remarks: string | null,    // ← ADD THIS (4th parameter)
  userId: number,            // ← 5th parameter
) {
  // Check student exists
  const student = await this.prisma.student.findUnique({
    where: { id: studentId },
  });
  if (!student) throw new NotFoundException('Student not found');

  // Check class exists
  const classRecord = await this.prisma.class.findUnique({
    where: { id: classId },
    include: { Section: true },
  });
  if (!classRecord) throw new NotFoundException('Class not found');

  // Check student not already in a class (optional - can reassign)
  if (student.classId && student.classId !== classId) {
    // Moving student from one class to another — allowed
  }

  let sectionId = null;
  if (sectionName) {
    const section = classRecord.Section.find(s => s.name === sectionName);
    if (!section) {
      throw new BadRequestException(`Section "${sectionName}" not found in class "${classRecord.name}"`);
    }
    
    // Check section capacity
    if (section.capacity) {
      const studentCount = await this.prisma.student.count({
        where: { sectionId: section.id, status: { in: ['ACTIVE', 'ADMITTED'] } },
      });
      if (studentCount >= section.capacity) {
        throw new BadRequestException(`Section "${sectionName}" is full (${studentCount}/${section.capacity})`);
      }
    }
    sectionId = section.id;
  }

  // Update student with audit info
  return this.prisma.student.update({
    where: { id: studentId },
    data: { 
      classId, 
      sectionId, 
      updatedBy: userId,
      remarks: remarks,  // ← Save remarks if your schema has this field
    },
  });
}


async updateAdmissionStatus(
  studentId: number,
  status: string,
  remarks: string | null,
  performedBy: number,
) {
  const student = await this.prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new NotFoundException('Student not found');
  }

  return this.prisma.student.update({
    where: { id: studentId },
    data: {
      status: status,
      remarks,
      updatedBy: performedBy,
    },
  });
}

  async generateAdmissionForm(studentId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: true,
        session: true,
        documents: {
          where: { documentType: 'PHOTO' },
          take: 1,
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return {
      student,
      formId: `ADM-${student.studentId}-${Date.now()}`,
      generatedAt: new Date(),
      institution: {
        name: 'Your Institution Name',
        address: 'Institution Address',
        contact: 'contact@institution.edu',
      },
    };
  }


  async uploadStudentDocument(
  studentId: number,
  file: Express.Multer.File,
  dto: UploadDocumentDto,
  uploadedBy: number,

) {
  // 1. Validate student
  const student = await this.prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new NotFoundException('Student not found');
  }

  if (!file) {
    throw new BadRequestException('File is required');
  }

  // 2. Save document metadata
  const document = await this.prisma.studentDocument.create({
    data: {
      studentId,
      documentType: dto.documentType,
      fileName: file.originalname,
      fileUrl: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      description: dto.verificationNotes ?? null,
      uploadedBy,
    },
  });

  // 3. Audit log (optional but recommended)
  await this.prisma.auditLog.create({
    data: {
      userId: uploadedBy,
      action: 'STUDENT_DOCUMENT_UPLOADED',
      entityType: 'StudentDocument',
      entityId: document.id,
      description: `Uploaded ${dto.documentType} for student ${student.studentId}`,
    },
  });

  return {
    message: 'Document uploaded successfully',
    document,
  };
}

  async generateConfirmationReceipt(studentId: number) {
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

    return {
      student,
      receiptNumber: `REC-${student.studentId}-${Date.now()}`,
      generatedAt: new Date(),
      status: student.status,
    };
  }

  async getAdmissionHistory(studentId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return this.prisma.auditLog.findMany({
      where: {
        entityType: 'Student',
        entityId: studentId,
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getAdmissionStatistics() {
    const total = await this.prisma.student.count();
    
    const byStatus = await this.prisma.student.groupBy({
      by: ['status'],
      _count: true,
    });

    const byClass = await this.prisma.student.groupBy({
      by: ['classId'],
      _count: true,
      where: { 
        classId: { not: null }
      },
    });

    return {
      total,
      byStatus,
      byClass,
      summary: {
        pending: byStatus.find(s => s.status === 'PENDING')?._count || 0,
        approved: byStatus.find(s => s.status === 'APPROVED')?._count || 0,
        admitted: byStatus.find(s => s.status === 'ADMITTED')?._count || 0,
      }
    };
  }

  async searchStudents(query: string) {
    return this.prisma.student.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { studentId: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { guardianName: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        studentId: true,
        email: true,
        phone: true,
        status: true,
        class: {
          select: { name: true }
        },
      },
      take: 10,
    });
  }

async softDeleteStudent(id: number, userId: number) {
  const student = await this.prisma.student.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!student) {
    throw new NotFoundException('Student not found');
  }

  // Check all dependencies
  const [examResults, attendance, unpaidBills, issuedBooks] = await Promise.all([
    this.prisma.examResult.count({ where: { studentId: id } }),
    this.prisma.attendance.count({ where: { studentId: id } }),
    this.prisma.bill.count({ where: { studentId: id, status: { not: 'PAID' } } }),
    this.prisma.bookIssue.count({ where: { userId: student.userId, status: 'ISSUED' } }),
  ]);

  if (examResults > 0) {
    throw new BadRequestException(`Cannot delete: ${examResults} exam results exist`);
  }
  if (attendance > 0) {
    throw new BadRequestException(`Cannot delete: ${attendance} attendance records exist`);
  }
  if (unpaidBills > 0) {
    throw new BadRequestException(`Cannot delete: ${unpaidBills} unpaid bills exist`);
  }
  if (issuedBooks > 0) {
    throw new BadRequestException(`Cannot delete: ${issuedBooks} books currently issued`);
  }

  return this.prisma.$transaction(async (tx) => {
    // Disconnect parent relationships
    await tx.studentParent.deleteMany({ where: { studentId: id } });

    // Soft delete student
    await tx.student.update({
      where: { id },
      data: { 
        deletedAt: new Date(), 
        deletedBy: userId, 
        status: 'DELETED' 
      },
    });

    // Deactivate user
    await tx.user.update({
      where: { id: student.userId },
      data: { isActive: false },
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        userId,
        action: 'STUDENT_DELETED',
        entityType: 'Student',
        entityId: id,
        description: `Student ${student.firstName} ${student.lastName} deleted`,
      },
    });

    return { message: 'Student deleted successfully' };
  });
}

  async restoreStudent(id: number, userId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.status !== 'DELETED') {
      throw new BadRequestException('Student is not deleted — nothing to restore');
    }

    return this.prisma.$transaction(async (tx) => {
      // Restore student record
      await tx.student.update({
        where: { id },
        data: {
          deletedAt: null,
          deletedBy: null,
          status: 'ACTIVE',
          updatedBy: userId,
        },
      });

      // Re-activate the linked user account
      if (student.userId) {
        await tx.user.update({
          where: { id: student.userId },
          data: { isActive: true },
        });
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'STUDENT_RESTORED',
          entityType: 'Student',
          entityId: id,
          description: `Student ${student.firstName} ${student.lastName} restored`,
        },
      });

      return { message: 'Student restored successfully' };
    });
  }

  private async validateStudentData(createStudentDto: CreateStudentDto, tx: any) {
    const errors: string[] = [];

    // Date validation
    const dob = new Date(createStudentDto.dateOfBirth);
    if (dob >= new Date()) {
      errors.push('Date of birth must be in the past');
    }

    // Age validation (at least 3 years old)
    const age = new Date().getFullYear() - dob.getFullYear();
    if (age < 3) {
      errors.push('Student must be at least 3 years old');
    }

    // Email uniqueness
    if (createStudentDto.email) {
      const existingEmail = await tx.student.findFirst({
        where: { email: createStudentDto.email },
      });
      if (existingEmail) {
        errors.push('Email already exists');
      }
    }

    // Session existence check
    const sessionExists = await tx.academicSession.findUnique({
      where: { id: createStudentDto.sessionId },
    });
    if (!sessionExists) {
      errors.push('Invalid academic session selected');
    }

    // Class existence check
    if (createStudentDto.classId) {
      const classExists = await tx.class.findUnique({
        where: { id: createStudentDto.classId },
      });
      if (!classExists) {
        errors.push('Invalid class selected');
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors.join(', '));
    }
  }

 private async generateStudentId(tx: any): Promise<string> {
  const year = new Date().getFullYear();
  
  // Use studentId for ordering, not createdAt
  const lastStudent = await tx.student.findFirst({
    orderBy: { studentId: 'desc' },
    select: { studentId: true },
  });

  let sequence = 1;
  if (lastStudent?.studentId) {
    const match = lastStudent.studentId.match(/STU\d{4}(\d{4})/);
    if (match) {
      sequence = parseInt(match[1]) + 1;
    }
  }

  return `STU${year}${sequence.toString().padStart(4, '0')}`;
}

 async validateStudentLogin(studentId: string, dateOfBirth: string) {
  const student = await this.prisma.student.findUnique({
    where: { studentId },
  });

  if (!student) {
    throw new NotFoundException('Invalid student ID');
  }

  // date of birth check only
  const dobFormatted = student.dateOfBirth.toISOString().split('T')[0];

  if (dobFormatted !== dateOfBirth) {
    throw new BadRequestException('Invalid credential');
  }

  return student;
}


async getDashboard(studentId: number) {
  // 1) Validate
  if (!studentId || isNaN(Number(studentId))) {
    throw new BadRequestException('Invalid student id');
  }

  // 2) Load student core data - FIX: Add section to include
  const student = await this.prisma.student.findUnique({
    where: { id: Number(studentId) },
    include: {
      class: true,
      session: true,
      section: {  // ADD THIS - include section relation
        include: {
          class: true
        }
      },
      documents: { where: { documentType: 'PHOTO' }, take: 1 },
    },
  });

  if (!student) {
    throw new NotFoundException('Student not found');
  }

  // ... rest of the attendance and exam results code stays the same ...

  // 3) Attendance summary - last 30 days + overall counts
  const now = new Date();
  const last30 = new Date();
  last30.setDate(now.getDate() - 30);

  const attendanceLast30 = await Promise.all([
    this.prisma.attendance.count({
      where: { studentId: student.id, status: 'PRESENT', date: { gte: last30 } },
    }),
    this.prisma.attendance.count({
      where: { studentId: student.id, status: 'ABSENT', date: { gte: last30 } },
    }),
    this.prisma.attendance.count({
      where: { studentId: student.id, status: 'LATE', date: { gte: last30 } },
    }),
    this.prisma.attendance.count({
      where: { studentId: student.id, date: { gte: last30 } },
    }),
  ]);

  const [present30, absent30, late30, total30] = attendanceLast30;
  const attendance30Pct = total30 > 0 ? Math.round((present30 / total30) * 10000) / 100 : null;

  // 4) Overall attendance summary
  const overallSummary = await this.prisma.attendanceSummary.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });

  let overall = {
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    percentage: null,
  };

  if (overallSummary && overallSummary.length) {
    overall.presentDays = overallSummary.reduce((s, r) => s + (r.presentDays || 0), 0);
    overall.absentDays = overallSummary.reduce((s, r) => s + (r.absentDays || 0), 0);
    overall.lateDays = overallSummary.reduce((s, r) => s + (r.lateDays || 0), 0);
    const totalDays = overall.presentDays + overall.absentDays + (overall.lateDays || 0);
    overall.percentage = totalDays > 0 ? Math.round((overall.presentDays / totalDays) * 10000) / 100 : null;
  } else {
    const [presentAll, absentAll, lateAll] = await Promise.all([
      this.prisma.attendance.count({ where: { studentId: student.id, status: 'PRESENT' } }),
      this.prisma.attendance.count({ where: { studentId: student.id, status: 'ABSENT' } }),
      this.prisma.attendance.count({ where: { studentId: student.id, status: 'LATE' } }),
    ]);
    const totalAll = presentAll + absentAll + lateAll;
    overall = {
      presentDays: presentAll,
      absentDays: absentAll,
      lateDays: lateAll,
      percentage: totalAll > 0 ? Math.round((presentAll / totalAll) * 10000) / 100 : null,
    };
  }

  // 5) Latest exam results
  const latestResults = await this.prisma.examResult.findMany({
    where: { studentId: student.id },
    include: { exam: true, subject: true },
    orderBy: { createdAt: 'desc' },
    take: 8,
  });

  const latestResultsCompact = latestResults.map((r) => ({
    examId: r.examId,
    examName: r.exam?.name || null,
    subjectId: r.subjectId,
    subjectName: r.subject?.name || null,
    totalMarks: r.totalMarks?.toString?.() ?? r.totalMarks,
    percentage: Number(r.percentage ?? 0),
    grade: r.grade,
    remarks: r.remarks,
    createdAt: r.createdAt,
  }));

  // 6) Performance trend
  const examAveragesRaw = await this.prisma.examResult.groupBy({
    by: ['examId'],
    where: { studentId: student.id },
    _avg: { percentage: true },
    orderBy: { _avg: { percentage: 'desc' } },
    take: 8,
  });

  const examIds = examAveragesRaw.map((e) => e.examId);
  const exams = await this.prisma.exam.findMany({
    where: { id: { in: examIds } },
    select: { id: true, name: true, startDate: true },
  });

  const performanceTrend = examAveragesRaw
    .map((e) => {
      const exam = exams.find((x) => x.id === e.examId);
      return {
        examId: e.examId,
        examName: exam?.name ?? `Exam ${e.examId}`,
        avgPercentage:
          e._avg?.percentage !== null && e._avg?.percentage !== undefined
            ? Math.round(Number(e._avg.percentage) * 100) / 100
            : null,
        examDate: exam?.startDate ?? null,
      };
    })
    .sort((a, b) =>
      a.examDate && b.examDate
        ? +new Date(a.examDate) - +new Date(b.examDate)
        : 0,
    );

  // 7) Upcoming exams
  const upcomingExams = await this.prisma.exam.findMany({
    where: {
      classId: student.classId,
      academicSessionId: student.sessionId,
      startDate: { gte: new Date() },
      isActive: true,
    },
    orderBy: { startDate: 'asc' },
    take: 6,
  });

  // 8) Compose profile summary - FIX: Now section is properly available
  const profile = {
    id: student.id,
    studentId: student.studentId,
    name: `${student.firstName} ${student.lastName}`.trim(),
    class: student.class?.name ?? null,
    section: student.section?.name ?? null,  // Now this works properly!
    session: student.session?.name ?? null,
    guardianName: student.guardianName ?? null,
    guardianPhone: student.guardianPhone ?? null,
    photo: student.documents?.[0]?.fileUrl ?? null,
    admissionDate: student.admissionDate,
    status: student.status,
  };

  return {
    profile,
    attendance: {
      last30: {
        present: present30,
        absent: absent30,
        late: late30,
        total: total30,
        percentage: attendance30Pct,
      },
      overall,
    },
    latestResults: latestResultsCompact,
    performanceTrend,
    upcomingExams,
  };
}

async loginStudent(dto: { studentId: string; password: string }) {
  const student = await this.prisma.student.findUnique({
    where: { studentId: dto.studentId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          passwordHash: true,
          isActive: true,
          firstName: true,
          lastName: true,
          roleId: true,
        },
      },
    },
  });

  if (!student) {
    throw new BadRequestException('Invalid student ID or password');
  }

  if (!student.user) {
    throw new BadRequestException('User account not found');
  }

  // CHECK PENDING STATUS FIRST
  if (student.status === 'PENDING') {
    throw new BadRequestException(
      'Account not activated. Please check your email for activation link or contact administrator.'
    );
  }

  if (!student.user.isActive) {
    throw new BadRequestException('Account is deactivated. Please contact administrator.');
  }

  if (student.status !== 'ACTIVE' && student.status !== 'ADMITTED') {
    throw new BadRequestException(`Account status is ${student.status}. Please contact administrator.`);
  }

  const isValidPassword = await bcrypt.compare(dto.password, student.user.passwordHash);
  if (!isValidPassword) {
    throw new BadRequestException('Invalid student ID or password');
  }

  // Generate JWT
  const payload = {
    sub: student.user.id,
    studentId: student.studentId,
    email: student.user.email,
    role: 'STUDENT',
    roleId: student.user.roleId,
  };
  const token = await this.jwtService.signAsync(payload);

  await this.prisma.user.update({
    where: { id: student.user.id },
    data: { lastLogin: new Date() },
  });

  return {
    message: 'Login successful',
    token,
    user: {
      id: student.user.id,
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.user.email,
      status: student.status,
    },
  };
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

  // 2️⃣ Validate password strength
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new BadRequestException(
      'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
    );
  }

  // 3️⃣ Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // 4️⃣ Activate or update password (works for both cases)
  await this.prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: student.userId },
      data: {
        passwordHash,
        isActive: true,  // Ensures user is active
      },
    });

    await tx.student.update({
      where: { id: student.id },
      data: {
        status: 'ACTIVE',  // Ensures student is active
      },
    });
  });

  // 5️⃣ Send activation confirmation email
  try {
    await this.emailService.sendActivationConfirmation({
      to: student.user.email,
      studentId: studentId,
    });
  } catch (emailError) {
    this.logger.warn(`Failed to send activation email for ${studentId}: ${emailError.message}`);
  }

  return {
    message: 'Student account activated successfully. You can now login.',
    studentId: student.studentId,
  };
}


}