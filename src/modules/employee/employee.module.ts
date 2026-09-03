import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { PaginationService } from '../../common/pagination/pagination.service';

@Module({
  imports: [PrismaModule],
  controllers: [EmployeeController],
  providers: [EmployeeService, PaginationService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
