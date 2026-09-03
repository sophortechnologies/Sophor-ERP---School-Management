import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StaffLeaveService } from './staff-leave.service';
import { CreateStaffLeaveDto } from './dto/create-leave.dto';
import { UpdateStaffLeaveDto } from './dto/update-leave.dto';
import { GetStaffLeavesDto } from './dto/get-leaves.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Staff Leave')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('staff-leave')
export class StaffLeaveController {
  constructor(private readonly service: StaffLeaveService) {}

  @Post('apply')
  @Roles('STAFF', 'TEACHER', 'SUPER_ADMIN', 'ADMIN', 'HR')
  @ApiOperation({ summary: 'Apply for leave' })
  async apply(@Req() req: any, @Body() dto: CreateStaffLeaveDto) {
    const userId = req.user.id;
    const userRole = req.user.role?.name || req.user.role;
    return this.service.applyLeave(userId, userRole, dto);
  }

  @Get('my-leaves')
  @Roles('STAFF', 'TEACHER', 'SUPER_ADMIN', 'ADMIN', 'HR')
  @ApiOperation({ summary: 'Get my leave requests' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getMyLeaves(
    @Req() req: any,
    @Query() query: GetStaffLeavesDto,
    @Req() request: Request,
  ) {
    const baseUrl = `${request.protocol}://${request.get('host')}${request.path}`;
    return this.service.getMyLeaves(req.user.id, query, baseUrl);
  }

  @Get('pending')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @ApiOperation({ summary: 'Get all pending leave requests' })
  getPendingLeaves() {
    return this.service.getAllPendingLeaves();
  }

  @Get('balance')
  @Roles('STAFF', 'TEACHER', 'SUPER_ADMIN', 'ADMIN', 'HR')
  @ApiOperation({ summary: 'Get my leave balance' })
  async getLeaveBalance(@Req() req: any) {
    return this.service.getLeaveBalance(req.user.id);
  }

  @Get(':id')
  @Roles('STAFF', 'TEACHER', 'SUPER_ADMIN', 'ADMIN', 'HR')
  @ApiOperation({ summary: 'Get leave request by ID' })
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.service.getLeaveById(id, req.user.id, req.user.role?.name || req.user.role);
  }

  @Patch(':id/review')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @ApiOperation({ summary: 'Approve or reject leave request' })
  async review(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffLeaveDto,
    @Req() req: any,
  ) {
    return this.service.approveOrReject(id, dto, req.user.id);
  }

  @Patch(':id')
  @Roles('STAFF', 'TEACHER')
  @ApiOperation({ summary: 'Update my own leave request (pending only)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffLeaveDto,
    @Req() req: any,
  ) {
    return this.service.updateLeave(id, req.user.id, dto);
  }

  @Delete(':id')
  @Roles('STAFF', 'TEACHER')
  @ApiOperation({ summary: 'Delete my own leave request (pending only)' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.service.deleteLeave(id, req.user.id);
  }

  @Get('history/:userId')
@Roles('SUPER_ADMIN', 'ADMIN', 'HR')
@ApiOperation({ summary: 'Get leave history for a staff member' })
@ApiQuery({ name: 'year', required: false })
async getLeaveHistory(
  @Param('userId', ParseIntPipe) userId: number,
  @Query('year') year: string,
) {
  return this.service.getLeaveHistory(userId, year ? Number(year) : undefined);
}
}