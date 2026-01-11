import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { BillsService } from './bills.service';
import { CreateBillDto } from '../dto/create-bill.dto';

@Controller('billing/bills')
export class BillsController {
  constructor(private readonly service: BillsService) {}

  @Post()
  create(@Body() dto: CreateBillDto) {
    return this.service.create(dto);
  }

  @Get('student/:id')
  findByStudent(@Param('id') id: number) {
    return this.service.findByStudent(+id);
  }
}
