import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { PrismaModule } from '../../database/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { HolidayModule } from '../holiday/holiday.module';

// SERVICES
import { AuditService } from '../../common/services/audit.service';

@Module({
  imports: [
    PrismaModule,
    NotificationModule, 
    HolidayModule
  ],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    AuditService,
  ],
  exports: [AttendanceService],
})
export class AttendanceModule {}
