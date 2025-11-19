// // import {
// //   Injectable,
// //   NotFoundException,
// //   ConflictException,
// //   BadRequestException,
// //   Logger,
// // } from '@nestjs/common';
// // import { PrismaService } from '../../database/prisma.service';
// // import { CreateStudentDto } from './dto/create-student.dto';
// // import { UpdateStudentDto } from './dto/update-student.dto';
// // import { QueryStudentDto } from './dto/query-student.dto';
// // import * as bcrypt from 'bcryptjs';

// // @Injectable()
// // export class StudentsService {
// //   private readonly logger = new Logger(StudentsService.name);

// //   constructor(private prisma: PrismaService) {}

// //   /**
// //    * Create a new student with user account
// //    * Auto-generates student ID based on year
// //    */
// //   async create(createStudentDto: CreateStudentDto) {
// //     this.logger.log(`Creating new student: ${createStudentDto.admissionNumber}`);

// //     // Validate class exists
// //     const classExists = await this.prisma.class.findUnique({
// //       where: { id: createStudentDto.classId },
// //       include: { session: true },
// //     });

// //     if (!classExists) {
// //       throw new NotFoundException('Class not found');
// //     }

// //     // Check class capacity
// //     if (classExists.currentStrength >= classExists.capacity) {
// //       throw new BadRequestException('Class capacity is full');
// //     }

// //     // Validate session exists
// //     const sessionExists = await this.prisma.academicSession.findUnique({
// //       where: { id: createStudentDto.sessionId },
// //     });

// //     if (!sessionExists) {
// //       throw new NotFoundException('Academic session not found');
// //     }

// //     // Check for duplicate admission number
// //     const duplicateAdmission = await this.prisma.student.findUnique({
// //       where: { admissionNumber: createStudentDto.admissionNumber },
// //     });

// //     if (duplicateAdmission) {
// //       throw new ConflictException('Admission number already exists');
// //     }

// //     // Check for duplicate username
// //     const duplicateUsername = await this.prisma.user.findUnique({
// //       where: { username: createStudentDto.username },
// //     });

// //     if (duplicateUsername) {
// //       throw new ConflictException('Username already exists');
// //     }

// //     // Check for duplicate email
// //     const duplicateEmail = await this.prisma.user.findUnique({
// //       where: { email: createStudentDto.email },
// //     });

// //     if (duplicateEmail) {
// //       throw new ConflictException('Email already exists');
// //     }

// //     // Hash password
// //     const passwordHash = await bcrypt.hash(createStudentDto.password, 12);

// //     // Get student role (roleId: 4 from seed data)
// //     const studentRole = await this.prisma.role.findFirst({
// //       where: { name: 'Student' },
// //     });

// //     if (!studentRole) {
// //       throw new NotFoundException('Student role not configured in system');
// //     }

// //     // Generate unique student ID
// //     const studentId = await this.generateStudentId();

// //     // Create student with user account in a transaction
// //     const result = await this.prisma.$transaction(async (prisma) => {
// //       // Create user account
// //       const user = await prisma.user.create({
// //         data: {
// //           username: createStudentDto.username,
// //           email: createStudentDto.email,
// //           passwordHash,
// //           firstName: createStudentDto.firstName,
// //           lastName: createStudentDto.lastName,
// //           phone: createStudentDto.phone,
// //           roleId: studentRole.id,
// //           isActive: true,
// //         },
// //       });

// //       // Create student record
// //       const student = await prisma.student.create({
// //         data: {
// //           studentId,
// //           userId: user.id,
// //           admissionNumber: createStudentDto.admissionNumber,
// //           admissionDate: createStudentDto.admissionDate
// //             ? new Date(createStudentDto.admissionDate)
// //             : new Date(),
// //           classId: createStudentDto.classId,
// //           sessionId: createStudentDto.sessionId,
// //           rollNumber: createStudentDto.rollNumber,
// //           firstName: createStudentDto.firstName,
// //           lastName: createStudentDto.lastName,
// //           dateOfBirth: new Date(createStudentDto.dateOfBirth),
// //           gender: createStudentDto.gender,
// //           bloodGroup: createStudentDto.bloodGroup,
// //           nationality: createStudentDto.nationality || 'Ethiopian',
// //           religion: createStudentDto.religion,
// //           category: createStudentDto.category,
// //           email: createStudentDto.email,
// //           phone: createStudentDto.phone,
// //           address: createStudentDto.address,
// //           city: createStudentDto.city,
// //           state: createStudentDto.state,
// //           pincode: createStudentDto.pincode,
// //           guardianName: createStudentDto.guardianName,
// //           guardianRelation: createStudentDto.guardianRelation,
// //           guardianPhone: createStudentDto.guardianPhone,
// //           guardianEmail: createStudentDto.guardianEmail,
// //           guardianOccupation: createStudentDto.guardianOccupation,
// //           guardianIncome: createStudentDto.guardianIncome ? 
// //             parseFloat(createStudentDto.guardianIncome.toString()) : null,
// //           previousSchool: createStudentDto.previousSchool,
// //           previousClass: createStudentDto.previousClass,
// //           previousPercentage: createStudentDto.previousPercentage ? 
// //             parseFloat(createStudentDto.previousPercentage.toString()) : null,
// //           tcNumber: createStudentDto.tcNumber,
// //           tcDate: createStudentDto.tcDate ? new Date(createStudentDto.tcDate) : null,
// //           medicalConditions: createStudentDto.medicalConditions,
// //           allergies: createStudentDto.allergies,
// //           emergencyContact: createStudentDto.emergencyContact,
// //           photoUrl: createStudentDto.photoUrl,
// //           birthCertificateUrl: createStudentDto.birthCertificateUrl,
// //           tcUrl: createStudentDto.tcUrl,
// //           aadharUrl: createStudentDto.aadharUrl,
// //           status: createStudentDto.status || 'Active',
// //           isActive: true,
// //         },
// //         include: {
// //           user: {
// //             select: {
// //               id: true,
// //               username: true,
// //               email: true,
// //               firstName: true,
// //               lastName: true,
// //               role: true,
// //             },
// //           },
// //           class: {
// //             include: {
// //               session: true,
// //             },
// //           },
// //           session: true,
// //         },
// //       });

// //       // Update class strength
// //       await prisma.class.update({
// //         where: { id: createStudentDto.classId },
// //         data: {
// //           currentStrength: {
// //             increment: 1,
// //           },
// //         },
// //       });

// //       return student;
// //     });

// //     this.logger.log(`Student created successfully: ${result.studentId}`);

// //     // Remove sensitive data
// //     const { user, ...studentData } = result;
// //     const { passwordHash: userPasswordHash, ...userData } = user as any;

// //     return {
// //       message: 'Student registered successfully',
// //       student: {
// //         ...studentData,
// //         user: userData,
// //       },
// //     };
// //   }

// //   /**
// //    * Get all students with pagination and filters
// //    */
// //   async findAll(query: QueryStudentDto) {
// //     const { page = 1, limit = 10, search, classId, sessionId, gender, status, grade, section } = query;
// //     const skip = (page - 1) * limit;

// //     // Build where clause
// //     const where: any = {
// //       isActive: true,
// //     };

// //     if (search) {
// //       where.OR = [
// //         { studentId: { contains: search, mode: 'insensitive' } },
// //         { admissionNumber: { contains: search, mode: 'insensitive' } },
// //         { firstName: { contains: search, mode: 'insensitive' } },
// //         { lastName: { contains: search, mode: 'insensitive' } },
// //         { email: { contains: search, mode: 'insensitive' } },
// //       ];
// //     }

