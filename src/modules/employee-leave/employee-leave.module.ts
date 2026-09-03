import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { EmployeeLeaveController } from './employee-leave.controller';
import { EmployeeLeaveService } from './employee-leave.service';

@Module({
  imports: [PrismaModule],
  controllers: [EmployeeLeaveController],
  providers: [EmployeeLeaveService],
  exports: [EmployeeLeaveService],
})
export class EmployeeLeaveModule {}
