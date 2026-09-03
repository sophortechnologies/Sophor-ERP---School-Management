// src/modules/reports/reports.controller.ts

import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  Res,
  Req,
  ForbiddenException
} from '@nestjs/common';
import { Response, Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}


@Get('admin/dashboard')
@Roles('SUPER_ADMIN', 'ADMIN')
@ApiOperation({ summary: 'Get admin dashboard with all metrics' })
@ApiQuery({ name: 'academicSessionId', required: false })
async getAdminDashboard(
  @Query('academicSessionId') academicSessionId?: string,
) {
  const sessionId = academicSessionId ? parseInt(academicSessionId) : undefined;
  return this.reportsService.getAdminDashboard(sessionId);
}


  @Get('attendance/class/:classId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get attendance report for a class' })
  @ApiQuery({ name: 'month', required: true })
  @ApiQuery({ name: 'year', required: true })
  async getClassAttendanceReport(
    @Param('classId', ParseIntPipe) classId: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.reportsService.getClassAttendanceReport(classId, month, year);
  }

  @Get('attendance/student/:studentId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Get attendance report for a student' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getStudentAttendanceReport(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: any,
  ) {
    return this.reportsService.getStudentAttendanceReport(
      studentId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      req.user,
    );
  }


  @Get('financial/fee-collection')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Get fee collection report' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'classId', required: false })
  async getFeeCollectionReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('classId', ParseIntPipe) classId: number,
  ) {
    return this.reportsService.getFeeCollectionReport(
      new Date(startDate),
      new Date(endDate),
      classId,
    );
  }

 @Get('financial/outstanding-dues')
@Roles('SUPER_ADMIN', 'ADMIN')
@ApiOperation({ summary: 'Get outstanding dues report' })
@ApiQuery({ name: 'classId', required: false })
@ApiQuery({ name: 'daysOverdue', required: false })
async getOutstandingDuesReport(
  @Query('classId') classId?: string,
  @Query('daysOverdue') daysOverdue?: string,
) {
  return this.reportsService.getOutstandingDuesReport(
    classId ? parseInt(classId) : undefined,
    daysOverdue ? parseInt(daysOverdue) : undefined,
  );
}


  @Get('academic/class-performance/:classId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get class performance report' })
  @ApiQuery({ name: 'examId', required: true })
  async getClassPerformanceReport(
    @Param('classId', ParseIntPipe) classId: number,
    @Query('examId', ParseIntPipe) examId: number,
  ) {
    return this.reportsService.getClassPerformanceReport(classId, examId);
  }

  @Get('academic/subject-performance/:subjectId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get subject performance across all classes' })
  @ApiQuery({ name: 'examId', required: true })
  async getSubjectPerformanceReport(
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Query('examId', ParseIntPipe) examId: number,
  ) {
    return this.reportsService.getSubjectPerformanceReport(subjectId, examId);
  }

  @Get('academic/exam-result-distribution/:examId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get exam result distribution (grade-wise)' })
  async getExamResultDistribution(
    @Param('examId', ParseIntPipe) examId: number,
  ) {
    return this.reportsService.getExamResultDistribution(examId);
  }


  @Get('student/complete-profile/:studentId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Get complete student profile with all data' })
  async getCompleteStudentProfile(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Req() req: any,
  ) {
    return this.reportsService.getCompleteStudentProfile(studentId, req.user);
  }


  @Get('export/attendance')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Export attendance report to Excel' })
  @ApiQuery({ name: 'classId', required: true })
  @ApiQuery({ name: 'month', required: true })
  @ApiQuery({ name: 'year', required: true })
  async exportAttendanceReport(
    @Query('classId', ParseIntPipe) classId: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.exportAttendanceReport(
      classId,
      month,
      year,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=attendance_report_${classId}_${month}_${year}.xlsx`,
    );
    res.send(buffer);
  }

  @Get('export/fee-collection')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Export fee collection report to Excel' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async exportFeeCollectionReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.exportFeeCollectionReport(
      new Date(startDate),
      new Date(endDate),
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=fee_collection_${startDate}_to_${endDate}.xlsx`,
    );
    res.send(buffer);
  }

  @Get('export/student-grades/:studentId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Export student grades to PDF' })
  async exportStudentGrades(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Res() res: Response,
    @Req() req: any,
  ) {
    const pdf = await this.reportsService.exportStudentGradesToPDF(
      studentId,
      req.user,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=student_grades_${studentId}.pdf`,
    );
    res.send(pdf);
  }

@Get('financial/fee-statement/:studentId')
@Roles('SUPER_ADMIN', 'ADMIN', 'STUDENT', 'PARENT')
@ApiOperation({ summary: 'Get fee statement for a student' })
@ApiQuery({ name: 'fromDate', required: false })
@ApiQuery({ name: 'toDate', required: false })
async getFeeStatement(
  @Param('studentId', ParseIntPipe) studentId: number,
  @Query('fromDate') fromDate: string,
  @Query('toDate') toDate: string,
  @Req() req: any,
) {
  // Pass currentUser as 4th parameter
  return this.reportsService.getFeeStatement(studentId, fromDate, toDate, req.user);
}
}