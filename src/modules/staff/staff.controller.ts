import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Req,
  ParseIntPipe,
  UseGuards,
  ForbiddenException
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { RegisterStaffDto } from './dto/register-staff.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Staff')
@ApiBearerAuth()
@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create staff from existing user' })
  create(@Body() dto: CreateStaffDto) {
    return this.staffService.create(dto);
  }

  @Post('register')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Register new staff (create user + staff)' })
  register(@Body() dto: RegisterStaffDto) {
    return this.staffService.register(dto);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Get all staff with pagination' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'page_size', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'search', required: false })  // ← ADD THIS
  async findAll(
    @Query('page') page: string,
    @Query('page_size') pageSize: string,
    @Query('status') status: string,
    @Query('departmentId') departmentId: string,
    @Query('search') search: string,  // ← ADD THIS
    @Req() req: Request,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
    return this.staffService.findAll(
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 10,
      baseUrl,
      status,
      departmentId ? Number(departmentId) : undefined,
      search,  // ← ADD THIS
    );
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Get staff by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.findOne(id);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update staff' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffDto,
  ) {
    return this.staffService.update(id, dto);
  }

  @Put(':id/deactivate')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Deactivate staff (soft delete)' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.deactivate(id);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Soft delete staff' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.remove(id);
  }

  @Delete(':id/hard')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Permanently delete staff' })
  hardDelete(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.hardDelete(id);
  }

  @Get(':id/dashboard')
  @Roles('SUPER_ADMIN', 'ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Get staff dashboard statistics' })
  async getDashboard(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    if (req.user.role?.name === 'STAFF') {
      const staffRecord = await this.staffService.findStaffByUserId(req.user.id);
      if (!staffRecord || staffRecord.id !== id) {
        throw new ForbiddenException('You can only view your own dashboard');
      }
    }
    return this.staffService.getStaffDashboard(id);
  }

  // ADD THIS ENDPOINT
  @Get(':id/weekly-report')
  @Roles('SUPER_ADMIN', 'ADMIN', 'STAFF')
  @ApiOperation({ summary: 'Get staff weekly attendance report' })
  async getWeeklyReport(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const staff = await this.staffService.findStaffByUserId(req.user.id);
    if (req.user.role?.name === 'STAFF' && (!staff || staff.id !== id)) {
      throw new ForbiddenException('You can only view your own report');
    }
    return this.staffService.getWeeklyReport(id);
  }
}