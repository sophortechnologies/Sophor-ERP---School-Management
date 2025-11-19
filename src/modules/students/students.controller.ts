// // // import {
// // //   Controller,
// // //   Get,
// // //   Post,
// // //   Body,
// // //   Patch,
// // //   Param,
// // //   Delete,
// // //   Query,
// // //   UseGuards,
// // //   ParseIntPipe,
// // //   HttpCode,
// // //   HttpStatus,
// // // } from '@nestjs/common';

// // // import {
// // //   ApiTags,
// // //   ApiOperation,
// // //   ApiResponse,
// // //   ApiBearerAuth,
// // //   ApiQuery,
// // // } from '@nestjs/swagger';
// // // import { StudentsService } from './students.service';
// // // import { CreateStudentDto } from './dto/create-student.dto';
// // // import { UpdateStudentDto } from './dto/update-student.dto';
// // // import { QueryStudentDto } from './dto/query-student.dto';
// // // import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// // // @ApiTags('Students')
// // // @Controller('students')
// // // @UseGuards(JwtAuthGuard)
// // // @ApiBearerAuth()
// // // export class StudentsController {
// // //   constructor(private readonly studentsService: StudentsService) {}

// // //   @Post()
// // //   @ApiOperation({
// // //     summary: 'Register new student',
// // //     description: 'Create a new student admission record with user account. Auto-generates student ID and validates class capacity.',
// // //   })
// // //   @ApiResponse({
// // //     status: 201,
// // //     description: 'Student registered successfully',
// // //     schema: {
// // //       example: {
// // //         message: 'Student registered successfully',
// // //         student: {
// // //           id: 1,
// // //           studentId: 'STU2024001',
// // //           admissionNumber: 'ADM2024001',
// // //           firstName: 'John',
// // //           lastName: 'Doe',
// // //           class: {
// // //             id: 1,
// // //             name: 'Grade 10-A',
// // //           },
// // //           user: {
// // //             id: 5,
// // //             username: 'john_student',
// // //             email: 'john.student@school.edu',
// // //           },
// // //         },
// // //       },
// // //     },
// // //   })
// // //   @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
// // //   @ApiResponse({ status: 409, description: 'Conflict - Duplicate admission number/email/username' })
// // //   create(@Body() createStudentDto: CreateStudentDto) {
// // //     return this.studentsService.create(createStudentDto);
// // //   }

// // //   @Get()
// // //   @ApiOperation({
// // //     summary: 'Get all students (Paginated)',
// // //     description: 'Retrieve paginated list of students with advanced filtering options',
// // //   })
// // //   @ApiResponse({
// // //     status: 200,
// // //     description: 'Students retrieved successfully',
// // //     schema: {
// // //       example: {
// // //         data: [
// // //           {
// // //             id: 1,
// // //             studentId: 'STU2024001',
// // //             admissionNumber: 'ADM2024001',
// // //             firstName: 'John',
// // //             lastName: 'Doe',
// // //             class: {
// // //               name: 'Grade 10-A',
// // //               grade: 10,
// // //               section: 'A',
// // //             },
// // //           },
// // //         ],
// // //         meta: {
// // //           total: 50,
// // //           page: 1,
// // //           limit: 10,
// // //           totalPages: 5,
// // //         },
// // //       },
// // //     },
// // //   })
// // //   findAll(@Query() query: QueryStudentDto) {
// // //     return this.studentsService.findAll(query);
// // //   }

// // //   @Get('statistics')
// // //   @ApiOperation({
// // //     summary: 'Get student statistics',
// // //     description: 'Retrieve statistical data about students (total, active, gender distribution, etc.)',
// // //   })
// // //   @ApiResponse({
// // //     status: 200,
// // //     description: 'Statistics retrieved successfully',
// // //   })
// // //   getStatistics() {
// // //     return this.studentsService.getStatistics();
// // //   }

// // //   @Get('student-id/:studentId')
// // //   @ApiOperation({
// // //     summary: 'Get student by Student ID',
// // //     description: 'Retrieve student details using student ID (e.g., STU2024001)',
// // //   })
// // //   @ApiResponse({
// // //     status: 200,
// // //     description: 'Student found',
// // //   })
// // //   @ApiResponse({ status: 404, description: 'Student not found' })
// // //   findByStudentId(@Param('studentId') studentId: string) {
// // //     return this.studentsService.findByStudentId(studentId);
// // //   }

