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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { PaymentsService } from '../services/payments.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('billing/payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  /** Record a payment — admin/finance staff */
  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @ApiOperation({ summary: 'Record a payment for a bill' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Payment recorded successfully' })
  record(@Body() dto: CreatePaymentDto) {
    return this.service.record(dto);
  }

  /** Get all payments — admin/finance only */
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payments retrieved successfully' })
  findAll() {
    return this.service.findAll();
  }

  /** Get payment by ID — admin/finance/student/parent (for receipt verification) */
  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID', example: 1 })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Payment not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /** Update a payment — admin/finance only */
  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @ApiOperation({ summary: 'Update payment information' })
  @ApiParam({ name: 'id', description: 'Payment ID', example: 1 })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment updated successfully' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.service.update(id, dto);
  }

  /** Delete a payment — super admin only */
  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a payment' })
  @ApiParam({ name: 'id', description: 'Payment ID', example: 1 })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Payment deleted successfully' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
