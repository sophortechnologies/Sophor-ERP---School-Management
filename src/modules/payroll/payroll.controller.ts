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
import { GeneratePayrollDto } from './dto/generate-payroll.dto';
import { CreateSalaryComponentDto } from './dto/create-salary-component.dto';
import { UpdateSalaryComponentDto } from './dto/update-salary-component.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Payroll')
@ApiBearerAuth()
@Controller('payroll')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  // =====================================================
  // SALARY COMPONENTS (FULL CRUD – BELONGS TO PAYROLL)
  // =====================================================

  @Post('components')
  @ApiOperation({ summary: 'Create salary component (allowance / deduction)' })
  createComponent(@Body() dto: CreateSalaryComponentDto) {
    return this.payrollService.createSalaryComponent(dto);
  }

  @Get('components/structure/:structureId')
  @ApiOperation({ summary: 'Get components by salary structure' })
  getComponentsByStructure(
    @Param('structureId', ParseIntPipe) structureId: number,
  ) {
    return this.payrollService.getComponentsByStructure(structureId);
  }

  @Patch('components/:id')
  @ApiOperation({ summary: 'Update salary component' })
  updateComponent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSalaryComponentDto,
  ) {
    return this.payrollService.updateSalaryComponent(id, dto);
  }

  @Delete('components/:id')
  @ApiOperation({ summary: 'Delete salary component' })
  deleteComponent(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.payrollService.deleteSalaryComponent(id);
  }

  // =====================================================
  // PAYROLL GENERATION
  // =====================================================

  @Post('generate')
  @ApiOperation({
    summary: 'Generate payroll from active salary structure',
  })
  generatePayroll(
    @Body() dto: GeneratePayrollDto,
    @Req() req: any,
  ) {
    
    return this.payrollService.generatePayroll(dto, req.user.id);
  }

  // =====================================================
  // PAYROLL QUERIES
  // =====================================================

  @Get()
  @ApiOperation({ summary: 'Get all payrolls' })
  getAllPayrolls() {
    return this.payrollService.getAllPayrolls();
  }

  @Get('staff/:staffId')
  @ApiOperation({ summary: 'Get payrolls for a staff member' })
  getStaffPayrolls(
    @Param('staffId', ParseIntPipe) staffId: number,
  ) {
    return this.payrollService.getStaffPayrolls(staffId);
  }

  @Get(':payrollId')
  @ApiOperation({ summary: 'Get payroll by ID' })
  getPayrollById(
    @Param('payrollId', ParseIntPipe) payrollId: number,
  ) {
    return this.payrollService.getPayrollById(payrollId);
  }

  // =====================================================
  // PAYSLIPS (READ ONLY)
  // =====================================================

  @Get('staff/:staffId/payslips')
  @ApiOperation({ summary: 'Get payslips for a staff member' })
  getStaffPayslips(
    @Param('staffId', ParseIntPipe) staffId: number,
  ) {
    return this.payrollService.getStaffPayslips(staffId);
  }

  @Get(':payrollId/payslip')
  @ApiOperation({ summary: 'Get payslip by payroll ID' })
  getPayslip(
    @Param('payrollId', ParseIntPipe) payrollId: number,
  ) {
    return this.payrollService.getPayslipByPayroll(payrollId);
  }
}
