
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AcademicSessionsService } from './academic-sessions.service';
import { CreateAcademicSessionDto, UpdateAcademicSessionDto } from './dto/create-academic-session.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('academic-sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicSessionsController {
  constructor(private readonly academicSessionsService: AcademicSessionsService) {}

  @Post()
  @Roles('ADMIN', 'REGISTRAR')
  create(@Body() createAcademicSessionDto: CreateAcademicSessionDto) {
    return this.academicSessionsService.create(createAcademicSessionDto);
  }

  @Get()
  @Roles('ADMIN', 'REGISTRAR', 'TEACHER')
  findAll() {
    return this.academicSessionsService.findAll();
  }

  @Get('active')
  @Roles('ADMIN', 'REGISTRAR', 'TEACHER', 'STUDENT')
  findActive() {
    return this.academicSessionsService.findActive();
  }

  @Get(':id')
  @Roles('ADMIN', 'REGISTRAR')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.academicSessionsService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN', 'REGISTRAR')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateAcademicSessionDto: UpdateAcademicSessionDto
  ) {
    return this.academicSessionsService.update(id, updateAcademicSessionDto);
  }

  @Put(':id/activate')
  @Roles('ADMIN', 'REGISTRAR')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.academicSessionsService.activate(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.academicSessionsService.remove(id);
  }
}