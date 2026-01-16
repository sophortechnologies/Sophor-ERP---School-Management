import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { SalaryStructureController } from './salary-structure.controller';
import { SalaryStructureService } from './salary-structure.service';

@Module({
  imports: [PrismaModule],
  controllers: [SalaryStructureController], 
  providers: [SalaryStructureService],      
  exports: [SalaryStructureService],
})
export class SalaryStructureModule {}