// //     if (classId) where.classId = classId;
// //     if (sessionId) where.sessionId = sessionId;
// //     if (gender) where.gender = gender;
// //     if (status) where.status = status;

// //     if (grade || section) {
// //       where.class = {};
// //       if (grade) where.class.grade = grade;
// //       if (section) where.class.section = section;
// //     }

// //     const [students, total] = await Promise.all([
// //       this.prisma.student.findMany({
// //         where,
// //         skip,
// //         take: limit,
// //         include: {
// //           user: {
// //             select: {
// //               id: true,
// //               username: true,
// //               email: true,
// //               isActive: true,
// //             },
// //           },
// //           class: {
// //             select: {
// //               id: true,
// //               name: true,
// //               grade: true,
// //               section: true,
// //               academicYear: true,
// //             },
// //           },
// //           session: {
// //             select: {
// //               id: true,
// //               name: true,
// //               startDate: true,
// //               endDate: true,
// //             },
// //           },
// //         },
// //         orderBy: {
// //           createdAt: 'desc',
// //         },
// //       }),
// //       this.prisma.student.count({ where }),
// //     ]);

// //     return {
// //       data: students,
// //       meta: {
// //         total,
// //         page,
// //         limit,
// //         totalPages: Math.ceil(total / limit),
// //       },
// //     };
// //   }

// //   /**
// //    * Get student by ID with full details
// //    */
// //   async findOne(id: number) {
// //     const student = await this.prisma.student.findUnique({
// //       where: { id },
// //       include: {
// //         user: {
// //           select: {
// //             id: true,
// //             username: true,
// //             email: true,
// //             firstName: true,
// //             lastName: true,
// //             phone: true,
// //             isActive: true,
// //             lastLogin: true,
// //             createdAt: true,
// //           },
// //         },
// //         class: {
// //           include: {
// //             session: true,
// //             classTeacher: {
// //               select: {
// //                 id: true,
// //                 firstName: true,
// //                 lastName: true,
// //                 email: true,
// //                 phone: true,
// //               },
// //             },
// //           },
// //         },
// //         session: true,
// //         attendances: {
// //           take: 10,
// //           orderBy: {
// //             date: 'desc',
// //           },
// //         },
// //         examResults: {
// //           take: 5,
// //           orderBy: {
// //             createdAt: 'desc',
// //           },
// //           include: {
// //             exam: {
// //               select: {
// //                 name: true,
// //                 term: true,
// //                 academicYear: true,
// //               },
// //             },
// //           },
// //         },
// //       },
// //     });

// //     if (!student) {
// //       throw new NotFoundException(`Student with ID ${id} not found`);
// //     }

// //     return {
// //       data: student,
// //     };
// //   }

// //   /**
// //    * Get student by student ID (e.g., STU2024001)
// //    */
// //   async findByStudentId(studentId: string) {
// //     const student = await this.prisma.student.findUnique({
// //       where: { studentId },
// //       include: {
// //         user: {
// //           select: {
// //             id: true,
// //             username: true,
// //             email: true,
// //             firstName: true,
// //             lastName: true,
// //             isActive: true,
// //           },
// //         },
// //         class: true,
// //         session: true,
// //       },
// //     });

// //     if (!student) {
// //       throw new NotFoundException(`Student with ID ${studentId} not found`);
// //     }

// //     return {
// //       data: student,
// //     };
// //   }

// //   /**
// //    * Update student information
// //    */
// //   async update(id: number, updateStudentDto: UpdateStudentDto) {
// //     this.logger.log(`Updating student ID: ${id}`);

// //     // Check if student exists
// //     const existingStudent = await this.prisma.student.findUnique({
// //       where: { id },
// //       include: { user: true },
// //     });

// //     if (!existingStudent) {
// //       throw new NotFoundException(`Student with ID ${id} not found`);
// //     }

// //     // If changing class, validate and update strength
// //     if (updateStudentDto.classId && updateStudentDto.classId !== existingStudent.classId) {
// //       const newClass = await this.prisma.class.findUnique({
// //         where: { id: updateStudentDto.classId },
// //       });

// //       if (!newClass) {
// //         throw new NotFoundException('New class not found');
// //       }

// //       if (newClass.currentStrength >= newClass.capacity) {
// //         throw new BadRequestException('New class capacity is full');
// //       }
// //     }

// //     // Check for duplicate email if changing
// //     if (updateStudentDto.email && updateStudentDto.email !== existingStudent.email) {
// //       const duplicateEmail = await this.prisma.user.findFirst({
// //         where: {
// //           email: updateStudentDto.email,
// //           id: { not: existingStudent.userId },
// //         },
// //       });

// //       if (duplicateEmail) {
// //         throw new ConflictException('Email already exists');
// //       }
// //     }

// //     // Prepare update data
// //     const updateData: any = { ...updateStudentDto };

// //     // Handle date conversions
// //     if (updateStudentDto.dateOfBirth) {
// //       updateData.dateOfBirth = new Date(updateStudentDto.dateOfBirth);
// //     }
// //     if (updateStudentDto.tcDate) {
// //       updateData.tcDate = new Date(updateStudentDto.tcDate);
// //     }

// //     // Handle decimal conversions
// //     if (updateStudentDto.guardianIncome !== undefined) {
// //       updateData.guardianIncome = updateStudentDto.guardianIncome ? 
// //         parseFloat(updateStudentDto.guardianIncome.toString()) : null;
// //     }
// //     if (updateStudentDto.previousPercentage !== undefined) {
// //       updateData.previousPercentage = updateStudentDto.previousPercentage ? 
// //         parseFloat(updateStudentDto.previousPercentage.toString()) : null;
// //     }

// //     // Remove undefined values
// //     Object.keys(updateData).forEach(key => {
// //       if (updateData[key] === undefined) {
// //         delete updateData[key];
// //       }
// //     });

// //     // Update in transaction
// //     const result = await this.prisma.$transaction(async (prisma) => {
// //       // Update user account if email or personal info changed
// //       if (updateStudentDto.email || updateStudentDto.firstName || updateStudentDto.lastName || updateStudentDto.phone) {
// //         await prisma.user.update({
// //           where: { id: existingStudent.userId },
// //           data: {
// //             ...(updateStudentDto.email && { email: updateStudentDto.email }),
// //             ...(updateStudentDto.firstName && { firstName: updateStudentDto.firstName }),
// //             ...(updateStudentDto.lastName && { lastName: updateStudentDto.lastName }),
// //             ...(updateStudentDto.phone && { phone: updateStudentDto.phone }),
// //           },
// //         });
// //       }

// //       // Update student record
// //       const student = await prisma.student.update({
// //         where: { id },
// //         data: updateData,
// //         include: {
// //           user: {
// //             select: {
// //               id: true,
// //               username: true,
// //               email: true,
// //               firstName: true,
// //               lastName: true,
// //             },
// //           },
// //           class: true,
// //           session: true,
// //         },
// //       });

// //       // Update class strengths if class changed
// //       if (updateStudentDto.classId && updateStudentDto.classId !== existingStudent.classId) {
// //         await prisma.class.update({
// //           where: { id: existingStudent.classId },
// //           data: { currentStrength: { decrement: 1 } },
// //         });

// //         await prisma.class.update({
// //           where: { id: updateStudentDto.classId },
// //           data: { currentStrength: { increment: 1 } },
// //         });
// //       }

