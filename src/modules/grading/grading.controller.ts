// import {
//   Controller,
//   Get,
//   Post,
//   Put,
//   Body,
//   Param,
//   Query,
//   UsePipes,
//   ValidationPipe,
//   ParseIntPipe,
//   UseGuards,
//   Req,
//   Delete
// } from '@nestjs/common';
// import {
//   ApiTags,
//   ApiOperation,
//   ApiResponse,
//   ApiParam,
//   ApiQuery,
// } from '@nestjs/swagger';

// import { GradingService } from './grading.service';
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../../common/guards/roles.guard';

// // DTOs (use real DTOs, not `any`)
// import { CreateExamDto } from './dto/create-exam.dto';
// import { UpdateExamDto } from './dto/update-exam.dto';
// import { CreateGradeDto } from './dto/create-grade.dto';
// import { BulkGradesDto } from './dto/bulk-grades.dto';
// import { BulkExamResultsDto } from './dto/bulk-exam-results.dto';
// import { CreateGradeScaleDto } from './dto/create-grade-scale.dto';
// import { CreateExamWithSubjectsDto } from './dto/create-exam-with-subjects.dto';
// import { ReportCardDto } from './dto/report-card.dto';
// import { PublishReportCardDto } from './dto/publish-report-card.dto';
// import { ExportReportDto } from './dto/export-report.dto';
// import { VerifyExamResultDto } from './dto/verify-exam-result.dto';
// import { AnalyticsQueryDto } from './dto/analytics-query.dto';
// import { CreateExamTypeDto } from './dto/create-exam-type.dto';
// import { UpdateExamTypeDto } from './dto/update-exam-type.dto';
// @ApiTags('Grading')
// @Controller('grading')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
// export class GradingController {
//   constructor(private readonly gradingService: GradingService) {}

//   // =====================================================
//   // EXAMS
//   // =====================================================

//   @Post('exams')
//   @ApiOperation({ summary: 'Create exam' })
//   @ApiResponse({ status: 201 })
//   async createExam(
//     @Body() dto: CreateExamDto,
//     @Req() req,
//   ) {
//     return this.gradingService.createExam(dto, req.user.id);
//   }

//   @Get('exams')
//   @ApiOperation({ summary: 'List exams' })
//   async findAllExams(@Query() filters: any) {
//     return this.gradingService.findAllExams(filters);
//   }

//   @Get('exams/:id')
//   @ApiOperation({ summary: 'Get exam by ID' })
//   @ApiParam({ name: 'id', type: Number })
//   async findExamById(@Param('id', ParseIntPipe) id: number) {
//     return this.gradingService.findExamById(id);
//   }

//   @Put('exams/:id')
//   @ApiOperation({ summary: 'Update exam' })
//   async updateExam(
//     @Param('id', ParseIntPipe) id: number,
//     @Body() dto: UpdateExamDto,
//     @Req() req,
//   ) {
//     return this.gradingService.updateExam(id, dto, req.user.id);
//   }

//   @Post('exams/:id/publish')
//   @ApiOperation({ summary: 'Publish exam' })
//   async publishExam(
//     @Param('id', ParseIntPipe) id: number,
//     @Req() req,
//   ) {
//     return this.gradingService.publishExam(id, req.user.id);
//   }

//   // =====================================================
//   // GRADES
//   // =====================================================

//   @Post('grades')
//   @ApiOperation({ summary: 'Create grade' })
//   async createGrade(
//     @Body() dto: CreateGradeDto,
//     @Req() req,
//   ) {
//     return this.gradingService.createGrade(dto, req.user.id);
//   }

//   @Post('grades/bulk')
//   @ApiOperation({ summary: 'Bulk create grades' })
//   async createBulkGrades(
//     @Body() dto: BulkGradesDto,
//     @Req() req,
//   ) {
//     return this.gradingService.createBulkGrades(dto, req.user.id);
//   }

//   // =====================================================
//   // RESULTS
//   // =====================================================

//   @Post('results/bulk')
//   @ApiOperation({ summary: 'Bulk enter exam results' })
//   async enterBulkResults(
//     @Body() dto: BulkExamResultsDto,
//     @Req() req,
//   ) {
//     return this.gradingService.enterBulkResults(dto, req.user.id);
//   }

//   @Post('exams/:id/report-cards')
//   @ApiOperation({ summary: 'Generate report cards' })
//   async generateReportCards(
//     @Param('id', ParseIntPipe) id: number,
//   ) {
//     return this.gradingService.generateReportCards(id);
//   }

