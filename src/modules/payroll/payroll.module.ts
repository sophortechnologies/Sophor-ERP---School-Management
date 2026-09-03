import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { BudgetModule } from '../budget/budget.module';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { EmployeePayrollService } from './employee-payroll.service';
import { PayslipPDFService } from './payslip-pdf.service';
import { BankFileService } from './bank-file.service';
import { EthiopianTaxService } from './ethiopian-tax.service';
import { PayrollAnalyticsService } from './payroll-analytics.service';
import { PaginationService } from '../../common/pagination/pagination.service';

@Module({
  imports: [PrismaModule, BudgetModule],
  controllers: [PayrollController],
  providers: [
    PayrollService,
    EmployeePayrollService,
    PayslipPDFService,
    BankFileService,
    EthiopianTaxService,
    PayrollAnalyticsService,
    PaginationService,
  ],
  exports: [PayrollService, EmployeePayrollService],
})
export class PayrollModule {}
