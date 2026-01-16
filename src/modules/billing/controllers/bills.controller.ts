// src/modules/billing/controllers/bills.controller.ts

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { BillsService } from '../services/bills.service';
import { CreateBillDto } from '../dto/create-bill.dto';
import { UpdateBillStatusDto } from '../dto/update-bill-status.dto';

@ApiTags('Bills')
@Controller('billing/bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  /** Create a bill */
  @Post()
  create(@Body() dto: CreateBillDto) {
    return this.billsService.create(dto);
  }

  /** Get ALL bills (admin / finance) */
  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.billsService.findAll({ page, limit });
  }

  /** Get bill by ID */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.billsService.findOne(id);
  }

  /** Get bills by student */
  @Get('student/:studentId')
  findByStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.billsService.findByStudent({
      studentId,
      page,
      limit,
    });
  }

  /** Update bill status */
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBillStatusDto,
  ) {
    return this.billsService.updateStatus(id, dto.status);
  }

  /** Delete bill */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.billsService.remove(id);
  }
}
