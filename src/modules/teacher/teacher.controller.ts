import { Controller, Get, Req, Query, Post, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { TeacherService } from './teacher.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags("Teacher")
@Controller('teacher')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeacherController {
  constructor(private readonly service: TeacherService) {}

  @Get('dashboard')
  @Roles('TEACHER')
  async dashboard(@Req() req: any, @Query() query: any) {
    const userId = Number(req.user?.sub ?? req.user?.id);
    return this.service.getDashboard(userId, query);
  }

  @Post('classes/:classId/attendance')
  @Roles('TEACHER')
  async markAttendance(
    @Req() req: any,
    @Param('classId', ParseIntPipe) classId: number,
    @Body() body: { records: { studentId: number; status: string }[] }
  ) {
    const userId = Number(req.user?.sub ?? req.user?.id);
    return this.service.markAttendance(userId, classId, body.records);
  }
}
