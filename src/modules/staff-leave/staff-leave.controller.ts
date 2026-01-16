// staff-leave.controller.ts
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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StaffLeaveService } from './staff-leave.service';
import { CreateStaffLeaveDto } from './dto/create-leave.dto';
import { UpdateStaffLeaveDto } from './dto/update-leave.dto';
import { GetStaffLeavesDto } from './dto/get-leaves.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Staff Leave')
@ApiBearerAuth()
@Controller('staff-leave')
export class StaffLeaveController {
  constructor(private readonly service: StaffLeaveService) {}

  /* ================= CREATE ================= */

  @Post('apply')
  @ApiOperation({ summary: 'Apply for leave (staff)' })
  async apply(@Req() req: any, @Body() dto: CreateStaffLeaveDto) {
    const userId = req.user.id;
    const role = req.user.role;
    return this.service.applyLeave(userId, role, dto);
  }

  /* ================= READ ================= */

  @Get('my-leaves')
  @ApiOperation({ summary: 'Get logged-in staff leaves' })
  async getMyLeaves(
    @Req() req: any,
    @Query() query: GetStaffLeavesDto,
  ) {
    return this.service.getMyLeaves(req.user.id, query);
  }

  @Get('pending')
  @Roles('SUPER_ADMIN','ADMIN', 'HR')
  @ApiOperation({ summary: 'Get all pending leave requests' })
  getPendingLeaves() {
    return this.service.getAllPendingLeaves();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get leave by ID (role-based access)' })
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.service.getLeaveById(id, req.user.id, req.user.role);
  }

  /* ================= UPDATE ================= */

  @Patch(':id/review')
  @Roles('SUPER_ADMIN','ADMIN', 'HR')
  @ApiOperation({ summary: 'Approve or reject leave request' })
  async review(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffLeaveDto,
    @Req() req: any,
  ) {
    return this.service.approveOrReject(id, dto, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update own leave request (before approval)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffLeaveDto,
    @Req() req: any,
  ) {
    return this.service.updateLeave(id, req.user.id, dto);
  }

  /* ================= DELETE ================= */

  @Delete(':id')
  @ApiOperation({ summary: 'Delete own leave request (before approval)' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.service.deleteLeave(id, req.user.id);
  }
}
