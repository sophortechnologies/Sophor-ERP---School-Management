
import { 
  Controller, Get, Post, Body, Param, Put, Delete, UseGuards, ParseIntPipe, Patch 
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('admission')
  @Roles('ADMIN', 'REGISTRAR')
  createAdmission(@Body() createStudentDto: CreateStudentDto, @Body('userId') userId: string) {
    return this.studentsService.createStudentAdmission(createStudentDto, userId);
  }

  @Get()
  @Roles('ADMIN', 'REGISTRAR', 'TEACHER')
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'REGISTRAR', 'TEACHER')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'REGISTRAR')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.remove(id);
  }
}