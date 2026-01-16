// staff-attendance.controller.ts
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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { StaffAttendanceService } from './staff-attendance.service';
import { MarkStaffAttendanceDto } from './dto/mark-attendance.dto';
import { UpdateStaffAttendanceDto } from './dto/update-attendance.dto';
import { GetStaffAttendanceDto } from './dto/get-attendance.dto';

@ApiTags('staff-attendance')
@ApiBearerAuth()
@Controller('staff-attendance')
export class StaffAttendanceController {
  constructor(private readonly service: StaffAttendanceService) {}

  @Post('mark')
  async mark(@Body() dto: MarkStaffAttendanceDto, @Req() req: any) {
    const recordedById = req.user?.id ?? 1; // Use proper JWT guard in real app
    return this.service.markAttendance(dto, recordedById);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffAttendanceDto,
  ) {
    return this.service.updateAttendance(id, dto);
  }

  // 🗑️ DELETE attendance record
  @Delete(':id')
  @ApiOperation({ summary: 'Delete staff attendance record' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteAttendance(id);
  }

  @Get('user/:userId')
  getUserAttendance(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: GetStaffAttendanceDto,
  ) {
    return this.service.getAttendance({ ...query, userId });
  }

  @Get('today-summary')
  async getTodaySummary(@Query('date') date?: string) {
    return this.service.getTodaySummary(date);
  }
}
