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
//   UseInterceptors,
//   UploadedFile,
//   ParseFilePipe,
//   MaxFileSizeValidator,
//   FileTypeValidator,
//   ParseIntPipe,
//   HttpStatus,
//   Req,
//   BadRequestException
// } from '@nestjs/common';
// import { diskStorage } from 'multer';
// import { extname } from 'path';
// import { StudentLoginDto } from './dto/student-login.dto';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { UploadDocumentDto } from './dto/document-upload.dto';
// import {
//   ApiTags, 
//   ApiOperation, 
//   ApiResponse, 
//   ApiBearerAuth, 
//   ApiConsumes,
//   ApiQuery,
//   ApiBody 
// } from '@nestjs/swagger';
// import { Request } from 'express';
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../../common/guards/roles.guard';
// import { Roles } from '../../common/decorators/roles.decorator';
// import { CurrentUser } from '../../common/decorators/current-user.decorator';
// import { StudentService } from './students.service';
// import { 
//   CreateStudentDto, 
//   UpdateStudentDto, 
//   DocumentUploadDto, 
//   StudentQueryDto,
//   // AssignClassDto,
//   UpdateStatusDto,
//   BulkAdmissionDto 
// } from './dto/create-student.dto';
// import { AssignClassDto } from './dto/assign-class.dto';
// @ApiTags('Students')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Controller('students')
// export class StudentController {
//   constructor(private readonly studentService: StudentService) {}

//   @Post()
//   @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
//   @ApiOperation({ summary: 'Create new student admission' })
//   @ApiResponse({ status: 201, description: 'Student admission created successfully' })
//   @ApiResponse({ status: 400, description: 'Invalid input data or validation failed' })
//   @ApiResponse({ status: 409, description: 'Duplicate student record detected' })
//   async create(
//     @Body() createStudentDto: CreateStudentDto,
//     @CurrentUser() user: any,
//   ) {
//     return this.studentService.createStudent(createStudentDto, user.id);
//   }

//   @Post('bulk')
//   @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
//   @ApiOperation({ summary: 'Bulk create student admissions' })
//   @ApiResponse({ status: 201, description: 'Bulk admissions created successfully' })
//   async bulkCreate(
//     @Body() bulkAdmissionDto: BulkAdmissionDto,
//     @CurrentUser() user: any,
//   ) {
//     return this.studentService.bulkCreateStudents(bulkAdmissionDto.students, user.id);
//   }

// @Get()
// @Roles('SUPER_ADMIN', 'ADMIN')

// async findAll(
//   @Query() query: StudentQueryDto,
//   @Req() req,
// ) {
//   const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
//   return this.studentService.findAll(query, baseUrl);
// }


//   @Get('statistics')
//   @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
//   @ApiOperation({ summary: 'Get admission statistics and analytics' })
//   async getAdmissionStatistics() {
//     return this.studentService.getAdmissionStatistics();
//   }

//   @Get('search')
//   @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
//   @ApiOperation({ summary: 'Search students by name, ID, or email' })
//   @ApiQuery({ name: 'q', required: true, description: 'Search query' })
//   async searchStudents(@Query('q') query: string) {
//     return this.studentService.searchStudents(query);
//   }

//   @Get(':id')
//   @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
//   @ApiOperation({ summary: 'Get student admission by ID' })
//   @ApiResponse({ status: 200, description: 'Student admission found' })
//   @ApiResponse({ status: 404, description: 'Student admission not found' })
//   async findOne(@Param('id', ParseIntPipe) id: number) {
//     return this.studentService.findOne(id);
//   }

//   @Patch(':id')
//   @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
//   @ApiOperation({ summary: 'Update student admission' })
//   @ApiResponse({ status: 200, description: 'Student admission updated' })
//   @ApiResponse({ status: 404, description: 'Student admission not found' })
//   async update(
//     @Param('id', ParseIntPipe) id: number,
//     @Body() updateStudentDto: UpdateStudentDto,
//     @CurrentUser() user: any,
//   ) {
//     return this.studentService.updateStudent(id, updateStudentDto, user.id);
//   }