// //       return student;
// //     });

// //     this.logger.log(`Student updated successfully: ${id}`);

// //     return {
// //       message: 'Student updated successfully',
// //       data: result,
// //     };
// //   }

// //   /**
// //    * Soft delete student (deactivate)
// //    */
// //   async remove(id: number) {
// //     const student = await this.prisma.student.findUnique({
// //       where: { id },
// //     });

// //     if (!student) {
// //       throw new NotFoundException(`Student with ID ${id} not found`);
// //     }

// //     await this.prisma.$transaction(async (prisma) => {
// //       // Deactivate student
// //       await prisma.student.update({
// //         where: { id },
// //         data: {
// //           isActive: false,
// //           status: 'Inactive',
// //         },
// //       });
      
// //       // Deactivate user account
// //       await prisma.user.update({
// //         where: { id: student.userId },
// //         data: { isActive: false },
// //       });
      
// //       // Decrease class strength
// //       await prisma.class.update({
// //         where: { id: student.classId },
// //         data: { currentStrength: { decrement: 1 } },
// //       });
// //     });

// //     this.logger.log(`Student deactivated: ${id}`);

// //     return {
// //       message: 'Student deactivated successfully',
// //     };
// //   }

// //   /**
// //    * Generate unique student ID
// //    * Format: STU{YEAR}{INCREMENT}
// //    * Example: STU2024001
// //    */
// //   private async generateStudentId(): Promise<string> {
// //     const currentYear = new Date().getFullYear();
// //     const prefix = `STU${currentYear}`;

// //     // Get the last student ID for current year
// //     const lastStudent = await this.prisma.student.findFirst({
// //       where: {
// //         studentId: {
// //           startsWith: prefix,
// //         },
// //       },
// //       orderBy: {
// //         studentId: 'desc',
// //       },
// //     });

// //     let nextNumber = 1;
// //     if (lastStudent) {
// //       const lastNumber = parseInt(lastStudent.studentId.replace(prefix, ''));
// //       nextNumber = lastNumber + 1;
// //     }

// //     // Pad with zeros (e.g., 001, 002, ...)
// //     const paddedNumber = nextNumber.toString().padStart(3, '0');
// //     return `${prefix}${paddedNumber}`;
// //   }

// //   /**
// //    * Get student statistics
// //    */
// //   async getStatistics() {
// //     const [total, active, inactive, male, female, byClass] = await Promise.all([
// //       this.prisma.student.count(),
// //       this.prisma.student.count({ where: { status: 'Active' } }),
// //       this.prisma.student.count({ where: { status: 'Inactive' } }),
// //       this.prisma.student.count({ where: { gender: 'Male' } }),
// //       this.prisma.student.count({ where: { gender: 'Female' } }),
// //       this.prisma.student.groupBy({
// //         by: ['classId'],
// //         _count: true,
// //       }),
// //     ]);

// //     return {
// //       total,
// //       active,
// //       inactive,
// //       male,
// //       female,
// //       byClass,
// //     };
// //   }
// // }

// import {
//   Injectable,
//   NotFoundException,
//   ConflictException,
//   BadRequestException,
//   Logger,
//   InternalServerErrorException,
// } from '@nestjs/common';
// import { PrismaService } from '../../database/prisma.service';
// import { CreateStudentDto } from './dto/create-student.dto';
// import { UpdateStudentDto } from './dto/update-student.dto';
// import { QueryStudentDto } from './dto/query-student.dto';
// import * as bcrypt from 'bcryptjs';

// @Injectable()
// export class StudentsService {
//   private readonly logger = new Logger(StudentsService.name);

//   constructor(private prisma: PrismaService) {}

//   /**
//    * Enhanced student creation with comprehensive validation
//    */
//   async create(createStudentDto: CreateStudentDto) {
//     this.logger.log(`Creating new student: ${createStudentDto.admissionNumber}`);

//     // Validate all required entities exist
//     await this.validateAdmissionPrerequisites(createStudentDto);

//     // Check for duplicates
//     await this.checkForDuplicates(createStudentDto);

//     // Generate unique student ID
//     const studentId = await this.generateStudentId();

//     // Hash password
//     const passwordHash = await bcrypt.hash(createStudentDto.password, 12);

//     // Get student role
//     const studentRole = await this.prisma.role.findFirst({
//       where: { name: 'Student' },
//     });

//     if (!studentRole) {
//       throw new NotFoundException('Student role not configured in system');
//     }

//     // Create student with user account in a transaction
//     const result = await this.prisma.$transaction(async (prisma) => {
//       // Create user account
//       const user = await prisma.user.create({
//         data: {
//           username: createStudentDto.username,
//           email: createStudentDto.email,
//           passwordHash,
//           firstName: createStudentDto.firstName,
//           lastName: createStudentDto.lastName,
//           phone: createStudentDto.phone,
//           roleId: studentRole.id,
//           isActive: true,
//         },
//       });

//       // Prepare student data
//       const studentData = this.prepareStudentData(createStudentDto, studentId, user.id);

//       // Create student record
//       const student = await prisma.student.create({
//         data: studentData,
//         include: {
//           user: {
//             select: {
//               id: true,
//               username: true,
//               email: true,
//               firstName: true,
//               lastName: true,
//               role: true,
//             },
//           },
//           class: {
//             include: {
//               session: true,
//               classTeacher: {
//                 select: {
//                   id: true,
//                   firstName: true,
//                   lastName: true,
//                 },
//               },
//             },
//           },
//           session: true,
//         },
//       });

//       // Update class strength
//       await prisma.class.update({
//         where: { id: createStudentDto.classId },
//         data: {
//           currentStrength: {
//             increment: 1,
//           },
//         },
//       });

//       // Create audit log for admission
//       await prisma.auditLog.create({
//         data: {
//           userId: user.id,
//           action: 'CREATE',
//           resource: 'STUDENT_ADMISSION',
//           resourceId: student.id,
//           details: {
//             admissionNumber: createStudentDto.admissionNumber,
//             studentId: student.studentId,
//             classId: createStudentDto.classId,
//             sessionId: createStudentDto.sessionId,
//           },
//         },
//       });

//       return student;
//     });

//     this.logger.log(`Student admission completed: ${result.studentId}`);

//     return {
//       message: 'Student admitted successfully',
//       student: result,
//       admissionDetails: {
//         studentId: result.studentId,
//         admissionNumber: result.admissionNumber,
//         class: result.class.name,
//         session: result.session.name,
//       },
//     };
//   }

//   /**
//    * Validate all prerequisites for student admission
//    */
//   private async validateAdmissionPrerequisites(createStudentDto: CreateStudentDto) {
//     // Validate class exists and has capacity
//     const classExists = await this.prisma.class.findUnique({
//       where: { id: createStudentDto.classId },
//       include: { session: true },
//     });

//     if (!classExists) {
//       throw new NotFoundException('Class not found');
//     }

//     if (classExists.currentStrength >= classExists.capacity) {
//       throw new BadRequestException(`Class ${classExists.name} capacity is full (${classExists.currentStrength}/${classExists.capacity})`);
//     }

//     // Validate session exists and is active
//     const sessionExists = await this.prisma.academicSession.findUnique({
//       where: { id: createStudentDto.sessionId, isActive: true },
//     });

//     if (!sessionExists) {
//       throw new NotFoundException('Academic session not found or inactive');
//     }

