
import { Controller, Post, Get, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SalaryStructureService } from './salary-structure.service';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { UpdateSalaryStructureDto } from './dto/update-salary-structure.dto';

@ApiTags('Salary Structure')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('salary-structures')
export class SalaryStructureController {
  constructor(private readonly service: SalaryStructureService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR', 'FINANCE')
  @ApiOperation({ summary: 'Create salary structure' })
  create(@Body() dto: CreateSalaryStructureDto) {
    return this.service.create(dto);
  }

  @Get('user/:userId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR', 'FINANCE')
  @ApiOperation({ summary: 'Get salary structures by user' })
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.findByUser(userId);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR', 'FINANCE')
  @ApiOperation({ summary: 'Update salary structure' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSalaryStructureDto,
  ) {
    return this.service.update(id, dto);
  }

  @Patch(':id/deactivate')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @ApiOperation({ summary: 'Deactivate salary structure' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.service.deactivate(id);
  }
}
