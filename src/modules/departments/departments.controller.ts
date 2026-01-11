import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { QueryDepartmentDto } from './dto/query-department.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Departments')
@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  @ApiResponse({ status: 409, description: 'Department already exists' })
  create(@Body() createDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDto);
  }

  //  FIX: added @Roles
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get()
  @ApiOperation({ summary: 'Get all departments with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Departments retrieved successfully' })
  findAll(@Query() query: QueryDepartmentDto) {
    return this.departmentsService.findAll(query);
  }

  //  FIX: added @Roles
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('active')
  @ApiOperation({ summary: 'Get all active departments (simple list)' })
  @ApiResponse({ status: 200, description: 'Active departments retrieved successfully' })
  findAllActive() {
    return this.departmentsService.findAllActive();
  }

  //  FIX: added @Roles
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('statistics')
  @ApiOperation({ summary: 'Get statistics for all departments' })
  @ApiResponse({ status: 200, description: 'Department statistics retrieved successfully' })
  getAllStatistics() {
    return this.departmentsService.getAllStatistics();
  }

  //  FIX: added @Roles
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID with full details' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Department retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.findOne(id);
  }

  //  FIX: added @Roles
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get statistics for a specific department' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Department statistics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  getStatistics(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.getStatistics(id);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: 'Update department' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, updateDto);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate department' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.deactivate(id);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate department' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.activate(id);
  }

  @Roles('SUPER_ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete department (hard delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.remove(id);
  }
}