// // //   @Get(':id')
// // //   @ApiOperation({
// // //     summary: 'Get student by ID',
// // //     description: 'Retrieve complete student details including attendance and exam results',
// // //   })
// // //   @ApiResponse({
// // //     status: 200,
// // //     description: 'Student details retrieved successfully',
// // //     schema: {
// // //       example: {
// // //         data: {
// // //           id: 1,
// // //           studentId: 'STU2024001',
// // //           admissionNumber: 'ADM2024001',
// // //           firstName: 'John',
// // //           lastName: 'Doe',
// // //           dateOfBirth: '2010-05-15',
// // //           gender: 'Male',
// // //           class: {
// // //             name: 'Grade 10-A',
// // //             grade: 10,
// // //             section: 'A',
// // //           },
// // //           guardianName: 'Michael Doe',
// // //           guardianPhone: '+251911111111',
// // //           status: 'Active',
// // //         },
// // //       },
// // //     },
// // //   })
// // //   @ApiResponse({ status: 404, description: 'Student not found' })
// // //   findOne(@Param('id', ParseIntPipe) id: number) {
// // //     return this.studentsService.findOne(id);
// // //   }

// // //   @Patch(':id')
// // //   @ApiOperation({
// // //     summary: 'Update student information',
// // //     description: 'Update student personal, contact, guardian, and academic information',
// // //   })
// // //   @ApiResponse({
// // //     status: 200,
// // //     description: 'Student updated successfully',
// // //   })
// // //   @ApiResponse({ status: 404, description: 'Student not found' })
// // //   @ApiResponse({ status: 409, description: 'Conflict - Duplicate email' })
// // //   update(
// // //     @Param('id', ParseIntPipe) id: number,
// // //     @Body() updateStudentDto: UpdateStudentDto,
// // //   ) {
// // //     return this.studentsService.update(id, updateStudentDto);
// // //   }

// // //   @Delete(':id')
// // //   @HttpCode(HttpStatus.OK)
// // //   @ApiOperation({
// // //     summary: 'Deactivate student',
// // //     description: 'Soft delete - deactivates student and their user account. Updates class strength.',
// // //   })
// // //   @ApiResponse({
// // //     status: 200,
// // //     description: 'Student deactivated successfully',
// // //   })
// // //   @ApiResponse({ status: 404, description: 'Student not found' })
// // //   remove(@Param('id', ParseIntPipe) id: number) {
// // //     return this.studentsService.remove(id);
// // //   }
// // // }
// // import {
// //   Controller,
// //   Get,
// //   Post,
// //   Body,
// //   Patch,
// //   Param,
// //   Delete,
// //   Query,
// //   UseGuards,
// //   HttpStatus,
// //   HttpCode,
// //   UseInterceptors,
// //   UploadedFile,
// // } from '@nestjs/common';
// // import { FileInterceptor } from '@nestjs/platform-express';
// // import {
// //   ApiTags,
// //   ApiOperation,
// //   ApiResponse,
// //   ApiBearerAuth,
// //   ApiConsumes,
// // } from '@nestjs/swagger';

// // import { StudentsService } from './students.service';
// // import { CreateStudentDto } from './dto/create-student.dto';
// // import { UpdateStudentDto } from './dto/update-student.dto';
// // import { QueryStudentDto } from './dto/query-student.dto';
// // import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// // import { RolesGuard } from '../../common/guards/roles.guard';
// // import { Roles } from '../../common/decorators/roles.decorator';

// // @ApiTags('students')
// // @ApiBearerAuth()
// // @Controller('students')
// // @UseGuards(JwtAuthGuard, RolesGuard)
// // export class StudentsController {
// //   constructor(private readonly studentsService: StudentsService) {}

// //   @Post('admission')
// //   @Roles('Admin', 'Registrar')
// //   @ApiOperation({ summary: 'Admit new student' })
// //   @ApiResponse({ status: 201, description: 'Student admitted successfully' })
// //   @ApiResponse({ status: 400, description: 'Invalid input data' })
// //   @ApiResponse({ status: 409, description: 'Duplicate admission data' })
// //   async create(@Body() createStudentDto: CreateStudentDto) {
// //     return this.studentsService.create(createStudentDto);
// //   }

// //   @Post('bulk-admission')
// //   @Roles('Admin', 'Registrar')
// //   @UseInterceptors(FileInterceptor('file'))
// //   @ApiConsumes('multipart/form-data')
// //   @ApiOperation({ summary: 'Bulk student admission via CSV' })
// //   async bulkAdmission(@UploadedFile() file: Express.Multer.File) {
// //     // This would parse CSV and call bulkAdmission service method
// //     // Implementation depends on your CSV parsing library
// //     return { message: 'Bulk admission endpoint - implement CSV parsing' };
// //   }

// //   @Get()
// //   @Roles('Admin', 'Teacher', 'Registrar')
// //   @ApiOperation({ summary: 'Get all students with filters' })
// //   async findAll(@Query() query: QueryStudentDto) {
// //     return this.studentsService.findAll(query);
// //   }

