// import {
//   Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseIntPipe, UseInterceptors, UploadedFile, BadRequestException
// } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
// import { AttendanceService } from './attendance.service';
// import { CreateAttendanceDto } from './dto/create-attendance.dto';
// import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
// import { UpdateAttendanceDto } from './dto/update-attendance.dto';
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../../common/guards/roles.guard';
// import { Roles } from '../../common/decorators/roles.decorator';
// import { CurrentUser } from '../../common/decorators/current-user.decorator';
// import { UserRole } from '../../utils/constants/user.constants';

// @ApiTags('Attendance')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Controller('attendance')
// export class AttendanceController {
//   constructor(private readonly attendanceService: AttendanceService) {}

//   @Get()
//   @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
//   @ApiOperation({ summary: 'Get attendance records with filters' })
//   @ApiQuery({ name: 'studentId', required: false })
//   @ApiQuery({ name: 'classId', required: false })
//   @ApiQuery({ name: 'date', required: false })
//   @ApiQuery({ name: 'startDate', required: false })
//   @ApiQuery({ name: 'endDate', required: false })
//   async findAll(@CurrentUser() user: any, @Query() query: any) {
//     return this.attendanceService.findAll(query, user.id, user.role?.name);
//   }

//   @Get(':id')
//   @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
//   async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
//     return this.attendanceService.findOne(id, user.id, user.role?.name);
//   }

//   @Post()
//   @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
//   async create(@Body() dto: CreateAttendanceDto, @CurrentUser() user: any) {
//     return this.attendanceService.create(dto, user.id, user.role?.name);
//   }

//   @Post('bulk')
//   @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
//   async createBulk(@Body() dto: BulkAttendanceDto, @CurrentUser() user: any) {
//     return this.attendanceService.createBulk(dto, user.id, user.role?.name);
//   }

//   // CSV upload endpoint
//   @Post('upload')
//   @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
//   @UseInterceptors(FileInterceptor('file'))
//   @ApiConsumes('multipart/form-data')
//   @ApiBody({
//     schema: {
//       type: 'object',
//       properties: {
//         file: { type: 'string', format: 'binary' },
//         classId: { type: 'number' },
//         date: { type: 'string', format: 'date' },
//         subjectId: { type: 'number' },
//       },
//     },
//   })
//   async uploadCsv(
//     @UploadedFile() file: Express.Multer.File,
//     @Body('classId') classId: string,
//     @Body('date') date: string,
//     @Body('subjectId') subjectId: string,
//     @CurrentUser() user: any,
//   ) {
//     if (!file) throw new BadRequestException('CSV file is required');
//     const parsedDate = new Date(date);
//     const subjId = subjectId ? Number(subjectId) : undefined;
//     return this.attendanceService.createFromCsv(file.buffer, Number(classId), parsedDate, subjId, user.id, user.role?.name);
//   }

//   @Patch(':id')
//   @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
//   async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAttendanceDto, @CurrentUser() user: any) {
//     return this.attendanceService.update(id, dto, user.id);
//   }

//   @Delete(':id')
//   @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
//   async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
//     return this.attendanceService.remove(id, user.id);
//   }

//   @Get('student/:studentId')
//   @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
//   async getStudentAttendance(@Param('studentId', ParseIntPipe) studentId: number, @CurrentUser() user: any, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
//     return this.attendanceService.getStudentAttendance(studentId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined, user.id, user.role?.name);
//   }

//   @Get('class/:classId/date/:date')
//   @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
//   async getClassAttendanceByDate(@Param('classId', ParseIntPipe) classId: number, @Param('date') date: string, @CurrentUser() user: any) {
//     return this.attendanceService.getClassAttendanceByDate(classId, new Date(date), user.id, user.role?.name);
//   }

//   @Get('report/:classId')
//   @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
//   async generateAttendanceReport(@Param('classId', ParseIntPipe) classId: number, @CurrentUser() user: any, @Query('month') month: string, @Query('year') year: string) {
//     return this.attendanceService.generateAttendanceReport(classId, parseInt(month), parseInt(year), user.id, user.role?.name);
//   }

//   @Get('summary/student/:studentId')
//   @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
//   async getStudentAttendanceSummary(@Param('studentId', ParseIntPipe) studentId: number, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
//     return this.attendanceService.getStudentAttendanceSummary(studentId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
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
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../utils/constants/user.constants';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // More specific routes first to avoid route collisions with :id
  @Get('student/:studentId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get attendance for a student (optional date range)' })
  async getStudentAttendance(
    @Param('studentId', ParseIntPipe) studentId: number,
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const s = startDate ? new Date(startDate) : undefined;
    const e = endDate ? new Date(endDate) : undefined;
    return this.attendanceService.getStudentAttendance(studentId, s, e, user.id, user.role?.name);
  }

  @Get('class/:classId/date/:date')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get class attendance for a specific date' })
  async getClassAttendanceByDate(
    @Param('classId', ParseIntPipe) classId: number,
    @Param('date') date: string,
    @CurrentUser() user: any,
  ) {
    const d = new Date(date);
    return this.attendanceService.getClassAttendanceByDate(classId, d, user.id, user.role?.name);
  }

  @Get('report/:classId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Generate attendance report for a class for given month/year' })
  @ApiQuery({ name: 'month', required: true })
  @ApiQuery({ name: 'year', required: true })
  async generateAttendanceReport(
    @Param('classId', ParseIntPipe) classId: number,
    @CurrentUser() user: any,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (isNaN(m) || isNaN(y)) throw new BadRequestException('month and year are required and must be numbers');
    return this.attendanceService.generateAttendanceReport(classId, m, y, user.id, user.role?.name);
  }

  @Get('summary/student/:studentId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get student attendance summary (period optional)' })
  async getStudentAttendanceSummary(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const s = startDate ? new Date(startDate) : undefined;
    const e = endDate ? new Date(endDate) : undefined;
    return this.attendanceService.getStudentAttendanceSummary(studentId, s, e);
  }

  // Generic list with filters
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get attendance records with filters' })
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'classId', required: false })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async findAll(@CurrentUser() user: any, @Query() query: any) {
    return this.attendanceService.findAll(query, user.id, user.role?.name);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get single attendance record' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.attendanceService.findOne(id, user.id, user.role?.name);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Create attendance record' })
  async create(@Body() dto: CreateAttendanceDto, @CurrentUser() user: any) {
    return this.attendanceService.create(dto, user.id, user.role?.name);
  }

  @Post('bulk')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Create bulk attendance records' })
  async createBulk(@Body() dto: BulkAttendanceDto, @CurrentUser() user: any) {
    return this.attendanceService.createBulk(dto, user.id, user.role?.name);
  }

  // CSV upload endpoint
  @Post('upload')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        classId: { type: 'number' },
        date: { type: 'string', format: 'date' },
        subjectId: { type: 'number' },
      },
    },
  })
  async uploadCsv(
    @UploadedFile() file: Express.Multer.File,
    @Body('classId') classId: string,
    @Body('date') date: string,
    @Body('subjectId') subjectId: string,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('CSV file is required');
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) throw new BadRequestException('Invalid date');
    const subjId = subjectId ? Number(subjectId) : undefined;
    return this.attendanceService.createFromCsv(file.buffer, Number(classId), parsedDate, subjId, user.id, user.role?.name);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Update an attendance record' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAttendanceDto, @CurrentUser() user: any) {
    return this.attendanceService.update(id, dto, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete an attendance record' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.attendanceService.remove(id, user.id);
  }
}
