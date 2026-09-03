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
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ActivateStudentDto } from '../auth/dto/activate-student.dto';
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

  /* -------------------------------------------------------
     PUBLIC ENDPOINTS (no token required)
  ------------------------------------------------------- */

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Student login using studentId and password' })
  @ApiBody({
    schema: {
      example: { studentId: 'STU20250001', password: 'Student123!' },
    },
  })
  async studentLogin(@Body() dto: { studentId: string; password: string }) {
    return this.studentService.loginStudent(dto);
  }

  @Public()
  @Post('activate-student/:studentId')
  @ApiOperation({ summary: 'Activate student account via email link (public)' })
  activateStudent(
    @Param('studentId') studentId: string,
    @Body() dto: ActivateStudentDto,
  ) {
    return this.studentService.activateStudentAccount(studentId, dto.password);
  }

  /* -------------------------------------------------------
     SPECIFIC NAMED ROUTES — must come before :id wildcards
  ------------------------------------------------------- */

  @Post('bulk')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Bulk create student admissions' })
  async bulkCreate(
    @Body() dto: BulkAdmissionDto,
    @CurrentUser() user: any,
  ) {
    return this.studentService.bulkCreateStudents(dto.students, user.id);
  }

  @Get('statistics')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get admission statistics and analytics' })
  async getAdmissionStatistics() {
    return this.studentService.getAdmissionStatistics();
  }

  @Get('search')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Search students by name, ID, or email' })
  @ApiQuery({ name: 'q', required: true })
  async searchStudents(@Query('q') q: string) {
    return this.studentService.searchStudents(q);
  }

  @Post('convert-inquiry/:inquiryId')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Convert inquiry to student admission' })
  async convertInquiry(
    @Param('inquiryId', ParseIntPipe) inquiryId: number,
    @Body() dto: CreateStudentDto,
    @CurrentUser() user: any,
  ) {
    return this.studentService.convertInquiryToStudent(inquiryId, dto, user.id);
  }

  /* -------------------------------------------------------
     CREATE
  ------------------------------------------------------- */

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Create new student admission' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profileImage'))
  async create(
    @Body() dto: CreateStudentDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    const profileImagePath = file ? `users/${file.filename}` : undefined;
    return this.studentService.createStudent(dto, user.id, profileImagePath);
  }

  /* -------------------------------------------------------
     LIST
  ------------------------------------------------------- */

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'List all students with pagination and filters' })
  async findAll(
    @Query() query: StudentQueryDto,
    @Req() req: Request,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
    return this.studentService.findAll(query, baseUrl);
  }

  /* -------------------------------------------------------
     WILDCARD :id ROUTES — ordered from most specific to least
  ------------------------------------------------------- */

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
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf|doc|docx)$/i }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @CurrentUser() user: any,
  ) {
    return this.studentService.uploadStudentDocument(studentId, file, dto, user.id);
  }

  @Get(':id/documents')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Get documents for a student' })
  async getDocuments(@Param('id', ParseIntPipe) studentId: number) {
    return this.studentService.getStudentDocuments(studentId);
  }

  @Get(':id/admission-form')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Generate admission form for a student' })
  async generateAdmissionForm(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.generateAdmissionForm(id);
  }

  @Get(':id/confirmation-receipt')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Generate confirmation receipt for a student' })
  async generateConfirmationReceipt(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.generateConfirmationReceipt(id);
  }

  @Get(':id/admission-history')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get admission history for a student' })
  async getAdmissionHistory(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.getAdmissionHistory(id);
  }

  @Get(':id/dashboard')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT')
  @ApiOperation({ summary: 'Get student dashboard data' })
  async studentDashboard(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.getDashboard(id);
  }

  @Patch(':studentId/assign-class')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Assign student to a class and section' })
  @ApiResponse({ status: 200, description: 'Class assigned successfully' })
  @ApiResponse({ status: 404, description: 'Student or class not found' })
  @ApiResponse({ status: 400, description: 'Section is full or invalid' })
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

  @Patch(':id/restore')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Restore a soft-deleted student' })
  async restoreStudent(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.studentService.restoreStudent(id, user.id);
  }

  @Post(':id/schedule-test')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Schedule admission test' })
  async scheduleTest(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { testDate: string; testType: string },
    @CurrentUser() user: any,
  ) {
    return this.studentService.scheduleAdmissionTest(
      id,
      new Date(body.testDate),
      body.testType,
      user.id,
    );
  }

  @Post(':id/record-test-result')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Record admission test result' })
  async recordTestResult(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { score: number; result: string; remarks?: string },
    @CurrentUser() user: any,
  ) {
    return this.studentService.recordAdmissionTestResult(
      id,
      body.score,
      body.result,
      body.remarks,
      user.id,
    );
  }

  /* -------------------------------------------------------
     CATCH-ALL :id — must be last among GET/PATCH/:id routes
  ------------------------------------------------------- */

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Get student by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Update student' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentDto,
    @CurrentUser() user: any,
  ) {
    return this.studentService.updateStudent(id, dto, user.id);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Soft delete a student' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.studentService.softDeleteStudent(id, user.id);
  }
}
