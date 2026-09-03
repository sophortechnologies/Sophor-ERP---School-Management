import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { EmployeeStatus } from './enums/employee.enum';

@ApiTags('Employees')
@ApiBearerAuth()
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @Permissions('employee:create')
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiBody({ type: CreateEmployeeDto })
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.create(dto);
  }

@Get()
@Roles('SUPER_ADMIN', 'ADMIN', 'HR', 'FINANCE')
@Permissions('employee:view')
@ApiOperation({ summary: 'Get all employees' })
findAll(@Query() query: EmployeeQueryDto, @Req() req) {
  const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
  return this.employeeService.findAll(query, baseUrl);
}

  @Get('dashboard/stats')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @Permissions('employee:view')
  @ApiOperation({ summary: 'Get employee dashboard statistics' })
  getDashboardStats() {
    return this.employeeService.getDashboardStats();
  }

  @Get('user/:userId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR', 'FINANCE')
  @Permissions('employee:view')
  @ApiOperation({ summary: 'Get employee by user ID' })
  @ApiParam({ name: 'userId', type: Number })
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.employeeService.findByUserId(userId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR', 'FINANCE')
  @Permissions('employee:view')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @Permissions('employee:update')
  @ApiOperation({ summary: 'Update employee' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateEmployeeDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEmployeeDto) {
    return this.employeeService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'ADMIN', 'HR')
  @Permissions('employee:update')
  @ApiOperation({ summary: 'Update employee status' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ schema: { properties: { status: { type: 'string', enum: ['ACTIVE', 'ON_LEAVE', 'TERMINATED', 'RETIRED', 'SUSPENDED'] } } } })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: EmployeeStatus,
  ) {
    return this.employeeService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @Permissions('employee:delete')
  @ApiOperation({ summary: 'Delete employee' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.remove(id);
  }
}