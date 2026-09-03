// src/modules/budget/budget.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Res } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { RecordActualDto } from './dto/record-actual.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { BudgetTransferDto } from './dto/budget-transfer.dto';
import { BudgetQueryDto } from './dto/budget-query.dto';
import { BudgetCommitmentDto } from './dto/budget-commitment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { BudgetReportDto, ReportFormat, ReportType } from './dto/budget-report.dto';
import { BudgetReportService } from './budget-report.service';

@ApiTags('Budget')
@ApiBearerAuth()
@Controller('budget')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class BudgetController {
  constructor(private readonly budgetService: BudgetService,
  private readonly budgetReportService: BudgetReportService, 

  ) {}

  // ==================== BUDGET CRUD ====================

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('budget:create')
  @ApiOperation({ summary: 'Create a new budget' })
  @ApiBody({ type: CreateBudgetDto })
  create(@Body() dto: CreateBudgetDto, @Req() req) {
    return this.budgetService.createBudget(dto, req.user.id);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'HOD')
  @Permissions('budget:view')
  @ApiOperation({ summary: 'Get all budgets' })
  findAll(@Query() query: BudgetQueryDto) {
    return this.budgetService.findAll(query);
  }

  @Get('dashboard')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('budget:view')
  @ApiOperation({ summary: 'Get budget dashboard statistics' })
  getDashboardStats(@Query('fiscalYear') fiscalYear: string) {
    return this.budgetService.getDashboardStats(fiscalYear);
  }

  @Get('transfers/pending')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('budget:view')
  @ApiOperation({ summary: 'Get pending budget transfers' })
  getPendingTransfers() {
    return this.budgetService.getPendingTransfers();
  }

  @Get('alerts/active')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('budget:view')
  @ApiOperation({ summary: 'Get active budget alerts' })
  getActiveAlerts() {
    return this.budgetService.getActiveAlerts();
  }

  @Get('department/:departmentId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'HOD')
  @Permissions('budget:view')
  @ApiOperation({ summary: 'Get budget summary by department' })
  getDepartmentSummary(
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @Query('fiscalYear') fiscalYear: string,
  ) {
    return this.budgetService.getDepartmentBudgetSummary(departmentId, fiscalYear);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'HOD')
  @Permissions('budget:view')
  @ApiOperation({ summary: 'Get budget by ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.budgetService.findOne(id);
  }

  @Get(':id/variance')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('budget:view')
  @ApiOperation({ summary: 'Get budget variance report' })
  @ApiParam({ name: 'id', type: Number })
  getVarianceReport(@Param('id', ParseIntPipe) id: number) {
    return this.budgetService.getVarianceReport(id);
  }

  @Get(':id/utilization')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'HOD')
  @Permissions('budget:view')
  @ApiOperation({ summary: 'Get budget utilization details' })
  @ApiParam({ name: 'id', type: Number })
  getUtilization(@Param('id', ParseIntPipe) id: number) {
    return this.budgetService.checkAvailability(id, 0);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('budget:update')
  @ApiOperation({ summary: 'Update budget' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateBudgetDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBudgetDto, @Req() req) {
    return this.budgetService.updateBudget(id, dto, req.user.id);
  }

  // ==================== BUDGET WORKFLOW ====================

  @Post(':id/submit')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'HOD')
  @Permissions('budget:submit')
  @ApiOperation({ summary: 'Submit budget for approval' })
  @ApiParam({ name: 'id', type: Number })
  submit(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.budgetService.submitBudget(id, req.user.id);
  }

  @Post(':id/approve')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('budget:approve')
  @ApiOperation({ summary: 'Approve budget' })
  @ApiParam({ name: 'id', type: Number })
  approve(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.budgetService.approveBudget(id, req.user.id);
  }

  @Post(':id/reject')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('budget:approve')
  @ApiOperation({ summary: 'Reject budget' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ schema: { properties: { reason: { type: 'string' } } } })
  reject(@Param('id', ParseIntPipe) id: number, @Body('reason') reason: string, @Req() req) {
    return this.budgetService.rejectBudget(id, reason, req.user.id);
  }

  @Post(':id/freeze')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('budget:approve')
  @ApiOperation({ summary: 'Freeze budget (no more changes)' })
  @ApiParam({ name: 'id', type: Number })
  freeze(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.budgetService.freezeBudget(id, req.user.id);
  }

  // ==================== BUDGET TRANSFERS ====================

  @Post('transfers/request')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'HOD')
  @Permissions('budget:transfer')
  @ApiOperation({ summary: 'Request budget transfer' })
  @ApiBody({ type: BudgetTransferDto })
  requestTransfer(@Body() dto: BudgetTransferDto, @Req() req) {
    return this.budgetService.requestTransfer(dto, req.user.id);
  }

  @Post('transfers/:id/approve')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('budget:approve')
  @ApiOperation({ summary: 'Approve budget transfer' })
  @ApiParam({ name: 'id', type: Number })
  approveTransfer(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.budgetService.approveTransfer(id, req.user.id);
  }

  @Post('transfers/:id/execute')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('budget:transfer')
  @ApiOperation({ summary: 'Execute approved budget transfer' })
  @ApiParam({ name: 'id', type: Number })
  executeTransfer(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.budgetService.executeTransfer(id, req.user.id);
  }

  @Post('transfers/:id/reject')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('budget:approve')
  @ApiOperation({ summary: 'Reject budget transfer' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ schema: { properties: { reason: { type: 'string' } } } })
  rejectTransfer(@Param('id', ParseIntPipe) id: number, @Body('reason') reason: string, @Req() req) {
    return this.budgetService.rejectTransfer(id, reason, req.user.id);
  }

  // ==================== BUDGET CONTROL (Internal) ====================

  @Post('check-availability/:budgetId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('budget:view')
  @ApiOperation({ summary: 'Check budget availability' })
  @ApiBody({ schema: { properties: { amount: { type: 'number' } } } })
  checkAvailability(
    @Param('budgetId', ParseIntPipe) budgetId: number,
    @Body('amount') amount: number,
  ) {
    return this.budgetService.checkAvailability(budgetId, amount);
  }

  @Post('commit')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('budget:manage')
  @ApiOperation({ summary: 'Create budget commitment (from PO)' })
  @ApiBody({ type: BudgetCommitmentDto })
  commitBudget(@Body() dto: BudgetCommitmentDto, @Req() req) {
    return this.budgetService.commitBudget(dto, req.user.id);
  }

  @Post('commitments/:id/release')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('budget:manage')
  @ApiOperation({ summary: 'Release budget commitment' })
  @ApiParam({ name: 'id', type: Number })
  releaseCommitment(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.budgetService.releaseCommitment(id, req.user.id);
  }

  @Post('alerts/:id/resolve')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Permissions('budget:manage')
  @ApiOperation({ summary: 'Resolve budget alert' })
  @ApiParam({ name: 'id', type: Number })
  resolveAlert(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.budgetService.resolveAlert(id, req.user.id);
  }

@Delete(':id')
@Roles('SUPER_ADMIN')
@Permissions('budget:delete')
@ApiOperation({ summary: 'Delete budget (only if DRAFT)' })
@ApiParam({ name: 'id', type: Number })
async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
  return this.budgetService.deleteBudget(id);
}

@Post('actual')
@Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
@Permissions('budget:manage')
@ApiOperation({ summary: 'Record actual expense (from payment)' })
@ApiBody({ 
  schema: { 
    properties: {
      budgetId: { type: 'number' },
      amount: { type: 'number' },
      referenceType: { type: 'string' },
      referenceId: { type: 'number' },
      description: { type: 'string' }
    }
  }
})
recordActual(@Body() dto: RecordActualDto, @Req() req) {
  return this.budgetService.recordActual(
    dto.budgetId,
    dto.amount,
    dto.referenceType,
    dto.referenceId,
    dto.description,
    req.user.id,
  );
}


@Get('reports/export')
@Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
@Permissions('budget:view')
@ApiOperation({ summary: 'Export budget report (PDF/Excel/CSV)' })
@ApiResponse({ description: 'Report file' })
async exportReport(@Query() dto: BudgetReportDto, @Res() res: Response) {
  const { buffer, filename, contentType } = await this.budgetReportService.generateReport(dto);
  
  res.set({
    'Content-Type': contentType,
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length': buffer.length,
  });
  
  res.send(buffer);
}

@Get('reports/budget-vs-actual')
@Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
@Permissions('budget:view')
@ApiOperation({ summary: 'Get Budget vs Actual data (JSON)' })
async getBudgetVsActual(@Query('fiscalYear') fiscalYear?: string, @Query('departmentId') departmentId?: number) {
  return this.budgetReportService.getBudgetVsActualData(fiscalYear, departmentId);
}

}