import { Module } from '@nestjs/common';
import { StaffLeaveService } from './staff-leave.service';
import { StaffLeaveController } from './staff-leave.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [StaffLeaveController],
  providers: [StaffLeaveService, PrismaService],
  exports: [StaffLeaveService],
})
export class StaffLeaveModule {}