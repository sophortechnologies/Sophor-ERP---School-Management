import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';

import { ForbiddenException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { GradingService } from './grading.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

// DTOs
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { CreateGradeDto } from './dto/create-grade.dto';
import { BulkGradesDto } from './dto/bulk-grades.dto';
import { BulkExamResultsDto } from './dto/bulk-exam-results.dto';
import { CreateGradeScaleDto } from './dto/create-grade-scale.dto';
import { CreateExamWithSubjectsDto } from './dto/create-exam-with-subjects.dto';
import { ReportCardDto } from './dto/report-card.dto';
import { PublishReportCardDto } from './dto/publish-report-card.dto';
import { ExportReportDto } from './dto/export-report.dto';
import { VerifyExamResultDto } from './dto/verify-exam-result.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { CreateExamTypeDto } from './dto/create-exam-type.dto';
import { UpdateExamTypeDto } from './dto/update-exam-type.dto';
import { ReportExportFormat } from './dto/export-report.dto';

@ApiTags('Grading')
@ApiBearerAuth()
@Controller('grading')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}

  // =====================================================
  // EXAMS
  // =====================================================

  @Post('exams')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Create exam' })
  async createExam(@Body() dto: CreateExamDto, @Req() req: any) {
    return this.gradingService.createExam(dto, req.user.id);
  }

  @Get('exams')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'List exams' })
  async findAllExams(@Query() filters: any) {
    return this.gradingService.findAllExams(filters);
  }

  @Get('exams/:id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Get exam by ID' })
  @ApiParam({ name: 'id', type: Number })
  async findExamById(@Param('id', ParseIntPipe) id: number) {
    return this.gradingService.findExamById(id);
  }

  @Put('exams/:id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Update exam' })
  async updateExam(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamDto,
    @Req() req: any,
  ) {
    return this.gradingService.updateExam(id, dto, req.user.id);
  }

  @Post('exams/:id/publish')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Publish exam (admin only)' })
  async publishExam(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.gradingService.publishExam(id, req.user.id);
  }

  @Post('exams/with-subjects')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Create exam with subjects' })
  @ApiResponse({ status: 201, description: 'Exam and subjects created successfully' })
  async createExamWithSubjects(@Body() dto: CreateExamWithSubjectsDto, @Req() req: any) {
    return this.gradingService.createExamWithSubjects(dto, req.user.id);
  }

  // =====================================================
  // GRADES & RESULTS
  // =====================================================

  @Post('grades')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Enter a grade for a student' })
  async createGrade(@Body() dto: CreateGradeDto, @Req() req: any) {
    return this.gradingService.createGrade(dto, req.user.id);
  }

  @Post('grades/bulk')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Bulk enter grades' })
  async createBulkGrades(@Body() dto: BulkGradesDto, @Req() req: any) {
    return this.gradingService.createBulkGrades(dto, req.user.id);
  }

  @Post('results/bulk')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Bulk enter exam results' })
  async enterBulkResults(@Body() dto: BulkExamResultsDto, @Req() req: any) {
    return this.gradingService.enterBulkResults(dto, req.user.id);
  }

  // =====================================================
  // REPORT CARDS
  // =====================================================

  @Get('reports/exams/:examId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get all report cards for an exam (with ranking)' })
  async getClassReportCards(@Param('examId', ParseIntPipe) examId: number) {
    const reportCards = await this.gradingService.generateReportCards(examId);

    if (reportCards.length === 0) {
      throw new NotFoundException('No report cards found for this exam');
    }

    return {
      success: true,
      count: reportCards.length,
      data: reportCards,
    };
  }

  @Get('reports/exams/:examId/students/:studentId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Get single student report card in an exam' })
  async getStudentReportCard(
    @Param('examId', ParseIntPipe) examId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    const reportCards = await this.gradingService.generateReportCards(examId);
    const studentCard = reportCards.find(card => card.studentId === studentId);

    if (!studentCard) {
      throw new NotFoundException('Report card not found for this student in the exam');
    }

    return {
      success: true,
      data: studentCard,
    };
  }

  @Patch('reports/exams/:examId/publish')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Publish report cards (all results must be verified)' })
  async publishReportCards(
    @Param('examId', ParseIntPipe) examId: number,
    @Req() req: any,
  ) {
    const result = await this.gradingService.publishReportCards(
      { examId },
      req.user?.id || req.user?.userId || 1,
    );

    return {
      success: true,
      message: result.message,
      data: {
        examId: result.examId,
        publishedBy: result.publishedBy,
        publishedAt: result.publishedAt,
      },
    };
  }

  @Get('reports/export')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Export report cards (PDF/EXCEL ready)' })
  async exportReport(@Query() dto: ExportReportDto) {
    return this.gradingService.exportExamReport(dto);
  }

  // =====================================================
  // OTHER ENDPOINTS
  // =====================================================

  @Post('exams/:id/report-cards')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Generate report cards for an exam' })
  async generateReportCards(@Param('id', ParseIntPipe) id: number) {
    return this.gradingService.generateReportCards(id);
  }

  @Get('students/:studentId/grades')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Get grades for a student' })
  async getStudentGrades(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Req() req: any,
  ) {
    // Service handles fine-grained authorization (student sees own, parent sees child)
    return this.gradingService.getStudentGrades(studentId, req.user);
  }

  @Get('exams/:id/statistics')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get exam statistics' })
  async getExamStatistics(@Param('id', ParseIntPipe) id: number) {
    return this.gradingService.getExamStatistics(id);
  }

  @Get('classes/:classId/performance')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get class performance' })
  async getClassPerformance(
    @Param('classId', ParseIntPipe) classId: number,
    @Query('examId', ParseIntPipe) examId?: number,
  ) {
    return this.gradingService.getClassPerformance(classId, examId);
  }

  @Get('grade-scales')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get all grade scales' })
  async getGradeScales() {
    return this.gradingService.getGradeScales();
  }

  @Post('grade-scales')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a grade scale' })
  async createGradeScale(@Body() dto: CreateGradeScaleDto) {
    return this.gradingService.createGradeScale(dto);
  }

  @Post('grade-scales/initialize')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Initialize default grade scales' })
  async initializeGradeScale() {
    return this.gradingService.initializeGradeScale();
  }

  @Get('report-card')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Get student report card by query' })
  async getReportCard(@Query() dto: ReportCardDto) {
    return this.gradingService.getStudentReportCard(dto);
  }

  @Post('report-card/publish')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Publish report card' })
  async publishReportCard(@Body() dto: PublishReportCardDto, @Req() req: any) {
    return this.gradingService.publishReportCards(dto, req.user.id);
  }

  @Post('results/verify')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Verify exam result' })
  async verifyExamResult(@Body() dto: VerifyExamResultDto, @Req() req: any) {
    return this.gradingService.verifyExam(dto, req.user.id);
  }

  @Get('analytics')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get grading analytics' })
  async getAnalytics(@Query() dto: AnalyticsQueryDto) {
    return this.gradingService.getAnalytics(dto);
  }

  // =====================================================
  // EXAM TYPES
  // =====================================================

  @Post('exam-types')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create exam type' })
  async createExamType(@Body() dto: CreateExamTypeDto, @Req() req: any) {
    return this.gradingService.createExamType(dto, req.user.id);
  }

  @Get('exam-types')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get all exam types' })
  async getAllExamTypes(@Query() filters: { page?: number; limit?: number; isActive?: string }) {
    const parsed = {
      page: filters.page ? Number(filters.page) : undefined,
      limit: filters.limit ? Number(filters.limit) : undefined,
      isActive: filters.isActive !== undefined ? filters.isActive === 'true' : undefined,
    };
    return this.gradingService.getAllExamTypes(parsed);
  }

  @Get('exam-types/:id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get exam type by ID' })
  async getExamTypeById(@Param('id', ParseIntPipe) id: number) {
    return this.gradingService.getExamTypeById(id);
  }

  @Put('exam-types/:id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update exam type' })
  async updateExamType(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamTypeDto,
    @Req() req: any,
  ) {
    return this.gradingService.updateExamType(id, dto, req.user.id);
  }

  @Delete('exam-types/:id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Delete exam type' })
  async deleteExamType(@Param('id', ParseIntPipe) id: number) {
    return this.gradingService.deleteExamType(id);
  }

  @Get('students/:studentId/transcript')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Generate student academic transcript' })
  @ApiQuery({ name: 'academicSessionId', required: false })
  async getTranscript(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('academicSessionId', ParseIntPipe) academicSessionId: number,
    @Req() req: any,
  ) {
    // Service handles fine-grained authorization (student sees own, parent sees child)
    return this.gradingService.generateTranscript(studentId, academicSessionId, req.user);
  }
}
