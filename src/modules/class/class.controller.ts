import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  UseGuards,
  ParseIntPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('classes')
@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  // CREATE CLASS
  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async create(@Body() dto: CreateClassDto) {
    return this.classService.createClass(dto);
  }

  // GET ALL CLASSES
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async findAll() {
    return this.classService.findAll();
  }

  // GET ONE CLASS
  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async findOne(@Param('id') id: string) {
    return this.classService.findOne(+id);
  }// create

// update
@Patch(':id')
update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClassDto) {
  return this.classService.update(id, dto);
}

  // DELETE CLASS
@Delete(':id')
@Roles('SUPER_ADMIN', 'ADMIN')
async remove(@Param('id', ParseIntPipe) id: number) {
  return this.classService.remove(id);
}

@Get(':id/capacity')
@Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
async getCapacity(@Param('id', ParseIntPipe) id: number) {
  return this.classService.getClassCapacityUsage(id);
}
}