//     // Validate age requirements (basic check)
//     const dob = new Date(createStudentDto.dateOfBirth);
//     const today = new Date();
//     const age = today.getFullYear() - dob.getFullYear();
    
//     if (age < 3 || age > 25) {
//       throw new BadRequestException('Student age must be between 3 and 25 years');
//     }

//     // Validate class and session match
//     if (classExists.sessionId !== createStudentDto.sessionId) {
//       throw new BadRequestException('Class does not belong to the selected academic session');
//     }
//   }

//   /**
//    * Check for duplicate records
//    */
//   private async checkForDuplicates(createStudentDto: CreateStudentDto) {
//     // Check duplicate admission number
//     const duplicateAdmission = await this.prisma.student.findUnique({
//       where: { admissionNumber: createStudentDto.admissionNumber },
//     });

//     if (duplicateAdmission) {
//       throw new ConflictException('Admission number already exists');
//     }

//     // Check duplicate username
//     const duplicateUsername = await this.prisma.user.findUnique({
//       where: { username: createStudentDto.username },
//     });

//     if (duplicateUsername) {
//       throw new ConflictException('Username already exists');
//     }

//     // Check duplicate email
//     const duplicateEmail = await this.prisma.user.findUnique({
//       where: { email: createStudentDto.email },
//     });

//     if (duplicateEmail) {
//       throw new ConflictException('Email already exists');
//     }

//     // Check if roll number is unique in class
//     if (createStudentDto.rollNumber) {
//       const duplicateRoll = await this.prisma.student.findFirst({
//         where: {
//           classId: createStudentDto.classId,
//           rollNumber: createStudentDto.rollNumber,
//         },
//       });

//       if (duplicateRoll) {
//         throw new ConflictException('Roll number already exists in this class');
//       }
//     }
//   }

//   /**
//    * Prepare student data for creation
//    */
//   private prepareStudentData(createStudentDto: CreateStudentDto, studentId: string, userId: number) {
//     return {
//       studentId,
//       userId,
//       admissionNumber: createStudentDto.admissionNumber,
//       admissionDate: createStudentDto.admissionDate ? new Date(createStudentDto.admissionDate) : new Date(),
//       classId: createStudentDto.classId,
//       sessionId: createStudentDto.sessionId,
//       rollNumber: createStudentDto.rollNumber,
      
//       // Personal Information
//       firstName: createStudentDto.firstName,
//       lastName: createStudentDto.lastName,
//       dateOfBirth: new Date(createStudentDto.dateOfBirth),
//       gender: createStudentDto.gender,
//       bloodGroup: createStudentDto.healthInfo?.bloodGroup,
//       nationality: createStudentDto.nationality || 'Ethiopian',
//       religion: createStudentDto.religion,
//       category: createStudentDto.category,

//       // Contact Information
//       email: createStudentDto.email,
//       phone: createStudentDto.phone,
//       address: createStudentDto.address,
//       city: createStudentDto.city,
//       state: createStudentDto.state,
//       pincode: createStudentDto.pincode,

//       // Guardian Information
//       guardianName: createStudentDto.guardian.name,
//       guardianRelation: createStudentDto.guardian.relation,
//       guardianPhone: createStudentDto.guardian.phone,
//       guardianEmail: createStudentDto.guardian.email,
//       guardianOccupation: createStudentDto.guardian.occupation,
//       guardianIncome: createStudentDto.guardian.income ? 
//         parseFloat(createStudentDto.guardian.income.toString()) : null,

//       // Educational Background
//       previousSchool: createStudentDto.educationalBackground?.previousSchool,
//       previousClass: createStudentDto.educationalBackground?.previousClass,
//       previousPercentage: createStudentDto.educationalBackground?.previousPercentage ? 
//         parseFloat(createStudentDto.educationalBackground.previousPercentage.toString()) : null,
//       tcNumber: createStudentDto.educationalBackground?.tcNumber,
//       tcDate: createStudentDto.educationalBackground?.tcDate ? 
//         new Date(createStudentDto.educationalBackground.tcDate) : null,

//       // Health Information
//       medicalConditions: createStudentDto.healthInfo?.medicalConditions,
//       allergies: createStudentDto.healthInfo?.allergies,
//       emergencyContact: createStudentDto.healthInfo?.emergencyContact,

//       // Documents (would be handled by file upload service)
//       photoUrl: createStudentDto.documents?.find(d => d.type === 'photo')?.fileUrl,
//       birthCertificateUrl: createStudentDto.documents?.find(d => d.type === 'birth_certificate')?.fileUrl,
//       tcUrl: createStudentDto.documents?.find(d => d.type === 'tc')?.fileUrl,
//       aadharUrl: createStudentDto.documents?.find(d => d.type === 'aadhar')?.fileUrl,

//       // Status
//       status: createStudentDto.status || 'Active',
//       isActive: createStudentDto.isActive !== undefined ? createStudentDto.isActive : true,
//     };
//   }

//   /**
//    * Generate unique student ID - Enhanced version
//    */
//   private async generateStudentId(): Promise<string> {
//     const currentYear = new Date().getFullYear();
//     const prefix = `STU${currentYear}`;

//     // Get the last student ID for current year
//     const lastStudent = await this.prisma.student.findFirst({
//       where: {
//         studentId: {
//           startsWith: prefix,
//         },
//       },
//       orderBy: {
//         studentId: 'desc',
//       },
//     });

//     let nextNumber = 1;
//     if (lastStudent) {
//       const lastNumber = parseInt(lastStudent.studentId.replace(prefix, ''));
//       nextNumber = lastNumber + 1;
//     }

//     // Pad with zeros (e.g., 001, 002, ...)
//     const paddedNumber = nextNumber.toString().padStart(3, '0');
//     return `${prefix}${paddedNumber}`;
//   }

//   /**
//    * Enhanced student search with more filters
//    */
//   async findAll(query: QueryStudentDto) {
//     const { 
//       page = 1, 
//       limit = 10, 
//       search, 
//       classId, 
//       sessionId, 
//       gender, 
//       status, 
//       grade, 
//       section,
//       admissionNumber,
//       studentId 
//     } = query;
    
//     const skip = (page - 1) * limit;

//     // Build where clause
//     const where: any = {
//       isActive: true,
//     };

//     if (search) {
//       where.OR = [
//         { studentId: { contains: search, mode: 'insensitive' } },
//         { admissionNumber: { contains: search, mode: 'insensitive' } },
//         { firstName: { contains: search, mode: 'insensitive' } },
//         { lastName: { contains: search, mode: 'insensitive' } },
//         { email: { contains: search, mode: 'insensitive' } },
//         { guardianName: { contains: search, mode: 'insensitive' } },
//       ];
//     }

//     if (classId) where.classId = classId;
//     if (sessionId) where.sessionId = sessionId;
//     if (gender) where.gender = gender;
//     if (status) where.status = status;
//     if (admissionNumber) where.admissionNumber = admissionNumber;
//     if (studentId) where.studentId = studentId;

//     if (grade || section) {
//       where.class = {};
//       if (grade) where.class.grade = grade;
//       if (section) where.class.section = section;
//     }

