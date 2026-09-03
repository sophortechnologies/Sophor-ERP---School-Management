import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EmployeeAttendanceService } from './employee-attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Employee Attendance')
@ApiBearerAuth()
@Controller('employee-attendance')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class EmployeeAttendanceController {
  constructor(private readonly attendanceService: EmployeeAttendanceService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR', 'TEACHER', 'STAFF')
  @Permissions('attendance:mark')
  @ApiOperation({ summary: 'Mark attendance for an employee' })
  markAttendance(@Body() dto: MarkAttendanceDto, @Req() req) {
    return this.attendanceService.markAttendance(dto, req.user.id);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @Permissions('attendance:view')
  @ApiOperation({ summary: 'Get all attendance records' })
  findAll(@Query() query: AttendanceQueryDto) {
    return this.attendanceService.getAttendance(query);
  }

  @Get('today/summary')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @Permissions('attendance:view')
  @ApiOperation({ summary: 'Get today\'s attendance summary' })
  getTodaySummary() {
    return this.attendanceService.getTodaySummary();
  }

  @Get('report/monthly')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @Permissions('attendance:view')
  @ApiOperation({ summary: 'Get monthly attendance report' })
  getMonthlyReport(
    @Query('year') year: number,
    @Query('month') month: number,
    @Query('departmentId') departmentId?: number,
  ) {
    return this.attendanceService.getMonthlyReport(year, month, departmentId);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @Permissions('attendance:update')
  @ApiOperation({ summary: 'Update attendance record' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAttendanceDto) {
    return this.attendanceService.updateAttendance(id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('attendance:delete')
  @ApiOperation({ summary: 'Delete attendance record' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.deleteAttendance(id);
  }
}