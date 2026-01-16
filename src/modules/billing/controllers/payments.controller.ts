// src/modules/billing/controllers/payments.controller.ts

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

import { PaymentsService } from '../services/payments.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';

@ApiTags('Payments')
@Controller('billing/payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  /**
   * Create / Record a payment
   */
  @Post()
  @ApiOperation({ summary: 'Record a payment for a bill' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment recorded successfully',
  })
  record(@Body() dto: CreatePaymentDto) {
    return this.service.record(dto);
  }

  /**
   * Get all payments
   */
  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payments retrieved successfully',
  })
  findAll() {
    return this.service.findAll();
  }

  /**
   * Get payment by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /**
   * Update a payment
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update payment information' })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment updated successfully',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.service.update(id, dto);
  }

  /**
   * Delete a payment
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a payment' })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Payment deleted successfully',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