//     const [students, total] = await Promise.all([
//       this.prisma.student.findMany({
//         where,
//         skip,
//         take: limit,
//         include: {
//           user: {
//             select: {
//               id: true,
//               username: true,
//               email: true,
//               isActive: true,
//               lastLogin: true,
//             },
//           },
//           class: {
//             select: {
//               id: true,
//               name: true,
//               grade: true,
//               section: true,
//               academicYear: true,
//               capacity: true,
//               currentStrength: true,
//               classTeacher: {
//                 select: {
//                   firstName: true,
//                   lastName: true,
//                 },
//               },
//             },
//           },
//           session: {
//             select: {
//               id: true,
//               name: true,
//               startDate: true,
//               endDate: true,
//               isActive: true,
//             },
//           },
//         },
//         orderBy: {
//           createdAt: 'desc',
//         },
//       }),
//       this.prisma.student.count({ where }),
//     ]);

//     return {
//       data: students,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     };
//   }

//   /**
//    * Get admission statistics
//    */
//   async getAdmissionStatistics(sessionId?: number) {
//     const where: any = {};
//     if (sessionId) {
//       where.sessionId = sessionId;
//     }

//     const [
//       totalAdmissions,
//       activeStudents,
//       byGender,
//       byClass,
//       byStatus,
//       monthlyAdmissions
//     ] = await Promise.all([
//       this.prisma.student.count({ where }),
//       this.prisma.student.count({ where: { ...where, status: 'Active' } }),
//       this.prisma.student.groupBy({
//         by: ['gender'],
//         _count: true,
//         where,
//       }),
//       this.prisma.student.groupBy({
//         by: ['classId'],
//         _count: true,
//         where,
//       }),
//       this.prisma.student.groupBy({
//         by: ['status'],
//         _count: true,
//         where,
//       }),
//       this.prisma.student.groupBy({
//         by: ['admissionDate'],
//         _count: true,
//         where: {
//           admissionDate: {
//             gte: new Date(new Date().getFullYear(), 0, 1), // Current year
//           },
//         },
//       }),
//     ]);

//     return {
//       totalAdmissions,
//       activeStudents,
//       byGender,
//       byClass,
//       byStatus,
//       monthlyAdmissions: monthlyAdmissions.map(ma => ({
//         month: ma.admissionDate.toISOString().substring(0, 7),
//         count: ma._count,
//       })),
//     };
//   }

//   /**
//    * Bulk student admission (for CSV upload)
//    */
//   async bulkAdmission(studentsData: CreateStudentDto[]) {
//     const results = {
//       successful: [],
//       failed: [],
//     };

//     for (const studentData of studentsData) {
//       try {
//         const result = await this.create(studentData);
//         results.successful.push({
//           admissionNumber: studentData.admissionNumber,
//           studentId: result.student.studentId,
//         });
//       } catch (error) {
//         results.failed.push({
//           admissionNumber: studentData.admissionNumber,
//           error: error.message,
//         });
//       }
//     }

//     return {
//       message: `Bulk admission completed: ${results.successful.length} successful, ${results.failed.length} failed`,
//       results,
//     };
//   }

//   // Keep your existing methods (findOne, findByStudentId, update, remove, getStatistics)
//   // They are already well implemented in your current code
//   // Add these methods to your existing StudentsService class:

// /**
//  * Get student by ID with full details
//  */
// async findOne(id: number) {
//   const student = await this.prisma.student.findUnique({
//     where: { id },
//     include: {
//       user: {
//         select: {
//           id: true,
//           username: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           phone: true,
//           isActive: true,
//           lastLogin: true,
//           createdAt: true,
//         },
//       },
//       class: {
//         include: {
//           session: true,
//           classTeacher: {
//             select: {
//               id: true,
//               firstName: true,
//               lastName: true,
//               email: true,
//               phone: true,
//             },
//           },
//         },
//       },
//       session: true,
//       attendances: {
//         take: 10,
//         orderBy: {
//           date: 'desc',
//         },
//       },
//       examResults: {
//         take: 5,
//         orderBy: {
//           createdAt: 'desc',
//         },
//         include: {
//           exam: {
//             select: {
//               name: true,
//               term: true,
//               academicYear: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   if (!student) {
//     throw new NotFoundException(`Student with ID ${id} not found`);
//   }

//   return {
//     data: student,
//   };
// }

// /**
//  * Get student by student ID (e.g., STU2024001)
//  */
// async findByStudentId(studentId: string) {
//   const student = await this.prisma.student.findUnique({
//     where: { studentId },
//     include: {
//       user: {
//         select: {
//           id: true,
//           username: true,
//           email: true,
//           firstName: true,
//           lastName: true,
//           isActive: true,
//         },
//       },
//       class: true,
//       session: true,
//     },
//   });

//   if (!student) {
//     throw new NotFoundException(`Student with ID ${studentId} not found`);
//   }

//   return {
//     data: student,
//   };
// }

// /**
//  * Update student information
//  */
// async update(id: number, updateStudentDto: UpdateStudentDto) {
//   this.logger.log(`Updating student ID: ${id}`);

//   // Check if student exists
//   const existingStudent = await this.prisma.student.findUnique({
//     where: { id },
//     include: { user: true },
//   });

//   if (!existingStudent) {
//     throw new NotFoundException(`Student with ID ${id} not found`);
//   }

//   // If changing class, validate and update strength
//   if (updateStudentDto.classId && updateStudentDto.classId !== existingStudent.classId) {
//     const newClass = await this.prisma.class.findUnique({
//       where: { id: updateStudentDto.classId },
//     });

//     if (!newClass) {
//       throw new NotFoundException('New class not found');
//     }

//     if (newClass.currentStrength >= newClass.capacity) {
//       throw new BadRequestException('New class capacity is full');
//     }
//   }

//   // Check for duplicate email if changing
//   if (updateStudentDto.email && updateStudentDto.email !== existingStudent.email) {
//     const duplicateEmail = await this.prisma.user.findFirst({
//       where: {
//         email: updateStudentDto.email,
//         id: { not: existingStudent.userId },
//       },
//     });

//     if (duplicateEmail) {
//       throw new ConflictException('Email already exists');
//     }
//   }

//   // Prepare update data
//   const updateData: any = { ...updateStudentDto };

//   // Handle date conversions
//   if (updateStudentDto.dateOfBirth) {
//     updateData.dateOfBirth = new Date(updateStudentDto.dateOfBirth);
//   }
//   if (updateStudentDto.tcDate) {
//     updateData.tcDate = new Date(updateStudentDto.tcDate);
//   }

//   // Handle decimal conversions
//   if (updateStudentDto.guardianIncome !== undefined) {
//     updateData.guardianIncome = updateStudentDto.guardianIncome ? 
//       parseFloat(updateStudentDto.guardianIncome.toString()) : null;
//   }
//   if (updateStudentDto.previousPercentage !== undefined) {
//     updateData.previousPercentage = updateStudentDto.previousPercentage ? 
//       parseFloat(updateStudentDto.previousPercentage.toString()) : null;
//   }

//   // Remove undefined values
//   Object.keys(updateData).forEach(key => {
//     if (updateData[key] === undefined) {
//       delete updateData[key];
//     }
//   });

//   // Update in transaction
//   const result = await this.prisma.$transaction(async (prisma) => {
//     // Update user account if email or personal info changed
//     if (updateStudentDto.email || updateStudentDto.firstName || updateStudentDto.lastName || updateStudentDto.phone) {
//       await prisma.user.update({
//         where: { id: existingStudent.userId },
//         data: {
//           ...(updateStudentDto.email && { email: updateStudentDto.email }),
//           ...(updateStudentDto.firstName && { firstName: updateStudentDto.firstName }),
//           ...(updateStudentDto.lastName && { lastName: updateStudentDto.lastName }),
//           ...(updateStudentDto.phone && { phone: updateStudentDto.phone }),
//         },
//       });
//     }

