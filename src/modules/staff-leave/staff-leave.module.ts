import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { StaffLeaveService } from './staff-leave.service';
import { StaffLeaveController } from './staff-leave.controller';

@Module({
  imports: [PrismaModule],
  controllers: [StaffLeaveController],
  providers: [StaffLeaveService],
  exports: [StaffLeaveService],
})
export class StaffLeaveModule {}
