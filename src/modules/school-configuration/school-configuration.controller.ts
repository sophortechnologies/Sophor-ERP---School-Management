import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SchoolConfigurationService } from './school-configuration.service';
import { CreateSchoolConfigurationDto } from './dto/create-school-configuration.dto';
import { UpdateSchoolConfigurationDto } from './dto/update-school-configuration.dto';

@ApiTags('School Configuration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('school-configuration')
export class SchoolConfigurationController {
  constructor(
    private readonly schoolConfigurationService: SchoolConfigurationService,
  ) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create school configuration' })
  create(@Body() createDto: CreateSchoolConfigurationDto) {
    return this.schoolConfigurationService.create(createDto);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Get all school configurations (paginated)' })
  findAll(
    @Query('page') page = 1,
    @Query('page_size') pageSize = 10,
    @Req() req: Request,
  ) {
    return this.schoolConfigurationService.findAll(
      Number(page),
      Number(pageSize),
      `${req.protocol}://${req.get('host')}${req.path}`,
    );
  }

  // Read-only endpoints accessible to all authenticated users —
  // the frontend uses these on every page load to display school name, logo, academic year.
  @Get('active')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'STAFF', 'HR', 'FINANCE')
  @ApiOperation({ summary: 'Get active school configuration' })
  findActive() {
    return this.schoolConfigurationService.findActive();
  }

  @Get('academic-year')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'STAFF', 'HR', 'FINANCE')
  @ApiOperation({ summary: 'Get current academic year' })
  getCurrentAcademicYear() {
    return this.schoolConfigurationService.getCurrentAcademicYear();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Get school configuration by ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.schoolConfigurationService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update school configuration' })
  @ApiParam({ name: 'id', type: Number })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSchoolConfigurationDto,
  ) {
    return this.schoolConfigurationService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete school configuration' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.schoolConfigurationService.remove(id);
  }
}
