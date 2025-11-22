
// //   // // // // import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
// //   // // // // import { PrismaService } from '../../database/prisma.service';
// //   // // // // import { CreateStudentDto } from './dto/create-student.dto';
// //   // // // // import { UpdateStudentDto } from './dto/update-student.dto';

// //   // // // // // ... existing imports ...

// //   // // // // @Injectable()
// //   // // // // export class StudentsService {
// //   // // // //   constructor(private prisma: PrismaService) {}

// //   // // // //   // Fix the create method to properly handle guardians
// //   // // // //   async create(createStudentDto: CreateStudentDto) {
// //   // // // //     const {
// //   // // // //       guardians,
// //   // // // //       classId,
// //   // // // //       sectionId,
// //   // // // //       ...studentData
// //   // // // //     } = createStudentDto;

// //   // // // //     // Validate class and section if provided
// //   // // // //     if (classId) {
// //   // // // //       const classExists = await this.prisma.class.findUnique({
// //   // // // //         where: { id: classId },
// //   // // // //       });
// //   // // // //       if (!classExists) {
// //   // // // //         throw new NotFoundException('Class not found');
// //   // // // //       }
// //   // // // //     }

// //   // // // //     if (sectionId) {
// //   // // // //       const sectionExists = await this.prisma.section.findUnique({
// //   // // // //         where: { id: sectionId },
// //   // // // //       });
// //   // // // //       if (!sectionExists) {
// //   // // // //         throw new NotFoundException('Section not found');
// //   // // // //       }
// //   // // // //     }

// //   // // // //     // Get current academic session
// //   // // // //     const currentSession = await this.prisma.academicSession.findFirst({
// //   // // // //       where: { isCurrent: true },
// //   // // // //     });

// //   // // // //     if (!currentSession) {
// //   // // // //       throw new NotFoundException('No current academic session found');
// //   // // // //     }

// //   // // // //     const admissionNumber = await this.generateAdmissionNumber(currentSession.id);

// //   // // // //     return this.prisma.$transaction(async (prisma) => {
// //   // // // //       // Create student
// //   // // // //       const student = await prisma.student.create({
// //   // // // //         data: {
// //   // // // //           ...studentData,
// //   // // // //           admissionNumber,
// //   // // // //           classId,
// //   // // // //           sectionId,
// //   // // // //         },
// //   // // // //       });

// //   // // // //       // Create guardians and link to student
// //   // // // //       if (guardians && guardians.length > 0) {
// //   // // // //         for (const guardianData of guardians) {
// //   // // // //           const guardian = await prisma.guardian.create({
// //   // // // //             data: {
// //   // // // //               firstName: guardianData.firstName,
// //   // // // //               lastName: guardianData.lastName,
// //   // // // //               relationship: guardianData.relationship,
// //   // // // //               occupation: guardianData.occupation,
// //   // // // //               phone: guardianData.phone,
// //   // // // //               email: guardianData.email,
// //   // // // //               address: guardianData.address,
// //   // // // //               isPrimary: guardianData.isPrimary,
// //   // // // //             },
// //   // // // //           });

// //   // // // //           await prisma.studentGuardian.create({
// //   // // // //             data: {
// //   // // // //               studentId: student.id,
// //   // // // //               guardianId: guardian.id,
// //   // // // //               relationship: guardianData.isPrimary ? 'PRIMARY' : 'SECONDARY',
// //   // // // //             },
// //   // // // //           });
// //   // // // //         }
// //   // // // //       }

// //   // // // //       return this.findById(student.id);
// //   // // // //     });
// //   // // // //   }

// //   // // // //   // Fix the update method
// //   // // // //   async update(id: string, updateStudentDto: UpdateStudentDto) {
// //   // // // //     await this.findById(id); // Check if student exists

// //   // // // //     const { guardians, ...studentData } = updateStudentDto;

// //   // // // //     return this.prisma.$transaction(async (prisma) => {
// //   // // // //       const student = await prisma.student.update({
// //   // // // //         where: { id },
// //   // // // //         data: studentData,
// //   // // // //       });