//   // =====================================================
//   // STUDENT PERFORMANCE
//   // =====================================================

//   @Get('students/:studentId/grades')
//   @ApiOperation({ summary: 'Get student grades' })
//   async getStudentGrades(
//     @Param('studentId', ParseIntPipe) studentId: number,
//     @Query('academicSessionId', ParseIntPipe) academicSessionId?: number,
//   ) {
//     return this.gradingService.getStudentGrades(studentId, academicSessionId);
//   }

//   // @Get('students/:studentId/report-card')
//   // @ApiOperation({ summary: 'Get student report card' })
//   // async getReportCard(
//   //   @Param('studentId', ParseIntPipe) studentId: number,
//   // ) {
//   //   return this.gradingService.getReportCard(studentId);
//   // }

//   // =====================================================
//   // ANALYTICS
//   // =====================================================

//   @Get('exams/:id/statistics')
//   @ApiOperation({ summary: 'Exam statistics' })
//   async getExamStatistics(
//     @Param('id', ParseIntPipe) id: number,
//   ) {
//     return this.gradingService.getExamStatistics(id);
//   }

//   @Get('classes/:classId/performance')
//   @ApiOperation({ summary: 'Class performance analytics' })
//   async getClassPerformance(
//     @Param('classId', ParseIntPipe) classId: number,
//     @Query('examId', ParseIntPipe) examId?: number,
//   ) {
//     return this.gradingService.getClassPerformance(classId, examId);
//   }

//   // =====================================================
//   // GRADE SCALES
//   // =====================================================

//   @Get('grade-scales')
//   async getGradeScales() {
//     return this.gradingService.getGradeScales();
//   }

//   @Post('grade-scales')
//   async createGradeScale(
//     @Body() dto: CreateGradeScaleDto,
//   ) {
//     return this.gradingService.createGradeScale(dto);
//   }

//   @Post('exams/with-subjects')
// @ApiOperation({ summary: 'Create exam with subjects' })
// @ApiResponse({ status: 201, description: 'Exam and subjects created successfully' })
// async createExamWithSubjects(
//   @Body() dto: CreateExamWithSubjectsDto,
//   @Req() req,
// ) {
//   return this.gradingService.createExamWithSubjects(dto, req.user.id);
// }

//   @Post('grade-scales/initialize')
//   async initializeGradeScale() {
//     return this.gradingService.initializeGradeScale();
//   }

  
//   @Get('report-card')
//   getReportCard(@Query() dto: ReportCardDto) {
//     return this.gradingService.getStudentReportCard(dto);
//   }

//   @Post('report-card/publish')
//   publishReportCard(
//     @Body() dto: PublishReportCardDto,
//     @Req() req,
//   ) {
//     return this.gradingService.publishReportCards(dto, req.user.id);
//   }

//   @Get('report/export')
//   exportReport(@Query() dto: ExportReportDto) {
//     return this.gradingService.exportExamReport(dto);
//   }

//   // ================= VERIFY =================

//   @Post('results/verify')
//   verifyExamResult(
//     @Body() dto: VerifyExamResultDto,
//     @Req() req,
//   ) {
//     return this.gradingService.verifyExam(dto, req.user.id);
//   }

//   // ================= ANALYTICS =================

//   @Get('analytics')
//   getAnalytics(@Query() dto: AnalyticsQueryDto) {
//     return this.gradingService.getAnalytics(dto);
//   }


//   // ExamType

//   @Post('exam-types')
// @ApiOperation({ summary: 'Create a new exam type' })
// @ApiResponse({ status: 201, description: 'Exam type created' })
// @ApiResponse({ status: 409, description: 'Name already exists' })
// async createExamType(@Body() dto: CreateExamTypeDto, @Req() req) {
//   return this.gradingService.createExamType(dto, req.user.id);
// }

// @Get('exam-types')
// @ApiOperation({ summary: 'List all exam types (with optional filters)' })
// async getAllExamTypes(@Query() filters: { page?: number; limit?: number; isActive?: string }) {
//   const parsed = {
//     page: filters.page ? Number(filters.page) : undefined,
//     limit: filters.limit ? Number(filters.limit) : undefined,
//     isActive: filters.isActive !== undefined ? filters.isActive === 'true' : undefined,
//   };
//   return this.gradingService.getAllExamTypes(parsed);
// }

