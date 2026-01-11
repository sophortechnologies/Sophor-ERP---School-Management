
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Req,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ParentService } from './parent.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { CreateParentDto } from './dto/create-parent.dto';
import { RegisterParentDto } from './dto/register-parent.dto';
import { UpdateParentDto } from './dto/update-parent.dto';

@ApiTags('Parent')
@ApiBearerAuth()
@Controller('parent')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  /* =========================
     ADMIN / SUPER ADMIN
     ========================= */

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create parent from existing user' })
  createParent(@Body() dto: CreateParentDto) {
    return this.parentService.createParent(dto);
  }

  @Post('register')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Register parent (create user + parent)' })
  registerParent(@Body() dto: RegisterParentDto) {
    return this.parentService.registerParent(dto);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update parent status' })
  @ApiParam({ name: 'id', type: Number })
  updateParent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateParentDto,
  ) {
    return this.parentService.updateParent(id, dto);
  }

  /* =========================
     PARENT SELF SERVICES
     ========================= */

  @Get('children')
  @Roles('PARENT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Get logged-in parent children' })
  async getChildren(@Req() req) {
    return this.parentService.getMyChildren(req.user.id);
  }

  @Get('students/:studentId/attendance')
  @Roles('PARENT', 'SUPER_ADMIN', 'ADMIN')
  async attendance(
    @Req() req,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    await this.parentService.validateParentAccess(req.user.id, studentId);
    return this.parentService.getAttendanceSummary(studentId);
  }

  @Get('students/:studentId/report-cards')
  @Roles('PARENT', 'SUPER_ADMIN', 'ADMIN')
  async reportCards(
    @Req() req,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    await this.parentService.validateParentAccess(req.user.id, studentId);
    return this.parentService.getReportCards(studentId);
  }

  @Get('students/:studentId/upcoming-exams')
  @Roles('PARENT', 'SUPER_ADMIN', 'ADMIN')
  async upcomingExams(
    @Req() req,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    await this.parentService.validateParentAccess(req.user.id, studentId);
    return this.parentService.getUpcomingExams(studentId);
  }
}