// //   // // // //       // Update guardians if provided
// //   // // // //       if (guardians) {
// //   // // // //         // Remove existing guardians and create new ones
// //   // // // //         await prisma.studentGuardian.deleteMany({
// //   // // // //           where: { studentId: id },
// //   // // // //         });

// //   // // // //         for (const guardianData of guardians) {
// //   // // // //           const guardian = await prisma.guardian.create({
// //   // // // //             data: {
// //   // // // //               firstName: guardianData.firstName,
// //   // // // //               lastName: guardianData.lastName,
// //   // // // //               relationship: guardianData.relationship,
// //   // // // //               occupation: guardianData.occupation,
// //   // // // //               phone: guardianData.phone,
// //   // // // //               email: guardianData.email,
// //   // // // //               address: guardianData.address,
// //   // // // //               isPrimary: guardianData.isPrimary,
// //   // // // //             },
// //   // // // //           });

// //   // // // //           await prisma.studentGuardian.create({
// //   // // // //             data: {
// //   // // // //               studentId: id,
// //   // // // //               guardianId: guardian.id,
// //   // // // //               relationship: guardianData.isPrimary ? 'PRIMARY' : 'SECONDARY',
// //   // // // //             },
// //   // // // //           });
// //   // // // //         }
// //   // // // //       }

// //   // // // //       return this.findById(id);
// //   // // // //     });
// //   // // // //   }

// //   // // // //   // ... rest of the methods remain the same ...
// //   // // // // }
// //   // // // import { Injectable, NotFoundException } from '@nestjs/common';
// //   // // // import { PrismaService } from '../../database/prisma.service';
// //   // // // import { CreateStudentDto } from './dto/create-student.dto';
// //   // // // import { UpdateStudentDto } from './dto/update-student.dto';
// //   // // // import { QueryStudentDto } from './dto/query-student.dto';

// //   // // // @Injectable()
// //   // // // export class StudentsService {
// //   // // //   constructor(private prisma: PrismaService) {}

// //   // // //   async create(createStudentDto: CreateStudentDto) {
// //   // // //     // Get current academic session
// //   // // //     const currentSession = await this.prisma.academicSession.findFirst({
// //   // // //       where: { isCurrent: true },
// //   // // //     });

// //   // // //     if (!currentSession) {
// //   // // //       throw new NotFoundException('No current academic session found');
// //   // // //     }

// //   // // //     // Generate admission number
// //   // // //     const year = new Date().getFullYear();
// //   // // //     const count = await this.prisma.student.count({
// //   // // //       where: {
// //   // // //         admissionDate: {
// //   // // //           gte: currentSession.startDate,
// //   // // //           lte: currentSession.endDate,
// //   // // //         },
// //   // // //       },
// //   // // //     });
// //   // // //     const admissionNumber = `STU${year}${(count + 1).toString().padStart(4, '0')}`;

// //   // // //     return this.prisma.student.create({
// //   // // //       data: {
// //   // // //         ...createStudentDto,
// //   // // //         admissionNumber,
// //   // // //       },
// //   // // //       include: {
// //   // // //         class: true,
// //   // // //         section: true,
// //   // // //       },
// //   // // //     });
// //   // // //   }

// //   // // //   async findAll(query: QueryStudentDto) {
// //   // // //     const {
// //   // // //       search,
// //   // // //       classId,
// //   // // //       sectionId,
// //   // // //       status,
// //   // // //       gender,
// //   // // //       page = 1,
// //   // // //       limit = 10,
// //   // // //       sortBy = 'createdAt',
// //   // // //       sortOrder = 'desc',
// //   // // //     } = query;

// //   // // //     const skip = (page - 1) * limit;
// //   // // //     const where: any = {};

// //   // // //     if (search) {
// //   // // //       where.OR = [
// //   // // //         { firstName: { contains: search, mode: 'insensitive' } },
// //   // // //         { lastName: { contains: search, mode: 'insensitive' } },
// //   // // //         { admissionNumber: { contains: search, mode: 'insensitive' } },
// //   // // //       ];
// //   // // //     }

// //   // // //     if (classId) where.classId = classId;
// //   // // //     if (sectionId) where.sectionId = sectionId;
// //   // // //     if (status) where.status = status;
// //   // // //     if (gender) where.gender = gender;

