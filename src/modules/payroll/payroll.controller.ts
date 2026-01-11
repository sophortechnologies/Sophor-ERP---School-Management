import { Controller, Post, Body, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PayrollService } from './payroll.service';
// import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
// import { CreateSalaryComponentDto } from './dto/create-salary-component.dto';
import { GeneratePayrollDto } from './dto/generate-payroll.dto';
import { CreateSalaryStructureDto } from './dto/create-salary-component.dto';
import { CreateSalaryComponentDto } from './dto/create-salary-structure.dto';

@ApiTags('Payroll')
@Controller('payroll')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('structures')
  @ApiOperation({ summary: 'Create salary structure for a staff member' })
  async createStructure(@Body() dto: CreateSalaryStructureDto) {
    return this.payrollService.createSalaryStructure(dto);
  }

  @Post('components')
  @ApiOperation({ summary: 'Add allowance or deduction component' })
  async addComponent(@Body() dto: CreateSalaryComponentDto) {
    return this.payrollService.addSalaryComponent(dto);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate payroll for current month' })
  async generatePayroll(@Body() dto: GeneratePayrollDto, @Req() req) {
    return this.payrollService.generatePayroll(dto, req.user.id);
  }

  // Add more endpoints:
  // GET /payroll/:staffId
  // GET /payroll/:staffId/payslips
  // POST /payroll/:payrollId/approve
  // GET /payroll/:payrollId/payslip/pdf
}