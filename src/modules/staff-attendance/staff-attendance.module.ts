import { Module } from '@nestjs/common';
import { StaffAttendanceService } from './staff-attendance.service';
import { StaffAttendanceController } from './staff-attendance.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [StaffAttendanceController],
  providers: [StaffAttendanceService, PrismaService],
  exports: [StaffAttendanceService],
})
export class StaffAttendanceModule {}