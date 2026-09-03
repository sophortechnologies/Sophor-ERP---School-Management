
import {
  Controller,
  Get,
  Req,
  Query,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { TeacherService } from './teacher.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RegisterTeacherDto } from './dto/register-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
@ApiTags('Teacher')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  /**
   * ✅ Teacher dashboard
   * - JWT → userId
   * - Role protected (TEACHER)
   */
  @Get('dashboard')
  @Roles("SUPER_ADMIN",'ADMIN','TEACHER')
  @ApiOperation({ summary: 'Get teacher dashboard' })
  async dashboard(@Req() req: any, @Query() query: any) {
    const userId = Number(req.user.sub); // ✅ JWT standard
    return this.teacherService.getDashboard(userId, query);
  }

  /**
   * ✅ Mark attendance
   * - Teacher must be assigned to class
   */
  @Post('classes/:classId/attendance')
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Mark student attendance' })
  @ApiBody({
    schema: {
      example: {
        records: [
          { studentId: 12, status: 'PRESENT' },
          { studentId: 15, status: 'ABSENT' },
        ],
      },
    },
  })
  async markAttendance(
    @Req() req: any,
    @Param('classId', ParseIntPipe) classId: number,
    @Body()
    body: {
      records: { studentId: number; status: string }[];
    },
  ) {
    const userId = Number(req.user.sub);
    return this.teacherService.markAttendance(
      userId,
      classId,
      body.records,
    );
  }

  @Post('register')
  @Roles('TEACHER',"SUPER_ADMIN",'ADMIN')

@ApiOperation({ summary: 'Register a new teacher' })
async registerTeacher(@Body() dto: RegisterTeacherDto) {
  return this.teacherService.registerTeacher(dto);
}


@Patch(':id')
@Roles('TEACHER',"SUPER_ADMIN",'ADMIN')

@ApiOperation({ summary: 'Update teacher profile' })
async updateTeacher(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateTeacherDto,
) {
  return this.teacherService.updateTeacher(id, dto);
}

@Get()
@Roles('TEACHER',"SUPER_ADMIN",'ADMIN')

async findAll(
  @Query('page') page?: string,
  @Query('page_size') pageSize?: string,
) {
  return this.teacherService.findAllTeachers(
    page ? Number(page) : 1,
    pageSize ? Number(pageSize) : 10,
  );
}

@Get(':id')
@Roles('TEACHER',"SUPER_ADMIN",'ADMIN')

async findOne(@Param('id', ParseIntPipe) id: number) {
  return this.teacherService.findOneTeacher(id);
}
/**
 * Assign teacher to a class (as class teacher)
 */
@Post(':id/assign-class')
@Roles('SUPER_ADMIN', 'ADMIN')
@ApiOperation({ summary: 'Assign teacher as class teacher' })
async assignToClass(
  @Param('id', ParseIntPipe) teacherId: number,
  @Body('classId', ParseIntPipe) classId: number,
) {
  return this.teacherService.assignTeacherToClass(teacherId, classId);
}

/**
 * Assign teacher to a subject in a class
 */
@Post(':id/assign-subject')
@Roles('SUPER_ADMIN', 'ADMIN')
@ApiOperation({ summary: 'Assign teacher to teach a subject in a class' })
async assignToSubject(
  @Param('id', ParseIntPipe) teacherId: number,
  @Body('classId', ParseIntPipe) classId: number,
  @Body('subjectId', ParseIntPipe) subjectId: number,
) {
  return this.teacherService.assignTeacherToSubject(teacherId, classId, subjectId);
}

/**
 * Get all assignments for a teacher
 */
@Get(':id/assignments')
@Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
@ApiOperation({ summary: 'Get teacher assignments' })
async getAssignments(@Param('id', ParseIntPipe) teacherId: number) {
  return this.teacherService.getTeacherAssignments(teacherId);
}

/**
 * Remove a teacher assignment
 */
@Delete('assignments/:assignmentId')
@Roles('SUPER_ADMIN', 'ADMIN')
@ApiOperation({ summary: 'Remove teacher assignment' })
async removeAssignment(@Param('assignmentId', ParseIntPipe) assignmentId: number) {
  return this.teacherService.removeTeacherAssignment(assignmentId);
}

}
