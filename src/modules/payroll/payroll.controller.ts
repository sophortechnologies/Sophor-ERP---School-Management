import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { PayrollService } from './payroll.service';
import { EmployeePayrollService } from './employee-payroll.service';
import { GeneratePayrollDto } from './dto/generate-payroll.dto';
import { CreateSalaryComponentDto } from './dto/create-salary-component.dto';
import { UpdateSalaryComponentDto } from './dto/update-salary-component.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { BadRequestException } from '@nestjs/common';
import { Query } from '@nestjs/common';
import { EthiopianTaxService } from './ethiopian-tax.service';
import { BankFileService } from './bank-file.service';
import { PayslipPDFService } from './payslip-pdf.service';
import { PayrollAnalyticsService } from './payroll-analytics.service';

@ApiTags('Payroll')
@ApiBearerAuth()
@Controller('payroll')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class PayrollController {
  constructor(
  private readonly payrollService: PayrollService,
  private readonly employeePayrollService: EmployeePayrollService,
  private readonly payslipPDFService: PayslipPDFService,
  private readonly bankFileService: BankFileService,
  private readonly ethiopianTaxService: EthiopianTaxService,
  private readonly payrollAnalyticsService: PayrollAnalyticsService,
) {}

  // =====================================================
  // SALARY COMPONENTS (FULL CRUD – BELONGS TO PAYROLL)
  // =====================================================

  @Post('components')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @Permissions('payroll:manage')
  @ApiOperation({ summary: 'Create salary component (allowance / deduction)' })
  createComponent(@Body() dto: CreateSalaryComponentDto) {
    return this.payrollService.createSalaryComponent(dto);
  }

  @Get('components/structure/:structureId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR', 'FINANCE')
  @Permissions('payroll:view')
  @ApiOperation({ summary: 'Get components by salary structure' })
  getComponentsByStructure(
    @Param('structureId', ParseIntPipe) structureId: number,
  ) {
    return this.payrollService.getComponentsByStructure(structureId);
  }

  @Patch('components/:id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @Permissions('payroll:manage')
  @ApiOperation({ summary: 'Update salary component' })
  updateComponent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSalaryComponentDto,
  ) {
    return this.payrollService.updateSalaryComponent(id, dto);
  }

  @Delete('components/:id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @Permissions('payroll:manage')
  @ApiOperation({ summary: 'Delete salary component' })
  deleteComponent(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.payrollService.deleteSalaryComponent(id);
  }

  // =====================================================
  // PAYROLL GENERATION (LEGACY - STAFF ONLY)
  // =====================================================

  @Post('generate')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('payroll:create')
  @ApiOperation({
    summary: 'Generate payroll from active salary structure (Staff only)',
  })
  generatePayroll(
    @Body() dto: GeneratePayrollDto,
    @Req() req: any,
  ) {
    return this.payrollService.generatePayroll(dto, req.user.id);
  }

  // =====================================================
  // PAYROLL QUERIES (LEGACY)
  // =====================================================

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'HR')
  @Permissions('payroll:view')
  @ApiOperation({ summary: 'Get all payrolls' })
  getAllPayrolls() {
    return this.payrollService.getAllPayrolls();
  }

  @Get('staff/:staffId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'HR')
  @Permissions('payroll:view')
  @ApiOperation({ summary: 'Get payrolls for a staff member' })
  getStaffPayrolls(
    @Param('staffId', ParseIntPipe) staffId: number,
  ) {
    return this.payrollService.getStaffPayrolls(staffId);
  }

  @Get(':payrollId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'HR')
  @Permissions('payroll:view')
  @ApiOperation({ summary: 'Get payroll by ID' })
  getPayrollById(
    @Param('payrollId', ParseIntPipe) payrollId: number,
  ) {
    return this.payrollService.getPayrollById(payrollId);
  }

  @Get('staff/:staffId/payslips')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'HR', 'STAFF')
  @Permissions('payroll:view')
  @ApiOperation({ summary: 'Get payslips for a staff member' })
  getStaffPayslips(
    @Param('staffId', ParseIntPipe) staffId: number,
  ) {
    return this.payrollService.getStaffPayslips(staffId);
  }

  @Get(':payrollId/payslip')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'HR', 'STAFF')
  @Permissions('payroll:view')
  @ApiOperation({ summary: 'Get payslip by payroll ID' })
  getPayslip(
    @Param('payrollId', ParseIntPipe) payrollId: number,
  ) {
    return this.payrollService.getPayslipByPayroll(payrollId);
  }


  @Post('runs/generate')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('payroll:create')
  @ApiOperation({ summary: 'Generate monthly payroll for all employees' })
  generatePayrollRun(
    @Body('month') month: number,
    @Body('year') year: number,
    @Req() req,
  ) {
    return this.employeePayrollService.generatePayroll(month, year, req.user.id);
  }

  @Post('runs/:id/approve')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('payroll:approve')
  @ApiOperation({ summary: 'Approve payroll run' })
  approvePayrollRun(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ) {
    return this.employeePayrollService.approvePayroll(id, req.user.id);
  }

  @Get('runs/:id/records')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'HR')
  @Permissions('payroll:view')
  @ApiOperation({ summary: 'Get payroll records for a run' })
  getPayrollRecords(@Param('id', ParseIntPipe) id: number) {
    return this.employeePayrollService.getPayrollRecords(id);
  }

  // Add these to your payroll.controller.ts

@Get('bank-file/:payrollRunId')
@Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
@Permissions('payroll:view')
async generateBankFile(@Param('payrollRunId', ParseIntPipe) payrollRunId: number, @Query('bank') bank: string) {
  if (bank === 'CBE') {
    const filePath = await this.bankFileService.generateCBEBulkFile(payrollRunId);
    return { message: 'Bank file generated', filePath };
  } else if (bank === 'DASHEN') {
    const filePath = await this.bankFileService.generateDashenBankFile(payrollRunId);
    return { message: 'Bank file generated', filePath };
  }
  throw new BadRequestException('Invalid bank name. Use CBE or DASHEN');
}

@Post('payslip/:payrollRecordId/generate')
@Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
@Permissions('payroll:view')
async generatePayslip(@Param('payrollRecordId', ParseIntPipe) payrollRecordId: number) {
  const filePath = await this.payslipPDFService.generatePayslip(payrollRecordId);
  return { message: 'Payslip generated', filePath };
}

@Post('payslip/bulk/:payrollRunId')
@Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
@Permissions('payroll:manage')
async generateBulkPayslips(@Param('payrollRunId', ParseIntPipe) payrollRunId: number) {
  const filePaths = await this.payslipPDFService.generateBulkPayslips(payrollRunId);
  return { message: `${filePaths.length} payslips generated`, filePaths };
}

@Get('dashboard/analytics')
@Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
@Permissions('payroll:view')
async getPayrollAnalytics(@Query('year') year?: number, @Query('month') month?: number) {
  return this.payrollAnalyticsService.getPayrollDashboard(year, month);
}

@Post('calculate-tax')
@Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
@Permissions('payroll:view')
async calculateTax(@Body('grossSalary') grossSalary: number) {
  const tax = this.ethiopianTaxService.calculateIncomeTax(grossSalary);
  const pension = this.ethiopianTaxService.calculatePension(grossSalary);
  return { grossSalary, incomeTax: tax, employeePension: pension.employee, employerPension: pension.employer };
}


}