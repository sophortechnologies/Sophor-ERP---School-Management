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
import { TimetableService } from './timetable.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Timetable')
@ApiBearerAuth()
@Controller('timetables')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimetableController {
  constructor(private readonly service: TimetableService) {}

  // ================================
  // CREATE TIMETABLE SLOT
  // ================================
  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a timetable slot' })
  create(@Body() dto: CreateTimetableDto) {
    return this.service.create(dto);
  }

  // ================================
  // GET ALL TIMETABLES
  // ================================
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get all timetable slots' })
  findAll() {
    return this.service.findAll();
  }

  // ================================
  // GET TIMETABLE BY SECTION
  // ================================
  @Get('section/:sectionId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get timetable by section' })
  findBySection(
    @Param('sectionId', ParseIntPipe) sectionId: number,
  ) {
    return this.service.findBySection(sectionId);
  }

  // ================================
  // UPDATE TIMETABLE SLOT
  // ================================
  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update a timetable slot' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTimetableDto,
  ) {
    return this.service.update(id, dto);
  }

  // ================================
  // DELETE TIMETABLE SLOT
  // ================================
  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a timetable slot' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
