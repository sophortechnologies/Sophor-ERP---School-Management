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
