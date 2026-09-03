import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { HolidayModule } from '../holiday/holiday.module';
import { EmployeeAttendanceController } from './employee-attendance.controller';
import { EmployeeAttendanceService } from './employee-attendance.service';

@Module({
  imports: [PrismaModule, HolidayModule],
  controllers: [EmployeeAttendanceController],
  providers: [EmployeeAttendanceService],
  exports: [EmployeeAttendanceService],
})
export class EmployeeAttendanceModule {}
