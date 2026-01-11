// staff-attendance.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { StaffAttendanceService } from './staff-attendance.service';
import { MarkStaffAttendanceDto } from './dto/mark-attendance.dto';
import { UpdateStaffAttendanceDto } from './dto/update-attendance.dto';
import { GetStaffAttendanceDto } from './dto/get-attendance.dto';
@Controller('staff-attendance')
export class StaffAttendanceController {
  constructor(private readonly service: StaffAttendanceService) {}

  @Post('mark')
  async mark(@Body() dto: MarkStaffAttendanceDto, @Req() req: any) {
    const recordedById = req.user?.id ?? 1; // Use proper JWT guard in real app
    return this.service.markAttendance(dto, recordedById);
  }
// Only the changed line in controller
@Patch(':id')
async update(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateStaffAttendanceDto,
) {
  return this.service.updateAttendance(id, dto); // Now only 2 args
}


@Get('user/:userId')
getUserAttendance(
  @Param('userId', ParseIntPipe) userId: number,
) {
  return this.service.getAttendance({ userId });
}



  @Get('today-summary')
  async getTodaySummary(@Query('date') date?: string) {
    return this.service.getTodaySummary(date);
  }
}