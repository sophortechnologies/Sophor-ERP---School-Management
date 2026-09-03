import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';
import { BudgetControlService } from './budget-control.service';
import { PaginationService } from '../../common/pagination/pagination.service';
import { BudgetReportService } from './budget-report.service';

@Module({
  imports: [PrismaModule],
  controllers: [BudgetController],
  providers: [
    BudgetService,
    BudgetControlService,
    PaginationService,
    BudgetReportService,
  ],
  exports: [BudgetService, BudgetControlService, BudgetReportService],
})
export class BudgetModule {}
