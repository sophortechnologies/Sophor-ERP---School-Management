// src/modules/billing/billing.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { BillingService, 
  CreateBillConfigDto,
  GenerateCompositeBillDto,
  RecordPaymentDto,
  GetStudentBillsDto,
} from './billing.service';
import { BillStatus } from './billing.service'; // enums are exported from service
@ApiTags('Billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // =======================
  // BILL CONFIGURATION
  // =======================

  @Post('config')
  async createBillConfig(@Body() dto: CreateBillConfigDto) {
    return this.billingService.createBillConfig(dto);
  }

  @Get('config/class/:classId')
  async getBillConfigsByClass(@Param('classId', ParseIntPipe) classId: number) {
    return this.billingService.getBillConfigsByClass(classId);
  }

  // =======================
  // BILLS
  // =======================

  @Post('bills')
  async generateBill(@Body() dto: GenerateCompositeBillDto) {
    return this.billingService.generateBill(dto);
  }

  @Get('students/:studentId/bills')
  async getStudentBills(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    return this.billingService.getStudentBills({
      studentId,
      page,
      limit,
    });
  }

  @Patch('bills/:billId/status')
  async updateBillStatus(
    @Param('billId', ParseIntPipe) billId: number,
    @Body('status') status: BillStatus,
  ) {
    return this.billingService.updateBillStatus(billId, status);
  }

  // =======================
  // PAYMENTS
  // =======================

  @Post('payments')
  async recordPayment(@Body() dto: RecordPaymentDto) {
    return this.billingService.recordPayment(dto);
  }
}