// //   // // //     const [students, total] = await Promise.all([
// //   // // //       this.prisma.student.findMany({
// //   // // //         where,
// //   // // //         include: {
// //   // // //           class: true,
// //   // // //           section: true,
// //   // // //         },
// //   // // //         skip,
// //   // // //         take: limit,
// //   // // //         orderBy: { [sortBy]: sortOrder },
// //   // // //       }),
// //   // // //       this.prisma.student.count({ where }),
// //   // // //     ]);

// //   // // //     return {
// //   // // //       data: students,
// //   // // //       meta: {
// //   // // //         total,
// //   // // //         page,
// //   // // //         limit,
// //   // // //         totalPages: Math.ceil(total / limit),
// //   // // //       },
// //   // // //     };
// //   // // //   }

// //   // // //   async findOne(id: string) {
// //   // // //     const student = await this.prisma.student.findUnique({
// //   // // //       where: { id },
// //   // // //       include: {
// //   // // //         class: true,
// //   // // //         section: true,
// //   // // //         studentGuardians: {
// //   // // //           include: {
// //   // // //             guardian: true,
// //   // // //           },
// //   // // //         },
// //   // // //       },
// //   // // //     });

// //   // // //     if (!student) {
// //   // // //       throw new NotFoundException('Student not found');
// //   // // //     }

// //   // // //     return student;
// //   // // //   }

// //   // // //   async update(id: string, updateStudentDto: UpdateStudentDto) {
// //   // // //     await this.findOne(id); // Check if exists

// //   // // //     return this.prisma.student.update({
// //   // // //       where: { id },
// //   // // //       data: updateStudentDto,
// //   // // //       include: {
// //   // // //         class: true,
// //   // // //         section: true,
// //   // // //       },
// //   // // //     });
// //   // // //   }

// //   // // //   async remove(id: string) {
// //   // // //     await this.findOne(id); // Check if exists

// //   // // //     return this.prisma.student.update({
// //   // // //       where: { id },
// //   // // //       data: { status: 'INACTIVE' },
// //   // // //     });
// //   // // //   }
// //   // // // }

// //   // // import { Injectable, NotFoundException } from '@nestjs/common';
// //   // // import { PrismaService } from '../../database/prisma.service';
// //   // // import { CreateStudentDto } from './dto/create-student.dto';
// //   // // import { UpdateStudentDto } from './dto/update-student.dto';
// //   // // import { QueryStudentDto } from './dto/query-student.dto';

// //   // // @Injectable()
// //   // // export class StudentsService {
// //   // //   constructor(private prisma: PrismaService) {}

// //   // //   async create(createStudentDto: CreateStudentDto) {
// //   // //     // Get current academic session
// //   // //     const currentSession = await this.prisma.academicSession.findFirst({
// //   // //       where: { isCurrent: true },
// //   // //     });

// //   // //     if (!currentSession) {
// //   // //       throw new NotFoundException('No current academic session found');
// //   // //     }

// //   // //     // Generate admission number
// //   // //     const year = new Date().getFullYear();
// //   // //     const count = await this.prisma.student.count({
// //   // //       where: {
// //   // //         admissionDate: {
// //   // //           gte: currentSession.startDate,
// //   // //           lte: currentSession.endDate,
// //   // //         },
// //   // //       },
// //   // //     });
// //   // //     const admissionNumber = `STU${year}${(count + 1).toString().padStart(4, '0')}`;

// //   // //     return this.prisma.student.create({
// //   // //       data: {
// //   // //         ...createStudentDto,
// //   // //         admissionNumber,
// //   // //       },
// //   // //       include: {
// //   // //         class: true,
// //   // //         section: true,
// //   // //       },
// //   // //     });
// //   // //   }

// //   // //   async findAll(query: QueryStudentDto) {
// //   // //     const {
// //   // //       search,
// //   // //       classId,
// //   // //       sectionId,
// //   // //       status,
// //   // //       gender,
// //   // //       page = 1,
// //   // //       limit = 10,
// //   // //       sortBy = 'createdAt',
// //   // //       sortOrder = 'desc',
// //   // //     } = query;

// //   // //     const skip = (page - 1) * limit;
// //   // //     const where: any = {};

