import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Body,
  Query,
  Req
} from '@nestjs/common';
import { StaffLeaveService } from './staff-leave.service';
import { CreateStaffLeaveDto } from './dto/create-leave.dto';
import { UpdateStaffLeaveDto } from './dto/update-leave.dto';
import { GetStaffLeavesDto } from './dto/get-leaves.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('staff-leave')
export class StaffLeaveController {
  constructor(private readonly service: StaffLeaveService) {}

  @Post('apply')
async apply(@Req() req: any, @Body() dto: CreateStaffLeaveDto) {
  const userId = req.user.id;
  const role = req.user.role; // assuming you have role in JWT

  return this.service.applyLeave(userId, role, dto);
}

@Get('my-leaves')
async getMyLeaves(@Req() req: any, @Query() query: GetStaffLeavesDto) {
  const userId = req.user.id;  // ← Taken from JWT auth
  return this.service.getMyLeaves(userId, query);
}


@Get(':id')
async getById(
  @Param('id', ParseIntPipe) id: number,
  @Req() req: any,
) {
  const userId = req.user.id;
  const role = req.user.role; // assuming role is included in JWT payload

  return this.service.getLeaveById(id, userId, role);
}
@Get('pending')
getPendingLeaves() {
  return this.service.getAllPendingLeaves();
}

  @Patch(':id/review')
  async review(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffLeaveDto,
    @Req() req: any,
  ) {
    const approverId = req.user.id;
    return this.service.approveOrReject(id, dto, approverId);
  }
}