// //   @Get('statistics/admission')
// //   @Roles('Admin', 'Registrar')
// //   @ApiOperation({ summary: 'Get admission statistics' })
// //   async getAdmissionStatistics(@Query('sessionId') sessionId?: number) {
// //     return this.studentsService.getAdmissionStatistics(sessionId);
// //   }

// //   @Get(':id')
// //   @Roles('Admin', 'Teacher', 'Registrar', 'Student')
// //   @ApiOperation({ summary: 'Get student by ID' })
// //   async findOne(@Param('id') id: string) {
// //     return this.studentsService.findOne(+id);
// //   }

// //   @Get('student-id/:studentId')
// //   @Roles('Admin', 'Teacher', 'Registrar', 'Student')
// //   @ApiOperation({ summary: 'Get student by student ID' })
// //   async findByStudentId(@Param('studentId') studentId: string) {
// //     return this.studentsService.findByStudentId(studentId);
// //   }

// //   @Get('admission-number/:admissionNumber')
// //   @Roles('Admin', 'Registrar')
// //   @ApiOperation({ summary: 'Get student by admission number' })
// //   async findByAdmissionNumber(@Param('admissionNumber') admissionNumber: string) {
// //     // You would implement this method in service
// //     return { message: 'Find by admission number endpoint' };
// //   }

// //   @Patch(':id')
// //   @Roles('Admin', 'Registrar')
// //   @ApiOperation({ summary: 'Update student information' })
// //   async update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
// //     return this.studentsService.update(+id, updateStudentDto);
// //   }

// //   @Delete(':id')
// //   @Roles('Admin')
// //   @HttpCode(HttpStatus.NO_CONTENT)
// //   @ApiOperation({ summary: 'Delete student (soft delete)' })
// //   async remove(@Param('id') id: string) {
// //     return this.studentsService.remove(+id);
// //   }

// //   @Get('statistics/overview')
// //   @Roles('Admin', 'Registrar')
// //   @ApiOperation({ summary: 'Get student overview statistics' })
// //   async getStatistics() {
// //     return this.studentsService.getStatistics();
// //   }
// // }
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
//   HttpStatus,
//   HttpCode,
//   UseInterceptors,
//   UploadedFile,
// } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import {
//   ApiTags,
//   ApiOperation,
//   ApiResponse,
//   ApiBearerAuth,
//   ApiConsumes,
// } from '@nestjs/swagger';

// import { StudentsService } from './students.service';
// import { CreateStudentDto } from './dto/create-student.dto';
// import { UpdateStudentDto } from './dto/update-student.dto';
// import { QueryStudentDto } from './dto/query-student.dto';
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../../common/guards/roles.guard';
// import { Roles } from '../../common/decorators/roles.decorator';

// // Remove the problematic Multer import and fix the bulkAdmission method
// @ApiTags('students')
// @ApiBearerAuth()
// @Controller('students')
// @UseGuards(JwtAuthGuard, RolesGuard)
// export class StudentsController {
//   constructor(private readonly studentsService: StudentsService) {}

//   @Post('admission')
//   @Roles('Admin', 'Registrar')
//   @ApiOperation({ summary: 'Admit new student' })
//   @ApiResponse({ status: 201, description: 'Student admitted successfully' })
//   @ApiResponse({ status: 400, description: 'Invalid input data' })
//   @ApiResponse({ status: 409, description: 'Duplicate admission data' })
//   async create(@Body() createStudentDto: CreateStudentDto) {
//     return this.studentsService.create(createStudentDto);
//   }

//   @Post('bulk-admission')
//   @Roles('Admin', 'Registrar')
//   @UseInterceptors(FileInterceptor('file'))
//   @ApiConsumes('multipart/form-data')
//   @ApiOperation({ summary: 'Bulk student admission via CSV' })
//   async bulkAdmission(@UploadedFile() file: Express.Multer.File) {
//     // For now, return a simple response until CSV parsing is implemented
//     return { 
//       message: 'Bulk admission endpoint - CSV parsing to be implemented',
//       fileName: file?.originalname,
//       fileSize: file?.size 
//     };
//   }

//   @Get()
//   @Roles('Admin', 'Teacher', 'Registrar')
//   @ApiOperation({ summary: 'Get all students with filters' })
//   async findAll(@Query() query: QueryStudentDto) {
//     return this.studentsService.findAll(query);
//   }

//   @Get('statistics/admission')
//   @Roles('Admin', 'Registrar')
//   @ApiOperation({ summary: 'Get admission statistics' })
//   async getAdmissionStatistics(@Query('sessionId') sessionId?: number) {
//     return this.studentsService.getAdmissionStatistics(sessionId);
//   }

