import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StaffAttendanceService } from './staff-attendance.service';
import { MarkStaffAttendanceDto } from './dto/mark-attendance.dto';
import { UpdateStaffAttendanceDto } from './dto/update-attendance.dto';
import { GetStaffAttendanceDto } from './dto/get-attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Staff Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('staff-attendance')
export class StaffAttendanceController {
  constructor(private readonly service: StaffAttendanceService) {}

  @Post('mark')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @ApiOperation({ summary: 'Mark staff attendance' })
  async mark(@Body() dto: MarkStaffAttendanceDto, @Req() req: any) {
    const recordedById = req.user.id;
    return this.service.markAttendance(dto, recordedById);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @ApiOperation({ summary: 'Update staff attendance record' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffAttendanceDto,
  ) {
    return this.service.updateAttendance(id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Delete staff attendance record' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteAttendance(id);
  }

  @Get('user/:userId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @ApiOperation({ summary: 'Get staff attendance by user ID' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getUserAttendance(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: GetStaffAttendanceDto,
    @Req() req: Request,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
    return this.service.getAttendance({ ...query, userId }, baseUrl);
  }

  @Get('my')
  @Roles('STAFF', 'TEACHER')
  @ApiOperation({ summary: 'Get my own attendance' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getMyAttendance(
    @Req() req: any,
    @Query() query: GetStaffAttendanceDto,
  ) {
    return this.service.getAttendance({ ...query, userId: req.user.id });
  }

  @Get('today-summary')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @ApiOperation({ summary: 'Get today attendance summary' })
  async getTodaySummary(@Query('date') date?: string) {
    return this.service.getTodaySummary(date);
  }

  @Get('report/monthly')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @ApiOperation({ summary: 'Get monthly attendance report' })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'month', required: true })
  @ApiQuery({ name: 'departmentId', required: false })
  async getMonthlyReport(
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('departmentId') departmentId: string,
  ) {
    return this.service.getMonthlyReport(
      parseInt(year),
      parseInt(month),
      departmentId ? parseInt(departmentId) : undefined,
    );
  }
}