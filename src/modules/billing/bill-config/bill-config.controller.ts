import { Controller, Post, Body, Get, Patch, Param } from '@nestjs/common';
import { BillConfigService } from './bill-config.service';
import { CreateBillConfigDto } from '../dto/create-bill-config.dto';
import { UpdateBillConfigDto } from '../dto/update-bill-config.dto';

@Controller('billing/config')
export class BillConfigController {
  constructor(private readonly service: BillConfigService) {}

  @Post()
  create(@Body() dto: CreateBillConfigDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateBillConfigDto) {
    return this.service.update(+id, dto);
  }
}
