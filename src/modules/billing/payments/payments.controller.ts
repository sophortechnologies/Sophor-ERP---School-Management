import { Controller, Post, Body, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@Controller('billing/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Record a payment
   */
  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPayment(dto);
  }

  /**
   * Get all payments for a bill
   */
  @Get('bill/:billId')
  findByBill(@Param('billId', ParseIntPipe) billId: number) {
    return this.paymentsService.getPaymentsByBill(billId);
  }

  /**
   * Get all payments for a student
   */
  @Get('student/:studentId')
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.paymentsService.getPaymentsByStudent(studentId);
  }
}