// //   // //     if (search) {
// //   // //       where.OR = [
// //   // //         { firstName: { contains: search, mode: 'insensitive' } },
// //   // //         { lastName: { contains: search, mode: 'insensitive' } },
// //   // //         { admissionNumber: { contains: search, mode: 'insensitive' } },
// //   // //       ];
// //   // //     }

// //   // //     if (classId) where.classId = classId;
// //   // //     if (sectionId) where.sectionId = sectionId;
// //   // //     if (status) where.status = status;
// //   // //     if (gender) where.gender = gender;

// //   // //     const [students, total] = await Promise.all([
// //   // //       this.prisma.student.findMany({
// //   // //         where,
// //   // //         include: {
// //   // //           class: true,
// //   // //           section: true,
// //   // //         },
// //   // //         skip,
// //   // //         take: limit,
// //   // //         orderBy: { [sortBy]: sortOrder },
// //   // //       }),
// //   // //       this.prisma.student.count({ where }),
// //   // //     ]);

// //   // //     return {
// //   // //       data: students,
// //   // //       meta: {
// //   // //         total,
// //   // //         page,
// //   // //         limit,
// //   // //         totalPages: Math.ceil(total / limit),
// //   // //       },
// //   // //     };
// //   // //   }

// //   // //   async findOne(id: string) {
// //   // //     const student = await this.prisma.student.findUnique({
// //   // //       where: { id },
// //   // //       include: {
// //   // //         class: true,
// //   // //         section: true,
// //   // //       },
// //   // //     });

// //   // //     if (!student) {
// //   // //       throw new NotFoundException('Student not found');
// //   // //     }

// //   // //     return student;
// //   // //   }

// //   // //   async update(id: string, updateStudentDto: UpdateStudentDto) {
// //   // //     await this.findOne(id); // Check if exists

// //   // //     return this.prisma.student.update({
// //   // //       where: { id },
// //   // //       data: updateStudentDto,
// //   // //       include: {
// //   // //         class: true,
// //   // //         section: true,
// //   // //       },
// //   // //     });
// //   // //   }

// //   // //   async remove(id: string) {
// //   // //     await this.findOne(id); // Check if exists

// //   // //     return this.prisma.student.update({
// //   // //       where: { id },
// //   // //       data: { status: 'INACTIVE' },
// //   // //     });
// //   // //   }
// //   // // }

// //   // import { Injectable, NotFoundException } from '@nestjs/common';
// //   // import { PrismaService } from '../../database/prisma.service';
// //   // import { CreateStudentDto } from './dto/create-student.dto';
// //   // import { UpdateStudentDto } from './dto/update-student.dto';
// //   // import { QueryStudentDto } from './dto/query-student.dto';

// //   // @Injectable()
// //   // export class StudentsService {
// //   //   constructor(private prisma: PrismaService) {}

// //   //   async create(createStudentDto: CreateStudentDto) {
// //   //     // Get current academic session
// //   //     const currentSession = await this.prisma.academicSession.findFirst({
// //   //       where: { isCurrent: true },
// //   //     });

// //   //     if (!currentSession) {
// //   //       throw new NotFoundException('No current academic session found');
// //   //     }

// //   //     // Generate admission number
// //   //     const year = new Date().getFullYear();
// //   //     const count = await this.prisma.student.count({
// //   //       where: {
// //   //         admissionDate: {
// //   //           gte: currentSession.startDate,
// //   //           lte: currentSession.endDate,
// //   //         },
// //   //       },
// //   //     });
// //   //     const admissionNumber = `STU${year}${(count + 1).toString().padStart(4, '0')}`;

// //   //     return this.prisma.student.create({
// //   //       data: {
// //   //         ...createStudentDto,
// //   //         admissionNumber,
// //   //       },
// //   //     });
// //   //   }

// //   //   async findAll(query: QueryStudentDto) {
// //   //     const {
// //   //       search,
// //   //       classId,
// //   //       sectionId,
// //   //       status,
// //   //       gender,
// //   //       page = 1,
// //   //       limit = 10,
// //   //       sortBy = 'createdAt',
// //   //       sortOrder = 'desc',
// //   //     } = query;

// //   //     const skip = (page - 1) * limit;
// //   //     const where: any = {};