//   @Post(':id/documents')
//   @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
//   @ApiOperation({ summary: 'Upload student document' })
//   @ApiConsumes('multipart/form-data')
//   @UseInterceptors(FileInterceptor('file'))
//   @ApiBody({ type: DocumentUploadDto })
//   async uploadDocument(
//     @Param('id', ParseIntPipe) studentId: number,
//     @UploadedFile(
//       new ParseFilePipe({
//         validators: [
//           new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB - FR1.5
//           new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf|doc|docx)$/ }),
//         ],
//       }),
//     ) file: Express.Multer.File,
//     @Body() body: DocumentUploadDto,
//     @CurrentUser() user: any,
//   ) {
//     return this.studentService.uploadDocument(
//       studentId, 
//       file, 
//       body.documentType, 
//       body.description, 
//       user.id
//     );
//   }

//   @Get(':id/documents')
//   @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
//   @ApiOperation({ summary: 'Get all documents for a student' })
//   async getDocuments(@Param('id', ParseIntPipe) studentId: number) {
//     return this.studentService.getStudentDocuments(studentId);
//   }


//   @Get(':id/admission-form')
//   @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
//   @ApiOperation({ summary: 'Generate admission form ' })
//   async generateAdmissionForm(@Param('id', ParseIntPipe) studentId: number) {
//     return this.studentService.generateAdmissionForm(studentId);
//   }

//   @Get(':id/confirmation-receipt')
//   @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
//   @ApiOperation({ summary: 'Generate confirmation receipt' })
//   async generateConfirmationReceipt(@Param('id', ParseIntPipe) studentId: number) {
//     return this.studentService.generateConfirmationReceipt(studentId);
//   }

//   @Get(':id/admission-history')
//   @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
//   @ApiOperation({ summary: 'Get admission history and audit logs' })
//   async getAdmissionHistory(@Param('id', ParseIntPipe) studentId: number) {
//     return this.studentService.getAdmissionHistory(studentId);
//   }

//   @Delete(':id')
//   @Roles('SUPER_ADMIN', 'ADMIN')
//   @ApiOperation({ summary: 'Delete student admission' })
//   @ApiResponse({ status: 200, description: 'Student admission deleted' })
//   @ApiResponse({ status: 404, description: 'Student admission not found' })
//   async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
//     return this.studentService.softDeleteStudent(id, user.id);
//   }

//   @Patch(':id/restore')
//   @Roles('SUPER_ADMIN', 'ADMIN')
//   @ApiOperation({ summary: 'Restore soft-deleted student admission' })
//   async restoreStudent(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
//     return this.studentService.restoreStudent(id, user.id);
//   }


// @Patch(':studentId/assign-class')
// @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
// async assignClass(
//   @Param('studentId', ParseIntPipe) studentId: number,
//   @Body() dto: AssignClassDto,
//   @CurrentUser() user: any,
// ) {
//   return this.studentService.assignClass(
//     studentId,
//     dto.classId,
//     dto.section ?? null,
//     dto.remarks ?? null,
//     user.id,
//   );
// }

// @Post(':id/documents')
// @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
// @UseInterceptors(
//   FileInterceptor('file', {
//     storage: diskStorage({
//       destination: './uploads/student-documents',
//       filename: (_req, file, cb) => {
//         const unique =
//           Date.now() + '-' + Math.round(Math.random() * 1e9);
//         cb(null, unique + extname(file.originalname));
//       },
//     }),
//     limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
//     fileFilter: (_req, file, cb) => {
//       const allowed = [
//         'image/jpeg',
//         'image/png',
//         'application/pdf',
//       ];
//       if (!allowed.includes(file.mimetype)) {
//         return cb(
//           new BadRequestException('Only JPG, PNG, PDF allowed'),
//           false,
//         );
//       }
//       cb(null, true);
//     },
//   }),
// )
// @ApiConsumes('multipart/form-data')
// async uploadStudentDocument(
//   @Param('id', ParseIntPipe) studentId: number,
//   @UploadedFile() file: Express.Multer.File,
//   @Body() dto: UploadDocumentDto,
//   @CurrentUser() user: any,
// ) {
//   return this.studentService.uploadStudentDocument(
//     studentId,
//     file,
//     dto,
//     user.id,
//   );
// }