//     // Update student record
//     const student = await prisma.student.update({
//       where: { id },
//       data: updateData,
//       include: {
//         user: {
//           select: {
//             id: true,
//             username: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//           },
//         },
//         class: true,
//         session: true,
//       },
//     });

//     // Update class strengths if class changed
//     if (updateStudentDto.classId && updateStudentDto.classId !== existingStudent.classId) {
//       await prisma.class.update({
//         where: { id: existingStudent.classId },
//         data: { currentStrength: { decrement: 1 } },
//       });

//       await prisma.class.update({
//         where: { id: updateStudentDto.classId },
//         data: { currentStrength: { increment: 1 } },
//       });
//     }

//     return student;
//   });

//   this.logger.log(`Student updated successfully: ${id}`);

//   return {
//     message: 'Student updated successfully',
//     data: result,
//   };
// }

// /**
//  * Soft delete student (deactivate)
//  */
// async remove(id: number) {
//   const student = await this.prisma.student.findUnique({
//     where: { id },
//   });

//   if (!student) {
//     throw new NotFoundException(`Student with ID ${id} not found`);
//   }

//   await this.prisma.$transaction(async (prisma) => {
//     // Deactivate student
//     await prisma.student.update({
//       where: { id },
//       data: {
//         isActive: false,
//         status: 'Inactive',
//       },
//     });
    
//     // Deactivate user account
//     await prisma.user.update({
//       where: { id: student.userId },
//       data: { isActive: false },
//     });
    
//     // Decrease class strength
//     await prisma.class.update({
//       where: { id: student.classId },
//       data: { currentStrength: { decrement: 1 } },
//     });
//   });

//   this.logger.log(`Student deactivated: ${id}`);

//   return {
//     message: 'Student deactivated successfully',
//   };
// }

// /**
//  * Get student statistics
//  */
// async getStatistics() {
//   const [total, active, inactive, male, female, byClass] = await Promise.all([
//     this.prisma.student.count(),
//     this.prisma.student.count({ where: { status: 'Active' } }),
//     this.prisma.student.count({ where: { status: 'Inactive' } }),
//     this.prisma.student.count({ where: { gender: 'Male' } }),
//     this.prisma.student.count({ where: { gender: 'Female' } }),
//     this.prisma.student.groupBy({
//       by: ['classId'],
//       _count: true,
//     }),
//   ]);