// //   //     if (search) {
// //   //       where.OR = [
// //   //         { firstName: { contains: search, mode: 'insensitive' } },
// //   //         { lastName: { contains: search, mode: 'insensitive' } },
// //   //         { admissionNumber: { contains: search, mode: 'insensitive' } },
// //   //       ];
// //   //     }

// //   //     if (classId) where.classId = classId;
// //   //     if (sectionId) where.sectionId = sectionId;
// //   //     if (status) where.status = status;
// //   //     if (gender) where.gender = gender;

// //   //     const [students, total] = await Promise.all([
// //   //       this.prisma.student.findMany({
// //   //         where,
// //   //         skip,
// //   //         take: limit,
// //   //         orderBy: { [sortBy]: sortOrder },
// //   //       }),
// //   //       this.prisma.student.count({ where }),
// //   //     ]);

// //   //     return {
// //   //       data: students,
// //   //       meta: {
// //   //         total,
// //   //         page,
// //   //         limit,
// //   //         totalPages: Math.ceil(total / limit),
// //   //       },
// //   //     };
// //   //   }

// //   //   async findOne(id: string) {
// //   //     const student = await this.prisma.student.findUnique({
// //   //       where: { id },
// //   //     });

// //   //     if (!student) {
// //   //       throw new NotFoundException('Student not found');
// //   //     }

// //   //     return student;
// //   //   }

// //   //   async update(id: string, updateStudentDto: UpdateStudentDto) {
// //   //     await this.findOne(id); // Check if exists

// //   //     return this.prisma.student.update({
// //   //       where: { id },
// //   //       data: updateStudentDto,
// //   //     });
// //   //   }

// //   //   async remove(id: string) {
// //   //     await this.findOne(id); // Check if exists

// //   //     return this.prisma.student.update({
// //   //       where: { id },
// //   //       data: { status: 'INACTIVE' },
// //   //     });
// //   //   }
// //   // }

// //   import { Injectable, NotFoundException } from '@nestjs/common';
// //   import { PrismaService } from '../../database/prisma.service';
// //   import { CreateStudentDto } from './dto/create-student.dto';
// //   import { UpdateStudentDto } from './dto/update-student.dto';
// //   import { QueryStudentDto } from './dto/query-student.dto';

// //   @Injectable()
// //   export class StudentsService {
// //     constructor(private prisma: PrismaService) {}

// //   async create(createStudentDto: CreateStudentDto) {
// //   const currentSession = await this.prisma.academicSession.findFirst({
// //     where: { isCurrent: true },
// //   });

// //   if (!currentSession) {
// //     throw new NotFoundException('No current academic session found');
// //   }

// //   const year = new Date().getFullYear();
// //   const count = await this.prisma.student.count({
// //     where: {
// //       admissionDate: {
// //         gte: currentSession.startDate,
// //         lte: currentSession.endDate,
// //       },
// //     },
// //   });
// //   const admissionNumber = `STU${year}${(count + 1).toString().padStart(4, '0')}`;

// //   return this.prisma.student.create({
// //     data: {
// //       ...createStudentDto,
// //       admissionNumber,
// //       studentId: admissionNumber,
// //       sessionId: currentSession.id,
// //     } as any, // Type assertion to bypass the complex Prisma type checking
// //   });
// // }
// //     async findAll(query: QueryStudentDto) {
// //       const {
// //         search,
// //         classId,
// //         sectionId,
// //         status,
// //         gender,
// //         page = 1,
// //         limit = 10,
// //         sortBy = 'createdAt',
// //         sortOrder = 'desc',
// //       } = query;

// //       const skip = (page - 1) * limit;
// //       const where: any = {};

// //       if (search) {
// //         where.OR = [
// //           { firstName: { contains: search, mode: 'insensitive' } },
// //           { lastName: { contains: search, mode: 'insensitive' } },
// //           { admissionNumber: { contains: search, mode: 'insensitive' } },
// //         ];
// //       }

// //       if (classId) where.classId = classId;
// //       if (sectionId) where.sectionId = sectionId;
// //       if (status) where.status = status;
// //       if (gender) where.gender = gender;

