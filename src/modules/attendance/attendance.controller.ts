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
  ForbiddenException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../utils/constants/user.constants';
import { AttendanceStatus } from './enums/attendance-status.enum';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // ✔ Student Attendance (with optional date range)
  @Get('student/:studentId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.TEACHER,
    UserRole.STUDENT,
  )
  @ApiOperation({ summary: 'Get attendance for a student (optional date range)' })
  async getStudentAttendance(
    @Param('studentId', ParseIntPipe) studentId: number,
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const s = startDate ? new Date(startDate) : undefined;
    const e = endDate ? new Date(endDate) : undefined;
    return this.attendanceService.getStudentAttendance(
      studentId,
      s,
      e,
      user.id,
      user.role?.name,
    );
  }

  // ✔ Class attendance for specific date
  @Get('class/:classId/date/:date')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get class attendance for a specific date' })
  async getClassAttendanceByDate(
    @Param('classId', ParseIntPipe) classId: number,
    @Param('date') date: string,
    @CurrentUser() user: any,
  ) {
    return this.attendanceService.getClassAttendanceByDate(
      classId,
      new Date(date),
      user.id,
      user.role?.name,
    );
  }

  // ✔ Attendance Report (Month/Year)
  @Get('report/:classId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Generate attendance report for class' })
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
    if (isNaN(m) || isNaN(y))
      throw new BadRequestException('month and year must be numbers');

    return this.attendanceService.generateAttendanceReport(
      classId,
      m,
      y,
      user.id,
      user.role?.name,
    );
  }

  // ✔ Student Attendance Summary
  @Get('summary/student/:studentId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.TEACHER,
    UserRole.STUDENT,
  )
  @ApiOperation({ summary: 'Get student attendance summary' })
  async getStudentAttendanceSummary(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const s = startDate ? new Date(startDate) : undefined;
    const e = endDate ? new Date(endDate) : undefined;

    return this.attendanceService.getStudentAttendanceSummary(
      studentId,
      s,
      e,
    );
  }

  // ✔ List attendance with filters
  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.TEACHER,
    UserRole.STUDENT,
  )
  @ApiOperation({ summary: 'Get attendance records with filters' })
  async findAll(@CurrentUser() user: any, @Query() query: any) {
    return this.attendanceService.findAll(query, user.id, user.role?.name);
  }

  // ✔ Get one attendance record
  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.TEACHER,
    UserRole.STUDENT,
  )
  @ApiOperation({ summary: 'Get single attendance record' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.attendanceService.findOne(id, user.id, user.role?.name);
  }

  // ✔ Create single attendance
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Create attendance record' })
  async create(@Body() dto: CreateAttendanceDto, @CurrentUser() user: any) {
    return this.attendanceService.create(dto, user.id, user.role?.name);
  }

  // ✔ Bulk create
  @Post('bulk')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Create bulk attendance records' })
  async createBulk(@Body() dto: BulkAttendanceDto, @CurrentUser() user: any) {
    return this.attendanceService.createBulk(dto, user.id, user.role?.name);
  }

  // ✔ Upload CSV attendance
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
    if (isNaN(parsedDate.getTime()))
      throw new BadRequestException('Invalid date');

    const subjId = subjectId ? Number(subjectId) : undefined;

    return this.attendanceService.createFromCsv(
      file.buffer,
      Number(classId),
      parsedDate,
      subjId,
      user.id,
      user.role?.name,
    );
  }
@Get('parent/:parentUserId')
@Roles(UserRole.PARENT, UserRole.SUPER_ADMIN, UserRole.ADMIN)
@ApiOperation({ summary: 'Get attendance for parent\'s children with filtering' })
@ApiQuery({ name: 'startDate', required: false })
@ApiQuery({ name: 'endDate', required: false })
@ApiQuery({ name: 'studentId', required: false })
@ApiQuery({ name: 'page', required: false })
@ApiQuery({ name: 'limit', required: false })
async getAttendanceForParent(
  @Param('parentUserId', ParseIntPipe) parentUserId: number,
  @Query('startDate') startDate: string,
  @Query('endDate') endDate: string,
  @Query('studentId', ParseIntPipe) studentId: number,
  @Query('page') page: string,
  @Query('limit') limit: string,
  @CurrentUser() user: any,
) {
  // Authorization check
  if (user.role?.name === 'PARENT' && user.id !== parentUserId) {
    throw new ForbiddenException('You can only view your own children\'s attendance');
  }

  return this.attendanceService.getAttendanceForParent(
    parentUserId,
    startDate,
    endDate,
    studentId,
    page ? parseInt(page) : 1,
    limit ? parseInt(limit) : 20,
  );
}
  // ✔ Update attendance
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Update attendance record' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttendanceDto,
    @CurrentUser() user: any,
  ) {
    return this.attendanceService.update(id, dto, user.id);
  }

  // ✔ Delete attendance
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete attendance record' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.attendanceService.remove(id, user.id);
  }

  @Post('mark-absent')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Mark a student absent for a date' })
  markAbsent(
    @Body('studentId', ParseIntPipe) studentId: number,
    @Body('date') date: string,
  ) {
    return this.attendanceService.markAbsent(
      studentId,
      new Date(date),
    );
  }

}