//   @Get(':id/dashboard')
//   @UseGuards(JwtAuthGuard) // require auth - optional: add RolesGuard if necessary
//   async studentDashboard(@Param('id') id: string) {
//     const studentId = Number(id);
//     return this.studentService.getDashboard(studentId);
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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

import { StudentService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentQueryDto } from './dto/student-query.dto';
import { BulkAdmissionDto } from './dto/bulk-admission.dto';

import { UploadDocumentDto } from './dto/document-upload.dto';
import { AssignClassDto } from './dto/assign-class.dto';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  /* =========================
     CREATE STUDENT
  ========================= */
  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Create new student admission' })
  @ApiResponse({ status: 201 })
  async create(
    @Body() dto: CreateStudentDto,
    @CurrentUser() user: any,
  ) {
    return this.studentService.createStudent(dto, user.id);
  }

  /* =========================
     BULK CREATE
  ========================= */
  @Post('bulk')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Bulk create student admissions' })
  async bulkCreate(
    @Body() dto: BulkAdmissionDto,
    @CurrentUser() user: any,
  ) {
    return this.studentService.bulkCreateStudents(dto.students, user.id);
  }

  /* =========================
     LIST STUDENTS
  ========================= */
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async findAll(
    @Query() query: StudentQueryDto,
    @Req() req: Request,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
    return this.studentService.findAll(query, baseUrl);
  }

  /* =========================
     STATISTICS
  ========================= */
  @Get('statistics')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get admission statistics and analytics' })
  async getAdmissionStatistics() {
    return this.studentService.getAdmissionStatistics();
  }

  /* =========================
     SEARCH
  ========================= */
  @Get('search')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Search students by name, ID, or email' })
  @ApiQuery({ name: 'q', required: true })
  async searchStudents(@Query('q') q: string) {
    return this.studentService.searchStudents(q);
  }

  /* =========================
     GET ONE
  ========================= */
  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.findOne(id);
  }

  /* =========================
     UPDATE
  ========================= */
  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentDto,
    @CurrentUser() user: any,
  ) {
    return this.studentService.updateStudent(id, dto, user.id);
  }

  /* =========================
     UPLOAD DOCUMENT
  ========================= */
  @Post(':id/documents')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadDocumentDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadStudentDocument(
    @Param('id', ParseIntPipe) studentId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|pdf|doc|docx)$/i,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @CurrentUser() user: any,
  ) {
    return this.studentService.uploadStudentDocument(
      studentId,
      file,
      dto,
      user.id,
    );
  }

  /* =========================
     GET DOCUMENTS
  ========================= */
  @Get(':id/documents')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  async getDocuments(@Param('id', ParseIntPipe) studentId: number) {
    return this.studentService.getStudentDocuments(studentId);
  }

  /* =========================
     FORMS & HISTORY
  ========================= */
  @Get(':id/admission-form')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async generateAdmissionForm(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.generateAdmissionForm(id);
  }

  @Get(':id/confirmation-receipt')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async generateConfirmationReceipt(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.generateConfirmationReceipt(id);
  }

  @Get(':id/admission-history')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async getAdmissionHistory(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.getAdmissionHistory(id);
  }

  /* =========================
     DELETE / RESTORE
  ========================= */
  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.studentService.softDeleteStudent(id, user.id);
  }

  @Patch(':id/restore')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async restoreStudent(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.studentService.restoreStudent(id, user.id);
  }

  /* =========================
     ASSIGN CLASS
  ========================= */
  @Patch(':studentId/assign-class')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async assignClass(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Body() dto: AssignClassDto,
    @CurrentUser() user: any,
  ) {
    return this.studentService.assignClass(
      studentId,
      dto.classId,
      dto.section ?? null,
      dto.remarks ?? null,
      user.id,
    );
  }


  
  /* =========================
     DASHBOARD
  ========================= */
  @Get(':id/dashboard')
  async studentDashboard(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.getDashboard(id);
  }

  
}
