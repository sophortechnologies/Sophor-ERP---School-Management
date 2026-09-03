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
  Req,
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
import { BillsService } from '../services/bills.service';
import { CreateBillDto } from '../dto/create-bill.dto';
import { UpdateBillStatusDto } from '../dto/update-bill-status.dto';

@ApiTags('Bills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('billing/bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  /** Create a bill — admin/finance only */
  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @ApiOperation({ summary: 'Create a bill for a student' })
  create(@Body() dto: CreateBillDto, @Req() req) {
    return this.billsService.create(dto, req.user.id);
  }

  /** Get ALL bills — admin/finance only */
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @ApiOperation({ summary: 'Get all bills (admin/finance)' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.billsService.findAll({ page, limit });
  }

  /** Get bill by ID — admin/finance/student/parent (students need to see their own bill) */
  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Get bill by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.billsService.findOne(id);
  }

  /** Get bills by student — admin/finance/student/parent */
  @Get('student/:studentId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'STUDENT', 'PARENT')
  @ApiOperation({ summary: 'Get bills for a specific student' })
  findByStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.billsService.findByStudent({ studentId, page, limit });
  }

  /** Update bill status — admin/finance only */
  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @ApiOperation({ summary: 'Update bill status' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBillStatusDto,
  ) {
    return this.billsService.updateStatus(id, dto.status);
  }

  /** Delete bill — super admin only */
  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a bill' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.billsService.remove(id);
  }
}
