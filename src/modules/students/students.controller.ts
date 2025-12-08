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
  HttpStatus,
} from '@nestjs/common';
import { StudentLoginDto } from './dto/student-login.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiConsumes,
  ApiQuery,
  ApiBody 
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StudentService } from './students.service';
import { 
  CreateStudentDto, 
  UpdateStudentDto, 
  DocumentUploadDto, 
  StudentQueryDto,
  AssignClassDto,
  UpdateStatusDto,
  BulkAdmissionDto 
} from './dto/create-student.dto';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Create new student admission' })
  @ApiResponse({ status: 201, description: 'Student admission created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data or validation failed' })
  @ApiResponse({ status: 409, description: 'Duplicate student record detected' })
  async create(
    @Body() createStudentDto: CreateStudentDto,
    @CurrentUser() user: any,
  ) {
    return this.studentService.createStudent(createStudentDto, user.id);
  }

  @Post('bulk')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Bulk create student admissions' })
  @ApiResponse({ status: 201, description: 'Bulk admissions created successfully' })
  async bulkCreate(
    @Body() bulkAdmissionDto: BulkAdmissionDto,
    @CurrentUser() user: any,
  ) {
    return this.studentService.bulkCreateStudents(bulkAdmissionDto.students, user.id);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Get all student admissions with filters' })
  @ApiQuery({ name: 'sessionId', required: false, type: Number })
  @ApiQuery({ name: 'classId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query() query: StudentQueryDto) {
    return this.studentService.findAll(query);
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
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  async searchStudents(@Query('q') query: string) {
    return this.studentService.searchStudents(query);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Get student admission by ID' })
  @ApiResponse({ status: 200, description: 'Student admission found' })
  @ApiResponse({ status: 404, description: 'Student admission not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Update student admission' })
  @ApiResponse({ status: 200, description: 'Student admission updated' })
  @ApiResponse({ status: 404, description: 'Student admission not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
    @CurrentUser() user: any,
  ) {
    return this.studentService.updateStudent(id, updateStudentDto, user.id);
  }

  @Post(':id/documents')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Upload student document' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({ type: DocumentUploadDto })
  async uploadDocument(
    @Param('id', ParseIntPipe) studentId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB - FR1.5
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf|doc|docx)$/ }),
        ],
      }),
    ) file: Express.Multer.File,
    @Body() body: DocumentUploadDto,
    @CurrentUser() user: any,
  ) {
    return this.studentService.uploadDocument(
      studentId, 
      file, 
      body.documentType, 
      body.description, 
      user.id
    );
  }

  @Get(':id/documents')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Get all documents for a student' })
  async getDocuments(@Param('id', ParseIntPipe) studentId: number) {
    return this.studentService.getStudentDocuments(studentId);
  }


   @Patch(':id/assign-class')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Assign student to class and optional section' })
  async assignClass(
    @Param('id', ParseIntPipe) studentId: number,
    @Body() assignClassDto: AssignClassDto,
    @CurrentUser() user: any,
  ) {
    return this.studentService.assignClass(
      studentId,
      assignClassDto.classId,
      assignClassDto.section,
      assignClassDto.remarks,
      user.id,
    );
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Update admission status' })
  async updateAdmissionStatus(
    @Param('id', ParseIntPipe) studentId: number,
    @Body() updateStatusDto: UpdateStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.studentService.updateAdmissionStatus(
      studentId, 
      updateStatusDto.status, 
      updateStatusDto.remarks, 
      user.id
    );
  }

  @Get(':id/admission-form')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Generate admission form ' })
  async generateAdmissionForm(@Param('id', ParseIntPipe) studentId: number) {
    return this.studentService.generateAdmissionForm(studentId);
  }

  @Get(':id/confirmation-receipt')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Generate confirmation receipt' })
  async generateConfirmationReceipt(@Param('id', ParseIntPipe) studentId: number) {
    return this.studentService.generateConfirmationReceipt(studentId);
  }

  @Get(':id/admission-history')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get admission history and audit logs' })
  async getAdmissionHistory(@Param('id', ParseIntPipe) studentId: number) {
    return this.studentService.getAdmissionHistory(studentId);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Delete student admission' })
  @ApiResponse({ status: 200, description: 'Student admission deleted' })
  @ApiResponse({ status: 404, description: 'Student admission not found' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.studentService.softDeleteStudent(id, user.id);
  }

  @Patch(':id/restore')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Restore soft-deleted student admission' })
  async restoreStudent(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.studentService.restoreStudent(id, user.id);
  }

  @Post('login')
async studentLogin(@Body() dto: StudentLoginDto) {
 return this.studentService.loginStudent(dto);

}

  @Get(':id/dashboard')
  @UseGuards(JwtAuthGuard) // require auth - optional: add RolesGuard if necessary
  async studentDashboard(@Param('id') id: string) {
    const studentId = Number(id);
    return this.studentService.getDashboard(studentId);
  }
}