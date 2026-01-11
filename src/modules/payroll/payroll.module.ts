import { Module } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';

@Module({
  controllers: [PayrollController],
  providers: [PayrollService, PrismaService],
  exports: [PayrollService],
})
export class PayrollModule {}