// //       const [students, total] = await Promise.all([
// //         this.prisma.student.findMany({
// //           where,
// //           skip,
// //           take: limit,
// //           orderBy: { [sortBy]: sortOrder },
// //         }),
// //         this.prisma.student.count({ where }),
// //       ]);

// //       return {
// //         data: students,
// //         meta: {
// //           total,
// //           page,
// //           limit,
// //           totalPages: Math.ceil(total / limit),
// //         },
// //       };
// //     }

// //     async findOne(id: string) {
// //       const student = await this.prisma.student.findUnique({
// //         where: { id },
// //       });

// //       if (!student) {
// //         throw new NotFoundException('Student not found');
// //       }

// //       return student;
// //     }

// //     async update(id: string, updateStudentDto: UpdateStudentDto) {
// //       await this.findOne(id); // Check if exists

// //       return this.prisma.student.update({
// //         where: { id },
// //         data: updateStudentDto,
// //       });
// //     }

// //     async remove(id: string) {
// //       await this.findOne(id); // Check if exists

// //       return this.prisma.student.update({
// //         where: { id },
// //         data: { status: 'INACTIVE' },
// //       });
// //     }
// //   }

// import { 
//   Controller, 
//   Get, 
//   Post, 
//   Body, 
//   Patch, 
//   Param, 
//   Delete, 
//   Query,
//   UseGuards,
//   Request,
//   HttpStatus,
//   Put
// } from '@nestjs/common';
// import { 
//   ApiTags, 
//   ApiOperation, 
//   ApiResponse, 
//   ApiBearerAuth,
//   ApiQuery 
// } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../../common/guards/roles.guard';
// import { Roles } from '../../common/decorators/roles.decorator';
// import { StudentsService } from './students.service';
// import { CreateStudentAdmissionDto } from './dto/create-student-admission.dto';
// import { UpdateStudentDto } from './dto/update-student.dto';
// import { StudentFilterDto } from './dto/student-filter.dto';
// import { BulkAdmissionDto } from './dto/bulk-admission.dto';
// import { Student, StudentWithDetails, AdmissionStats } from './entities/student.entity';

// @ApiTags('students')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Controller('students')
// export class StudentsController {
//   constructor(private readonly studentsService: StudentsService) {}

//   @Post('admission')
//   @Roles('admin', 'admission_officer')
//   @ApiOperation({ summary: 'Create new student admission (FR1.1-FR1.10)' })
//   @ApiResponse({ 
//     status: HttpStatus.CREATED, 
//     description: 'Student admission created successfully',
//     type: Student 
//   })
//   @ApiResponse({ 
//     status: HttpStatus.BAD_REQUEST, 
//     description: 'Validation failed' 
//   })
//   @ApiResponse({ 
//     status: HttpStatus.CONFLICT, 
//     description: 'Student with email/phone already exists' 
//   })
//   async create(
//     @Body() createStudentAdmissionDto: CreateStudentAdmissionDto,
//     @Request() req: any
//   ): Promise<Student> {
//     return this.studentsService.create(createStudentAdmissionDto, req.user.userId);
//   }

//   @Post('admission/bulk')
//   @Roles('admin', 'admission_officer')
//   @ApiOperation({ summary: 'Bulk student admission (FR1.2)' })
//   @ApiResponse({ 
//     status: HttpStatus.CREATED, 
//     description: 'Bulk admission processed' 
//   })
//   async bulkCreate(
//     @Body() bulkAdmissionDto: BulkAdmissionDto,
//     @Request() req: any
//   ) {
//     return this.studentsService.bulkCreate(bulkAdmissionDto, req.user.userId);
//   }

//   @Get()
//   @Roles('admin', 'teacher', 'admission_officer')
//   @ApiOperation({ summary: 'Get all students with filtering (FR1.8)' })
//   @ApiQuery({ name: 'search', required: false, type: String })
//   @ApiQuery({ name: 'classId', required: false, type: String })
//   @ApiQuery({ name: 'sessionId', required: false, type: String })
//   @ApiQuery({ name: 'status', required: false, type: String })
//   @ApiQuery({ name: 'gender', required: false, type: String })
//   @ApiQuery({ name: 'admissionDateFrom', required: false, type: Date })
//   @ApiQuery({ name: 'admissionDateTo', required: false, type: Date })
//   @ApiQuery({ name: 'page', required: false, type: Number })
//   @ApiQuery({ name: 'limit', required: false, type: Number })
//   @ApiResponse({ 
//     status: HttpStatus.OK, 
//     description: 'Students retrieved successfully' 
//   })
//   async findAll(@Query() filters: StudentFilterDto) {
//     return this.studentsService.findAll(filters);
//   }