// @Get('exam-types/:id')
// @ApiOperation({ summary: 'Get exam type by ID' })
// async getExamTypeById(@Param('id', ParseIntPipe) id: number) {
//   return this.gradingService.getExamTypeById(id);
// }

// @Put('exam-types/:id')
// @ApiOperation({ summary: 'Update exam type' })
// async updateExamType(
//   @Param('id', ParseIntPipe) id: number,
//   @Body() dto: UpdateExamTypeDto,
//   @Req() req,
// ) {
//   return this.gradingService.updateExamType(id, dto, req.user.id);
// }

// @Delete('exam-types/:id')
// @ApiOperation({ summary: 'Delete (soft-delete) exam type' })
// async deleteExamType(@Param('id', ParseIntPipe) id: number) {
//   return this.gradingService.deleteExamType(id);
// }
// @Get('exams/:examId')
//   async getClassReportCards(@Param('examId', ParseIntPipe) examId: number) {
//     const reportCards = await this.gradingService.generateReportCards(examId);

//     if (reportCards.length === 0) {
//       throw new NotFoundException('No report cards found for this exam');
//     }

//     return {
//       success: true,
//       count: reportCards.length,
//       data: reportCards,
//     };
//   }

//   // GET /grading/reports/exams/:examId/students/:studentId
//   @Get('exams/:examId/students/:studentId')
//   async getStudentReportCard(
//     @Param('examId', ParseIntPipe) examId: number,
//     @Param('studentId', ParseIntPipe) studentId: number,
//   ) {
//     const reportCards = await this.gradingService.generateReportCards(examId);
//     const studentCard = reportCards.find(card => card.studentId === studentId);

//     if (!studentCard) {
//       throw new NotFoundException('Report card not found for this student in the exam');
//     }

//     return {
//       success: true,
//       data: studentCard,
//     };
//   }

//   // PATCH /grading/reports/exams/:examId/publish
//   @Patch('exams/:examId/publish')
//   async publishReportCards(
//     @Param('examId', ParseIntPipe) examId: number,
//     @Req() req: any,
//   ) {
//     const result = await this.gradingService.publishReportCards(
//       { examId },
//       req.user?.id || req.user?.userId, // Adjust based on your JWT payload
//     );

//     return {
//       success: true,
//       message: result.message,
//       data: {
//         examId: result.examId,
//         publishedBy: result.publishedBy,
//         publishedAt: result.publishedAt,
//       },
//     };
    
//   }

// }


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
  NotFoundException, // ← Added this
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { GradingService } from './grading.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

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
import { ReportExportFormat } from './dto/export-report.dto'; // For export format