//   return {
//     total,
//     active,
//     inactive,
//     male,
//     female,
//     byClass,
//   };
// }
// }

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentDto } from './dto/query-student.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Enhanced student creation with comprehensive validation
   */
  async create(createStudentDto: CreateStudentDto) {
    this.logger.log(`Creating new student: ${createStudentDto.admissionNumber}`);

    // Validate all required entities exist
    await this.validateAdmissionPrerequisites(createStudentDto);

    // Check for duplicates
    await this.checkForDuplicates(createStudentDto);

    // Generate unique student ID
    const studentId = await this.generateStudentId();

    // Hash password
    const passwordHash = await bcrypt.hash(createStudentDto.password, 12);

    // Get student role
    const studentRole = await this.prisma.role.findFirst({
      where: { name: 'Student' },
    });

    if (!studentRole) {
      throw new NotFoundException('Student role not configured in system');
    }

    // Create student with user account in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create user account
      const user = await prisma.user.create({
        data: {
          username: createStudentDto.username,
          email: createStudentDto.email,
          passwordHash,
          firstName: createStudentDto.firstName,
          lastName: createStudentDto.lastName,
          phone: createStudentDto.phone,
          roleId: studentRole.id,
          isActive: true,
        },
      });

      // Prepare student data
      const studentData = this.prepareStudentData(createStudentDto, studentId, user.id);

      // Create student record
      const student = await prisma.student.create({
        data: studentData,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          class: {
            include: {
              session: true,
              classTeacher: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          session: true,
        },
      });

      // Update class strength
      await prisma.class.update({
        where: { id: createStudentDto.classId },
        data: {
          currentStrength: {
            increment: 1,
          },
        },
      });

      // Create audit log for admission
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'CREATE',
          resource: 'STUDENT_ADMISSION',
          resourceId: student.id,
          details: {
            admissionNumber: createStudentDto.admissionNumber,
            studentId: student.studentId,
            classId: createStudentDto.classId,
            sessionId: createStudentDto.sessionId,
          },
        },
      });

      return student;
    });

    this.logger.log(`Student admission completed: ${result.studentId}`);

    return {
      message: 'Student admitted successfully',
      student: result,
      admissionDetails: {
        studentId: result.studentId,
        admissionNumber: result.admissionNumber,
        class: result.class.name,
        session: result.session.name,
      },
    };
  }

  /**
   * Validate all prerequisites for student admission
   */
  private async validateAdmissionPrerequisites(createStudentDto: CreateStudentDto) {
    // Validate class exists and has capacity
    const classExists = await this.prisma.class.findUnique({
      where: { id: createStudentDto.classId },
      include: { session: true },
    });

    if (!classExists) {
      throw new NotFoundException('Class not found');
    }

    if (classExists.currentStrength >= classExists.capacity) {
      throw new BadRequestException(`Class ${classExists.name} capacity is full (${classExists.currentStrength}/${classExists.capacity})`);
    }

    // Validate session exists and is active
    const sessionExists = await this.prisma.academicSession.findUnique({
      where: { id: createStudentDto.sessionId, isActive: true },
    });

    if (!sessionExists) {
      throw new NotFoundException('Academic session not found or inactive');
    }

    // Validate age requirements (basic check)
    const dob = new Date(createStudentDto.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    
    if (age < 3 || age > 25) {
      throw new BadRequestException('Student age must be between 3 and 25 years');
    }

    // Validate class and session match
    if (classExists.sessionId !== createStudentDto.sessionId) {
      throw new BadRequestException('Class does not belong to the selected academic session');
    }
  }

  /**
   * Check for duplicate records
   */
  private async checkForDuplicates(createStudentDto: CreateStudentDto) {
    // Check duplicate admission number
    const duplicateAdmission = await this.prisma.student.findUnique({
      where: { admissionNumber: createStudentDto.admissionNumber },
    });

    if (duplicateAdmission) {
      throw new ConflictException('Admission number already exists');
    }

    // Check duplicate username
    const duplicateUsername = await this.prisma.user.findUnique({
      where: { username: createStudentDto.username },
    });

    if (duplicateUsername) {
      throw new ConflictException('Username already exists');
    }

    // Check duplicate email
    const duplicateEmail = await this.prisma.user.findUnique({
      where: { email: createStudentDto.email },
    });

    if (duplicateEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check if roll number is unique in class
    if (createStudentDto.rollNumber) {
      const duplicateRoll = await this.prisma.student.findFirst({
        where: {
          classId: createStudentDto.classId,
          rollNumber: createStudentDto.rollNumber,
        },
      });

      if (duplicateRoll) {
        throw new ConflictException('Roll number already exists in this class');
      }
    }
  }

  /**
   * Prepare student data for creation
   */
  private prepareStudentData(createStudentDto: CreateStudentDto, studentId: string, userId: number) {
    return {
      studentId,
      userId,
      admissionNumber: createStudentDto.admissionNumber,
      admissionDate: createStudentDto.admissionDate ? new Date(createStudentDto.admissionDate) : new Date(),
      classId: createStudentDto.classId,
      sessionId: createStudentDto.sessionId,
      rollNumber: createStudentDto.rollNumber,
      
      // Personal Information
      firstName: createStudentDto.firstName,
      lastName: createStudentDto.lastName,
      dateOfBirth: new Date(createStudentDto.dateOfBirth),
      gender: createStudentDto.gender,
      bloodGroup: createStudentDto.healthInfo?.bloodGroup,
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
      guardianName: createStudentDto.guardian.name,
      guardianRelation: createStudentDto.guardian.relation,
      guardianPhone: createStudentDto.guardian.phone,
      guardianEmail: createStudentDto.guardian.email,
      guardianOccupation: createStudentDto.guardian.occupation,
      guardianIncome: createStudentDto.guardian.income ? 
        parseFloat(createStudentDto.guardian.income.toString()) : null,

      // Educational Background
      previousSchool: createStudentDto.educationalBackground?.previousSchool,
      previousClass: createStudentDto.educationalBackground?.previousClass,
      previousPercentage: createStudentDto.educationalBackground?.previousPercentage ? 
        parseFloat(createStudentDto.educationalBackground.previousPercentage.toString()) : null,
      tcNumber: createStudentDto.educationalBackground?.tcNumber,
      tcDate: createStudentDto.educationalBackground?.tcDate ? 
        new Date(createStudentDto.educationalBackground.tcDate) : null,

      // Health Information
      medicalConditions: createStudentDto.healthInfo?.medicalConditions,
      allergies: createStudentDto.healthInfo?.allergies,
      emergencyContact: createStudentDto.healthInfo?.emergencyContact,

      // Documents (would be handled by file upload service)
      photoUrl: createStudentDto.documents?.find(d => d.type === 'photo')?.fileUrl,
      birthCertificateUrl: createStudentDto.documents?.find(d => d.type === 'birth_certificate')?.fileUrl,
      tcUrl: createStudentDto.documents?.find(d => d.type === 'tc')?.fileUrl,
      aadharUrl: createStudentDto.documents?.find(d => d.type === 'aadhar')?.fileUrl,

      // Status
      status: createStudentDto.status || 'Active',
      isActive: createStudentDto.isActive !== undefined ? createStudentDto.isActive : true,
    };
  }

  /**
   * Generate unique student ID - Enhanced version
   */
  private async generateStudentId(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `STU${currentYear}`;

    // Get the last student ID for current year
    const lastStudent = await this.prisma.student.findFirst({
      where: {
        studentId: {
          startsWith: prefix,
        },
      },
      orderBy: {
        studentId: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastStudent) {
      const lastNumber = parseInt(lastStudent.studentId.replace(prefix, ''));
      nextNumber = lastNumber + 1;
    }

    // Pad with zeros (e.g., 001, 002, ...)
    const paddedNumber = nextNumber.toString().padStart(3, '0');
    return `${prefix}${paddedNumber}`;
  }

  /**
   * Enhanced student search with more filters
   */
  async findAll(query: QueryStudentDto) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      classId, 
      sessionId, 
      gender, 
      status, 
      grade, 
      section,
      admissionNumber,
      studentId 
    } = query;
    
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { studentId: { contains: search, mode: 'insensitive' } },
        { admissionNumber: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { guardianName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (classId) where.classId = classId;
    if (sessionId) where.sessionId = sessionId;
    if (gender) where.gender = gender;
    if (status) where.status = status;
    if (admissionNumber) where.admissionNumber = admissionNumber;
    if (studentId) where.studentId = studentId;

    if (grade || section) {
      where.class = {};
      if (grade) where.class.grade = grade;
      if (section) where.class.section = section;
    }

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              isActive: true,
              lastLogin: true,
            },
          },
          class: {
            select: {
              id: true,
              name: true,
              grade: true,
              section: true,
              academicYear: true,
              capacity: true,
              currentStrength: true,
              classTeacher: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          session: {
            select: {
              id: true,
              name: true,
              startDate: true,
              endDate: true,
              isActive: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      data: students,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get admission statistics
   */
  async getAdmissionStatistics(sessionId?: number) {
    const where: any = {};
    if (sessionId) {
      where.sessionId = sessionId;
    }

    const [
      totalAdmissions,
      activeStudents,
      byGender,
      byClass,
      byStatus,
      monthlyAdmissions
    ] = await Promise.all([
      this.prisma.student.count({ where }),
      this.prisma.student.count({ where: { ...where, status: 'Active' } }),
      this.prisma.student.groupBy({
        by: ['gender'],
        _count: true,
        where,
      }),
      this.prisma.student.groupBy({
        by: ['classId'],
        _count: true,
        where,
      }),
      this.prisma.student.groupBy({
        by: ['status'],
        _count: true,
        where,
      }),
      this.prisma.student.groupBy({
        by: ['admissionDate'],
        _count: true,
        where: {
          admissionDate: {
            gte: new Date(new Date().getFullYear(), 0, 1), // Current year
          },
        },
      }),
    ]);

    return {
      totalAdmissions,
      activeStudents,
      byGender,
      byClass,
      byStatus,
      monthlyAdmissions: monthlyAdmissions.map(ma => ({
        month: ma.admissionDate.toISOString().substring(0, 7),
        count: ma._count,
      })),
    };
  }

  /**
   * Bulk student admission (for CSV upload)
   */
  async bulkAdmission(studentsData: CreateStudentDto[]) {
    const results = {
      successful: [],
      failed: [],
    };

    for (const studentData of studentsData) {
      try {
        const result = await this.create(studentData);
        results.successful.push({
          admissionNumber: studentData.admissionNumber,
          studentId: result.student.studentId,
        });
      } catch (error) {
        results.failed.push({
          admissionNumber: studentData.admissionNumber,
          error: error.message,
        });
      }
    }

    return {
      message: `Bulk admission completed: ${results.successful.length} successful, ${results.failed.length} failed`,
      results,
    };
  }

  /**
   * Get student by ID with full details
   */
  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            isActive: true,
            lastLogin: true,
            createdAt: true,
          },
        },
        class: {
          include: {
            session: true,
            classTeacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        session: true,
        attendances: {
          take: 10,
          orderBy: {
            date: 'desc',
          },
        },
        examResults: {
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            exam: {
              select: {
                name: true,
                term: true,
                academicYear: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return {
      data: student,
    };
  }

  /**
   * Get student by student ID (e.g., STU2024001)
   */
  async findByStudentId(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { studentId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
          },
        },
        class: true,
        session: true,
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    return {
      data: student,
    };
  }

  /**
   * Update student information - CORRECTED VERSION
   */
  async update(id: number, updateStudentDto: UpdateStudentDto) {
    this.logger.log(`Updating student ID: ${id}`);

    // Check if student exists
    const existingStudent = await this.prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingStudent) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    // If changing class, validate and update strength
    if (updateStudentDto.classId && updateStudentDto.classId !== existingStudent.classId) {
      const newClass = await this.prisma.class.findUnique({
        where: { id: updateStudentDto.classId },
      });

      if (!newClass) {
        throw new NotFoundException('New class not found');
      }

      if (newClass.currentStrength >= newClass.capacity) {
        throw new BadRequestException('New class capacity is full');
      }
    }

    // Check for duplicate email if changing
    if (updateStudentDto.email && updateStudentDto.email !== existingStudent.email) {
      const duplicateEmail = await this.prisma.user.findFirst({
        where: {
          email: updateStudentDto.email,
          id: { not: existingStudent.userId },
        },
      });

      if (duplicateEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // Prepare update data - handle nested objects properly
    const updateData: any = {};

    // Handle direct properties
    if (updateStudentDto.firstName !== undefined) updateData.firstName = updateStudentDto.firstName;
    if (updateStudentDto.lastName !== undefined) updateData.lastName = updateStudentDto.lastName;
    if (updateStudentDto.gender !== undefined) updateData.gender = updateStudentDto.gender;
    if (updateStudentDto.phone !== undefined) updateData.phone = updateStudentDto.phone;
    if (updateStudentDto.address !== undefined) updateData.address = updateStudentDto.address;
    if (updateStudentDto.city !== undefined) updateData.city = updateStudentDto.city;
    if (updateStudentDto.state !== undefined) updateData.state = updateStudentDto.state;
    if (updateStudentDto.pincode !== undefined) updateData.pincode = updateStudentDto.pincode;
    if (updateStudentDto.classId !== undefined) updateData.classId = updateStudentDto.classId;
    if (updateStudentDto.rollNumber !== undefined) updateData.rollNumber = updateStudentDto.rollNumber;
    if (updateStudentDto.status !== undefined) updateData.status = updateStudentDto.status;
    if (updateStudentDto.isActive !== undefined) updateData.isActive = updateStudentDto.isActive;
    if (updateStudentDto.nationality !== undefined) updateData.nationality = updateStudentDto.nationality;
    if (updateStudentDto.religion !== undefined) updateData.religion = updateStudentDto.religion;
    if (updateStudentDto.category !== undefined) updateData.category = updateStudentDto.category;

    // Handle dates
    if (updateStudentDto.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateStudentDto.dateOfBirth);
    }

    // Handle guardian information
    if (updateStudentDto.guardian) {
      if (updateStudentDto.guardian.name !== undefined) updateData.guardianName = updateStudentDto.guardian.name;
      if (updateStudentDto.guardian.relation !== undefined) updateData.guardianRelation = updateStudentDto.guardian.relation;
      if (updateStudentDto.guardian.phone !== undefined) updateData.guardianPhone = updateStudentDto.guardian.phone;
      if (updateStudentDto.guardian.email !== undefined) updateData.guardianEmail = updateStudentDto.guardian.email;
      if (updateStudentDto.guardian.occupation !== undefined) updateData.guardianOccupation = updateStudentDto.guardian.occupation;
      if (updateStudentDto.guardian.income !== undefined) updateData.guardianIncome = updateStudentDto.guardian.income;
      if (updateStudentDto.guardian.address !== undefined) updateData.guardianAddress = updateStudentDto.guardian.address;
    }

    // Handle educational background
    if (updateStudentDto.educationalBackground) {
      if (updateStudentDto.educationalBackground.previousSchool !== undefined) updateData.previousSchool = updateStudentDto.educationalBackground.previousSchool;
      if (updateStudentDto.educationalBackground.previousClass !== undefined) updateData.previousClass = updateStudentDto.educationalBackground.previousClass;
      if (updateStudentDto.educationalBackground.previousPercentage !== undefined) updateData.previousPercentage = updateStudentDto.educationalBackground.previousPercentage;
      if (updateStudentDto.educationalBackground.tcNumber !== undefined) updateData.tcNumber = updateStudentDto.educationalBackground.tcNumber;
      if (updateStudentDto.educationalBackground.tcDate) updateData.tcDate = new Date(updateStudentDto.educationalBackground.tcDate);
    }

    // Handle health information
    if (updateStudentDto.healthInfo) {
      if (updateStudentDto.healthInfo.medicalConditions !== undefined) updateData.medicalConditions = updateStudentDto.healthInfo.medicalConditions;
      if (updateStudentDto.healthInfo.allergies !== undefined) updateData.allergies = updateStudentDto.healthInfo.allergies;
      if (updateStudentDto.healthInfo.emergencyContact !== undefined) updateData.emergencyContact = updateStudentDto.healthInfo.emergencyContact;
      if (updateStudentDto.healthInfo.bloodGroup !== undefined) updateData.bloodGroup = updateStudentDto.healthInfo.bloodGroup;
    }

    // Remove undefined values to avoid overwriting with null
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // If no data to update, return early
    if (Object.keys(updateData).length === 0) {
      return {
        message: 'No changes detected',
        data: existingStudent,
      };
    }

    // Update in transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Update user account if email or personal info changed
      const userUpdateData: any = {};
      if (updateStudentDto.email !== undefined) userUpdateData.email = updateStudentDto.email;
      if (updateStudentDto.firstName !== undefined) userUpdateData.firstName = updateStudentDto.firstName;
      if (updateStudentDto.lastName !== undefined) userUpdateData.lastName = updateStudentDto.lastName;
      if (updateStudentDto.phone !== undefined) userUpdateData.phone = updateStudentDto.phone;

      if (Object.keys(userUpdateData).length > 0) {
        await prisma.user.update({
          where: { id: existingStudent.userId },
          data: userUpdateData,
        });
      }

      // Update student record
      const student = await prisma.student.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          class: true,
          session: true,
        },
      });

      // Update class strengths if class changed
      if (updateStudentDto.classId && updateStudentDto.classId !== existingStudent.classId) {
        await prisma.class.update({
          where: { id: existingStudent.classId },
          data: { currentStrength: { decrement: 1 } },
        });

        await prisma.class.update({
          where: { id: updateStudentDto.classId },
          data: { currentStrength: { increment: 1 } },
        });
      }

      // Create audit log for update
      await prisma.auditLog.create({
        data: {
          userId: existingStudent.userId,
          action: 'UPDATE',
          resource: 'STUDENT',
          resourceId: student.id,
          details: {
            updatedFields: Object.keys(updateData),
            previousClass: existingStudent.classId,
            newClass: updateStudentDto.classId,
          },
        },
      });

      return student;
    });

    this.logger.log(`Student updated successfully: ${id}`);

    return {
      message: 'Student updated successfully',
      data: result,
    };
  }

  /**
   * Soft delete student (deactivate)
   */
  async remove(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    await this.prisma.$transaction(async (prisma) => {
      // Deactivate student
      await prisma.student.update({
        where: { id },
        data: {
          isActive: false,
          status: 'Inactive',
        },
      });
      
      // Deactivate user account
      await prisma.user.update({
        where: { id: student.userId },
        data: { isActive: false },
      });
      
      // Decrease class strength
      await prisma.class.update({
        where: { id: student.classId },
        data: { currentStrength: { decrement: 1 } },
      });

      // Create audit log for deletion
      await prisma.auditLog.create({
        data: {
          userId: student.userId,
          action: 'DELETE',
          resource: 'STUDENT',
          resourceId: student.id,
          details: {
            studentId: student.studentId,
            admissionNumber: student.admissionNumber,
          },
        },
      });
    });

    this.logger.log(`Student deactivated: ${id}`);

    return {
      message: 'Student deactivated successfully',
    };
  }

  /**
   * Get student statistics
   */
  async getStatistics() {
    const [total, active, inactive, male, female, byClass] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.student.count({ where: { status: 'Active' } }),
      this.prisma.student.count({ where: { status: 'Inactive' } }),
      this.prisma.student.count({ where: { gender: 'Male' } }),
      this.prisma.student.count({ where: { gender: 'Female' } }),
      this.prisma.student.groupBy({
        by: ['classId'],
        _count: true,
      }),
    ]);

    return {
      total,
      active,
      inactive,
      male,
      female,
      byClass,
    };
  }
}