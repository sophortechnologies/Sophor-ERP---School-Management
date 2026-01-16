// src/modules/billing/controllers/bill-config.controller.ts

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';

import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BillConfigService } from '../services/bill-config.service';
import { CreateBillConfigDto } from '../dto/create-bill-config.dto';
import { UpdateBillConfigDto } from '../dto/update-bill-config.dto';

@ApiTags('Bill Configurations')
@Controller('billing/configs')
export class BillConfigController {
  constructor(private readonly service: BillConfigService) {}

  /** Create bill configuration */
  @Post()
  @ApiOperation({ summary: 'Create bill configuration' })
  create(@Body() dto: CreateBillConfigDto) {
    return this.service.create(dto);
  }

  /** Get all bill configurations */
  @Get()
  findAll() {
    return this.service.findAll();
  }

  /** Get bill configuration by ID */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /** Get bill configuration by class */
  @Get('class/:classId')
  findByClass(@Param('classId', ParseIntPipe) classId: number) {
    return this.service.findByClass(classId);
  }

  /** Update bill configuration */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBillConfigDto,
  ) {
    return this.service.update(id, dto);
  }

  /** Delete bill configuration */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