@ApiTags('Grading')
@Controller('grading')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}

  // =====================================================
  // EXAMS
  // =====================================================

  @Post('exams')
  @ApiOperation({ summary: 'Create exam' })
  async createExam(@Body() dto: CreateExamDto, @Req() req: any) {
    return this.gradingService.createExam(dto, req.user.id);
  }

  @Get('exams')
  @ApiOperation({ summary: 'List exams' })
  async findAllExams(@Query() filters: any) {
    return this.gradingService.findAllExams(filters);
  }

  @Get('exams/:id')
  @ApiOperation({ summary: 'Get exam by ID' })
  @ApiParam({ name: 'id', type: Number })
  async findExamById(@Param('id', ParseIntPipe) id: number) {
    return this.gradingService.findExamById(id);
  }

  @Put('exams/:id')
  @ApiOperation({ summary: 'Update exam' })
  async updateExam(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamDto,
    @Req() req: any,
  ) {
    return this.gradingService.updateExam(id, dto, req.user.id);
  }

  @Post('exams/:id/publish')
  @ApiOperation({ summary: 'Publish exam' })
  async publishExam(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.gradingService.publishExam(id, req.user.id);
  }

  @Post('exams/with-subjects')
  @ApiOperation({ summary: 'Create exam with subjects' })
  @ApiResponse({ status: 201, description: 'Exam and subjects created successfully' })
  async createExamWithSubjects(@Body() dto: CreateExamWithSubjectsDto, @Req() req: any) {
    return this.gradingService.createExamWithSubjects(dto, req.user.id);
  }

  // =====================================================
  // GRADES & RESULTS
  // =====================================================

  @Post('grades')
  async createGrade(@Body() dto: CreateGradeDto, @Req() req: any) {
    return this.gradingService.createGrade(dto, req.user.id);
  }

  @Post('grades/bulk')
  async createBulkGrades(@Body() dto: BulkGradesDto, @Req() req: any) {
    return this.gradingService.createBulkGrades(dto, req.user.id);
  }

  @Post('results/bulk')
  async enterBulkResults(@Body() dto: BulkExamResultsDto, @Req() req: any) {
    return this.gradingService.enterBulkResults(dto, req.user.id);
  }

  // =====================================================
  // REPORT CARDS (NEW ORGANIZED ENDPOINTS)
  // =====================================================

  // GET /grading/reports/exams/:examId → Full class report cards with ranking
  @Get('reports/exams/:examId')
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

  // GET /grading/reports/exams/:examId/students/:studentId → Single student
  @Get('reports/exams/:examId/students/:studentId')
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

  // PATCH /grading/reports/exams/:examId/publish → Publish report cards
  @Patch('reports/exams/:examId/publish')
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

  // GET /grading/reports/export?examId=5&format=PDF
  @Get('reports/export')
  @ApiOperation({ summary: 'Export report cards (PDF/EXCEL ready)' })
  async exportReport(@Query() dto: ExportReportDto) {
    return this.gradingService.exportExamReport(dto);
  }

  // =====================================================
  // OTHER ENDPOINTS (unchanged)
  // =====================================================

  @Post('exams/:id/report-cards')
  async generateReportCards(@Param('id', ParseIntPipe) id: number) {
    return this.gradingService.generateReportCards(id);
  }

  @Get('students/:studentId/grades')
  async getStudentGrades(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('academicSessionId', ParseIntPipe) academicSessionId?: number,
  ) {
    return this.gradingService.getStudentGrades(studentId, academicSessionId);
  }

  @Get('exams/:id/statistics')
  async getExamStatistics(@Param('id', ParseIntPipe) id: number) {
    return this.gradingService.getExamStatistics(id);
  }

  @Get('classes/:classId/performance')
  async getClassPerformance(
    @Param('classId', ParseIntPipe) classId: number,
    @Query('examId', ParseIntPipe) examId?: number,
  ) {
    return this.gradingService.getClassPerformance(classId, examId);
  }

  @Get('grade-scales')
  async getGradeScales() {
    return this.gradingService.getGradeScales();
  }

  @Post('grade-scales')
  async createGradeScale(@Body() dto: CreateGradeScaleDto) {
    return this.gradingService.createGradeScale(dto);
  }

  @Post('grade-scales/initialize')
  async initializeGradeScale() {
    return this.gradingService.initializeGradeScale();
  }

  @Get('report-card')
  async getReportCard(@Query() dto: ReportCardDto) {
    return this.gradingService.getStudentReportCard(dto);
  }

  @Post('report-card/publish')
  async publishReportCard(@Body() dto: PublishReportCardDto, @Req() req: any) {
    return this.gradingService.publishReportCards(dto, req.user.id);
  }

  @Post('results/verify')
  async verifyExamResult(@Body() dto: VerifyExamResultDto, @Req() req: any) {
    return this.gradingService.verifyExam(dto, req.user.id);
  }

  @Get('analytics')
  async getAnalytics(@Query() dto: AnalyticsQueryDto) {
    return this.gradingService.getAnalytics(dto);
  }

  // Exam Types
  @Post('exam-types')
  async createExamType(@Body() dto: CreateExamTypeDto, @Req() req: any) {
    return this.gradingService.createExamType(dto, req.user.id);
  }

  @Get('exam-types')
  async getAllExamTypes(@Query() filters: { page?: number; limit?: number; isActive?: string }) {
    const parsed = {
      page: filters.page ? Number(filters.page) : undefined,
      limit: filters.limit ? Number(filters.limit) : undefined,
      isActive: filters.isActive !== undefined ? filters.isActive === 'true' : undefined,
    };
    return this.gradingService.getAllExamTypes(parsed);
  }

  @Get('exam-types/:id')
  async getExamTypeById(@Param('id', ParseIntPipe) id: number) {
    return this.gradingService.getExamTypeById(id);
  }

  @Put('exam-types/:id')
  async updateExamType(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamTypeDto,
    @Req() req: any,
  ) {
    return this.gradingService.updateExamType(id, dto, req.user.id);
  }

  @Delete('exam-types/:id')
  async deleteExamType(@Param('id', ParseIntPipe) id: number) {
    return this.gradingService.deleteExamType(id);
  }
}