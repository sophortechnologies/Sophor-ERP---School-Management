import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  ParseIntPipe,
  UseGuards,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { TimetableService } from './timetable.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Timetable')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('timetables')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a timetable slot' })
  create(@Body() dto: CreateTimetableDto) {
    return this.timetableService.create(dto);
  }

  @Post('generate')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'FR7.4: Auto-generate timetable for a class' })
  async autoGenerate(
    @Body('classId', ParseIntPipe) classId: number,
    @Body('academicSessionId', ParseIntPipe) academicSessionId: number,
  ) {
    return this.timetableService.autoGenerateTimetable(classId, academicSessionId);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get all timetable slots' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'page_size', required: false })
  async findAll(
    @Query('page') page: string,
    @Query('page_size') pageSize: string,
    @Req() req: any,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
    return this.timetableService.findAll(
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 10,
      baseUrl,
    );
  }

  @Get('section/:sectionId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT')
  @ApiOperation({ summary: 'Get timetable by section' })
  findBySection(@Param('sectionId', ParseIntPipe) sectionId: number) {
    return this.timetableService.findBySection(sectionId);
  }

  @Get('teacher/:teacherId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get timetable by teacher' })
  findByTeacher(@Param('teacherId', ParseIntPipe) teacherId: number) {
    return this.timetableService.findByTeacher(teacherId);
  }

  @Get('my')
  @Roles('STUDENT', 'TEACHER')
  @ApiOperation({ summary: 'FR7.7: Get logged-in user timetable' })
  async findMyTimetable(@Req() req: any) {
    const user = req.user;
    if (user.role?.name === 'STUDENT') {
      const student = await this.timetableService.getStudentByUserId(user.id);
      return this.timetableService.findBySection(student.sectionId);
    }
    if (user.role?.name === 'TEACHER') {
      const teacher = await this.timetableService.getTeacherByUserId(user.id);
      return this.timetableService.findByTeacher(teacher.id);
    }
    return [];
  }

  @Get('export/:sectionId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'FR7.6: Export timetable to Excel' })
  async exportTimetable(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Res() res: Response,
  ) {
    const buffer = await this.timetableService.exportToExcel(sectionId);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=timetable_section_${sectionId}.xlsx`,
    });
    res.send(buffer);
  }

  @Post('archive/:classId')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'FR7.8: Archive current timetable' })
  async archiveTimetable(
    @Param('classId', ParseIntPipe) classId: number,
    @Body('academicSessionId', ParseIntPipe) academicSessionId: number,
  ) {
    return this.timetableService.archiveCurrentTimetable(classId, academicSessionId);
  }

  @Get('history/:sectionId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'FR7.8: Get historical timetable' })
  async getHistoricalTimetable(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Query('academicSessionId', ParseIntPipe) academicSessionId: number,
  ) {
    return this.timetableService.getHistoricalTimetable(sectionId, academicSessionId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get timetable slot by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.timetableService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update a timetable slot' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTimetableDto,
  ) {
    return this.timetableService.update(id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a timetable slot' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.timetableService.remove(id);
  }
}