//   @Get('stats')
//   @Roles('admin', 'admission_officer')
//   @ApiOperation({ summary: 'Get admission statistics (FR1.9)' })
//   @ApiResponse({ 
//     status: HttpStatus.OK, 
//     description: 'Admission statistics retrieved',
//     type: AdmissionStats 
//   })
//   async getAdmissionStats(@Query('sessionId') sessionId?: string) {
//     return this.studentsService.getAdmissionStats(sessionId);
//   }

//   @Get(':id')
//   @Roles('admin', 'teacher', 'admission_officer', 'student')
//   @ApiOperation({ summary: 'Get student by ID with details' })
//   @ApiResponse({ 
//     status: HttpStatus.OK, 
//     description: 'Student retrieved successfully',
//     type: StudentWithDetails 
//   })
//   @ApiResponse({ 
//     status: HttpStatus.NOT_FOUND, 
//     description: 'Student not found' 
//   })
//   async findOne(@Param('id') id: string): Promise<StudentWithDetails> {
//     return this.studentsService.findOne(id);
//   }

//   @Get('student-id/:studentId')
//   @Roles('admin', 'teacher', 'admission_officer')
//   @ApiOperation({ summary: 'Get student by student ID' })
//   @ApiResponse({ 
//     status: HttpStatus.OK, 
//     description: 'Student retrieved successfully',
//     type: StudentWithDetails 
//   })
//   async findByStudentId(@Param('studentId') studentId: string): Promise<StudentWithDetails> {
//     return this.studentsService.findByStudentId(studentId);
//   }

//   @Get(':id/admission-history')
//   @Roles('admin', 'admission_officer')
//   @ApiOperation({ summary: 'Get student admission history (FR1.9)' })
//   @ApiResponse({ 
//     status: HttpStatus.OK, 
//     description: 'Admission history retrieved' 
//   })
//   async getAdmissionHistory(@Param('id') id: string) {
//     return this.studentsService.getAdmissionHistory(id);
//   }

//   @Patch(':id')
//   @Roles('admin', 'admission_officer')
//   @ApiOperation({ summary: 'Update student information (FR1.8)' })
//   @ApiResponse({ 
//     status: HttpStatus.OK, 
//     description: 'Student updated successfully',
//     type: Student 
//   })
//   @ApiResponse({ 
//     status: HttpStatus.NOT_FOUND, 
//     description: 'Student not found' 
//   })
//   async update(
//     @Param('id') id: string,
//     @Body() updateStudentDto: UpdateStudentDto,
//     @Request() req: any
//   ): Promise<Student> {
//     return this.studentsService.update(id, updateStudentDto, req.user.userId);
//   }

//   @Put(':id/status')
//   @Roles('admin', 'admission_officer')
//   @ApiOperation({ summary: 'Change student status' })
//   @ApiResponse({ 
//     status: HttpStatus.OK, 
//     description: 'Student status updated successfully',
//     type: Student 
//   })
//   async changeStatus(
//     @Param('id') id: string,
//     @Body('status') status: string,
//     @Request() req: any
//   ): Promise<Student> {
//     return this.studentsService.changeStatus(id, status, req.user.userId);
//   }

//   @Post(':id/generate-confirmation')
//   @Roles('admin', 'admission_officer')
//   @ApiOperation({ summary: 'Generate admission confirmation and receipt (FR1.10)' })
//   @ApiResponse({ 
//     status: HttpStatus.OK, 
//     description: 'Confirmation generated successfully' 
//   })
//   async generateAdmissionConfirmation(@Param('id') id: string) {
//     return this.studentsService.generateAdmissionConfirmation(id);
//   }