//   @Get(':id')
//   @Roles('Admin', 'Teacher', 'Registrar', 'Student')
//   @ApiOperation({ summary: 'Get student by ID' })
//   async findOne(@Param('id') id: string) {
//     return this.studentsService.findOne(+id);
//   }

//   @Get('student-id/:studentId')
//   @Roles('Admin', 'Teacher', 'Registrar', 'Student')
//   @ApiOperation({ summary: 'Get student by student ID' })
//   async findByStudentId(@Param('studentId') studentId: string) {
//     return this.studentsService.findByStudentId(studentId);
//   }

//   @Get('admission-number/:admissionNumber')
//   @Roles('Admin', 'Registrar')
//   @ApiOperation({ summary: 'Get student by admission number' })
//   async findByAdmissionNumber(@Param('admissionNumber') admissionNumber: string) {
//     const student = await this.prisma.student.findUnique({
//       where: { admissionNumber },
//       include: {
//         user: true,
//         class: true,
//         session: true,
//       },
//     });

//     if (!student) {
//       throw new NotFoundException('Student not found with this admission number');
//     }

//     return { data: student };
//   }

//   @Patch(':id')
//   @Roles('Admin', 'Registrar')
//   @ApiOperation({ summary: 'Update student information' })
//   async update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
//     return this.studentsService.update(+id, updateStudentDto);
//   }

//   @Delete(':id')
//   @Roles('Admin')
//   @HttpCode(HttpStatus.NO_CONTENT)
//   @ApiOperation({ summary: 'Delete student (soft delete)' })
//   async remove(@Param('id') id: string) {
//     return this.studentsService.remove(+id);
//   }

//   @Get('statistics/overview')
//   @Roles('Admin', 'Registrar')
//   @ApiOperation({ summary: 'Get student overview statistics' })
//   async getStatistics() {
//     return this.studentsService.getStatistics();
//   }
// }

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  NotFoundException, // Add this import
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentDto } from './dto/query-student.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PrismaService } from '../../database/prisma.service'; // Add this import

@ApiTags('students')
@ApiBearerAuth()
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly prisma: PrismaService, // Inject PrismaService
  ) {}

  @Post('admission')
  @Roles('Admin', 'Registrar')
  @ApiOperation({ summary: 'Admit new student' })
  @ApiResponse({ status: 201, description: 'Student admitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Duplicate admission data' })
  async create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Post('bulk-admission')
  @Roles('Admin', 'Registrar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Bulk student admission via CSV' })
  async bulkAdmission(@UploadedFile() file: Express.Multer.File) {
    // For now, return a simple response until CSV parsing is implemented
    return { 
      message: 'Bulk admission endpoint - CSV parsing to be implemented',
      fileName: file?.originalname,
      fileSize: file?.size 
    };
  }

  @Get()
  @Roles('Admin', 'Teacher', 'Registrar')
  @ApiOperation({ summary: 'Get all students with filters' })
  async findAll(@Query() query: QueryStudentDto) {
    return this.studentsService.findAll(query);
  }

  @Get('statistics/admission')
  @Roles('Admin', 'Registrar')
  @ApiOperation({ summary: 'Get admission statistics' })
  async getAdmissionStatistics(@Query('sessionId') sessionId?: number) {
    return this.studentsService.getAdmissionStatistics(sessionId);
  }

  @Get(':id')
  @Roles('Admin', 'Teacher', 'Registrar', 'Student')
  @ApiOperation({ summary: 'Get student by ID' })
  async findOne(@Param('id') id: string) {
    return this.studentsService.findOne(+id);
  }

  @Get('student-id/:studentId')
  @Roles('Admin', 'Teacher', 'Registrar', 'Student')
  @ApiOperation({ summary: 'Get student by student ID' })
  async findByStudentId(@Param('studentId') studentId: string) {
    return this.studentsService.findByStudentId(studentId);
  }

  @Get('admission-number/:admissionNumber')
  @Roles('Admin', 'Registrar')
  @ApiOperation({ summary: 'Get student by admission number' })
  async findByAdmissionNumber(@Param('admissionNumber') admissionNumber: string) {
    const student = await this.prisma.student.findUnique({
      where: { admissionNumber },
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

    if (!student) {
      throw new NotFoundException('Student not found with this admission number');
    }

    return { data: student };
  }

  @Patch(':id')
  @Roles('Admin', 'Registrar')
  @ApiOperation({ summary: 'Update student information' })
  async update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(+id, updateStudentDto);
  }

  @Delete(':id')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete student (soft delete)' })
  async remove(@Param('id') id: string) {
    return this.studentsService.remove(+id);
  }

  @Get('statistics/overview')
  @Roles('Admin', 'Registrar')
  @ApiOperation({ summary: 'Get student overview statistics' })
  async getStatistics() {
    return this.studentsService.getStatistics();
  }
}