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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { BillConfigService } from '../services/bill-config.service';
import { CreateBillConfigDto } from '../dto/create-bill-config.dto';
import { UpdateBillConfigDto } from '../dto/update-bill-config.dto';

@ApiTags('Bill Configurations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('billing/configs')
export class BillConfigController {
  constructor(private readonly service: BillConfigService) {}

  /** Create bill configuration — admin only */
  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @ApiOperation({ summary: 'Create bill configuration' })
  create(@Body() dto: CreateBillConfigDto) {
    return this.service.create(dto);
  }

  /** Get all bill configurations — admin/finance */
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @ApiOperation({ summary: 'Get all bill configurations' })
  findAll() {
    return this.service.findAll();
  }

  /** Get bill configuration by ID — admin/finance */
  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @ApiOperation({ summary: 'Get bill configuration by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /**
   * Get bill configuration by class — admin/finance/teacher
   * Teachers need to know fee structure for their class
   */
  @Get('class/:classId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'TEACHER')
  @ApiOperation({ summary: 'Get bill configurations for a class' })
  findByClass(@Param('classId', ParseIntPipe) classId: number) {
    return this.service.findByClass(classId);
  }

  /** Update bill configuration — admin/finance only */
  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @ApiOperation({ summary: 'Update bill configuration' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBillConfigDto,
  ) {
    return this.service.update(id, dto);
  }

  /** Delete bill configuration — super admin only */
  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete bill configuration' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
