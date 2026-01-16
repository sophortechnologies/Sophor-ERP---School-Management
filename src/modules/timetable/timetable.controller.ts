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
  Req,
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
  constructor(private readonly timetableService: TimetableService) {}

  // =====================================
  // CREATE TIMETABLE SLOT
  // =====================================
  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a timetable slot' })
  create(@Body() dto: CreateTimetableDto) {
    return this.timetableService.create(dto);
  }

  // =====================================
  // GET ALL TIMETABLES (ADMIN)
  // =====================================
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Get all timetable slots' })
  findAll() {
    return this.timetableService.findAll();
  }

  // =====================================
  // GET TIMETABLE BY SECTION
  // =====================================
  @Get('section/:sectionId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get timetable by section' })
  findBySection(
    @Param('sectionId', ParseIntPipe) sectionId: number,
  ) {
    return this.timetableService.findBySection(sectionId);
  }

  // =====================================
  // GET TIMETABLE BY TEACHER
  // =====================================
  @Get('teacher/:teacherId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get timetable by teacher' })
  findByTeacher(
    @Param('teacherId', ParseIntPipe) teacherId: number,
  ) {
    return this.timetableService.findByTeacher(teacherId);
  }

  // =====================================
  // GET CURRENT STUDENT TIMETABLE
  // =====================================
  @Get('my')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Get logged-in student timetable' })
  findMyTimetable(@Req() req: any) {
    return this.timetableService.findBySection(req.user.sectionId);
  }

// =====================================
// GET TIMETABLE SLOT BY ID
// =====================================
@Get(':id')
@Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
@ApiOperation({ summary: 'Get timetable slot by ID' })
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.timetableService.findOne(id);
}


  // =====================================
  // UPDATE TIMETABLE SLOT
  // =====================================
  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update a timetable slot' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTimetableDto,
  ) {
    return this.timetableService.update(id, dto);
  }

  // =====================================
  // DELETE TIMETABLE SLOT
  // =====================================
  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a timetable slot' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.timetableService.remove(id);
  }
}
