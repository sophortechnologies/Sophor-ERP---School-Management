import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EmployeeLeaveService } from './employee-leave.service';
import { ApplyLeaveDto } from './dto/apply-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { LeaveQueryDto } from './dto/leave-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Employee Leave')
@ApiBearerAuth()
@Controller('employee-leave')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class EmployeeLeaveController {
  constructor(private readonly leaveService: EmployeeLeaveService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR', 'TEACHER', 'STAFF')
  @Permissions('leave:apply')
  @ApiOperation({ summary: 'Apply for leave' })
  applyLeave(@Body() dto: ApplyLeaveDto, @Req() req) {
    return this.leaveService.applyLeave(dto, req.user.id, req.user.role);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @Permissions('leave:view')
  @ApiOperation({ summary: 'Get all leave requests' })
  findAll(@Query() query: LeaveQueryDto) {
    return this.leaveService.getLeaves(query);
  }

  @Get('pending')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @Permissions('leave:view')
  @ApiOperation({ summary: 'Get pending leave requests' })
  getPending() {
    return this.leaveService.getPendingLeaves();
  }

  @Get('balance/:employeeId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @Permissions('leave:view')
  @ApiOperation({ summary: 'Get leave balance for an employee' })
  getBalance(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.leaveService.getLeaveBalance(employeeId);
  }

  @Get('history/:employeeId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @Permissions('leave:view')
  @ApiOperation({ summary: 'Get leave history for an employee' })
  getHistory(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query('year') year?: number,
  ) {
    return this.leaveService.getLeaveHistory(employeeId, year);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @Permissions('leave:view')
  @ApiOperation({ summary: 'Get leave request by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.leaveService.getLeaveById(id);
  }

  @Patch(':id/review')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @Permissions('leave:approve')
  @ApiOperation({ summary: 'Approve or reject leave request' })
  review(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeaveDto,
    @Req() req,
  ) {
    return this.leaveService.reviewLeave(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR', 'TEACHER', 'STAFF')
  @Permissions('leave:cancel')
  @ApiOperation({ summary: 'Cancel leave request' })
  cancel(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.leaveService.cancelLeave(id, req.user.id);
  }
}