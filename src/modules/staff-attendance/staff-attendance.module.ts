import { Module } from '@nestjs/common';
import { StaffAttendanceService } from './staff-attendance.service';
import { StaffAttendanceController } from './staff-attendance.controller';
import { PrismaModule } from '../../database/prisma.module';
import { HolidayModule } from '../holiday/holiday.module';

@Module({
  imports: [
    PrismaModule,
    HolidayModule,
  ],
  controllers: [StaffAttendanceController],
  providers: [StaffAttendanceService],
  exports: [StaffAttendanceService],
})
export class StaffAttendanceModule {}