//   @Delete(':id')
//   @Roles('admin')
//   @ApiOperation({ summary: 'Delete student record' })
//   @ApiResponse({ 
//     status: HttpStatus.OK, 
//     description: 'Student deleted successfully' 
//   })
//   @ApiResponse({ 
//     status: HttpStatus.NOT_FOUND, 
//     description: 'Student not found' 
//   })
//   async remove(
//     @Param('id') id: string,
//     @Request() req: any
//   ): Promise<void> {
//     return this.studentsService.remove(id, req.user.userId);
//   }
// }

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
    if (lastStudent) {
      const lastSequence = parseInt(lastStudent.studentId.slice(-4));
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
    if (lastAdmission) {
      const lastSequence = parseInt(lastAdmission.admissionNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${year}${sequence.toString().padStart(4, '0')}`;
  }

  // FR1.5 - Validate student data
  private async validateStudentData(createStudentDto: CreateStudentAdmissionDto): Promise<void> {
    if (createStudentDto.dateOfBirth >= new Date()) {
      throw new BadRequestException('Date of birth must be in the past');
    }

    if (createStudentDto.email) {
      const existingStudent = await this.prisma.student.findUnique({
        where: { email: createStudentDto.email },
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

    const classExists = await this.prisma.class.findUnique({
      where: { id: createStudentDto.classId },
    });
    if (!classExists) {
      throw new NotFoundException('Class not found');
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
        currentStrength: { lt: this.prisma.class.fields.capacity }
      },
      orderBy: { grade: 'asc' }
    });

    if (availableClasses.length === 0) {
      throw new BadRequestException('No available classes with capacity');
    }

    return availableClasses[0].id;
  }

  private async getStudentRoleId(tx: Prisma.TransactionClient): Promise<string> {
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
    const { search, classId, sessionId, status, gender, admissionDateFrom, admissionDateTo, page, limit } = filters;
    
    const skip = (page - 1) * limit;
    
    const where: Prisma.StudentWhereInput = {
      AND: []
    };

    if (search) {
      where.AND.push({
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

    if (classId) where.AND.push({ classId });
    if (sessionId) where.AND.push({ sessionId });
    if (status) where.AND.push({ status });
    if (gender) where.AND.push({ gender });

    if (admissionDateFrom || admissionDateTo) {
      const dateFilter: any = {};
      if (admissionDateFrom) dateFilter.gte = admissionDateFrom;
      if (admissionDateTo) dateFilter.lte = admissionDateTo;
      where.AND.push({ admissionDate: dateFilter });
    }

    if (where.AND.length === 0) {
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

    const studentsWithDetails: StudentWithDetails[] = students.map(student => ({
      ...student,
      className: student.class.name,
      section: student.class.section,
      sessionName: student.session.name,
      classTeacher: student.class.classTeacher ? 
        `${student.class.classTeacher.firstName} ${student.class.classTeacher.lastName}` : 'Not Assigned'
    }));

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
            exam: true,
            subject: true
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

    return {
      ...student,
      className: student.class.name,
      section: student.class.section,
      sessionName: student.session.name,
      classTeacher: student.class.classTeacher ? 
        `${student.class.classTeacher.firstName} ${student.class.classTeacher.lastName}` : 'Not Assigned',
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
      const emailExists = await this.prisma.student.findUnique({
        where: { email: updateStudentDto.email },
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
      } catch (error) {
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
    const where: Prisma.StudentWhereInput = {};
    if (sessionId) {
      where.sessionId = sessionId;
    }

    const [
      totalApplications,
      approvedApplications,
      pendingApplications,
      applicationsByClass,
      applicationsByMonth
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
      this.prisma.student.groupBy({
        by: ['admissionDate'],
        where: {
          ...where,
          admissionDate: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        },
        _count: {
          _all: true
        }
      })
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

    const monthlyData = applicationsByMonth.map(item => ({
      month: item.admissionDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
      count: item._count._all
    }));

    return {
      totalApplications,
      approvedApplications,
      pendingApplications: pendingApplications,
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

    return {
      ...student,
      className: student.class.name,
      section: student.class.section,
      sessionName: student.session.name,
      classTeacher: student.class.classTeacher ? 
        `${student.class.classTeacher.firstName} ${student.class.classTeacher.lastName}` : 'Not Assigned'
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