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
import { SchoolConfigurationService } from './school-configuration.service';
import { CreateSchoolConfigurationDto } from './dto/create-school-configuration.dto';
import { UpdateSchoolConfigurationDto } from './dto/update-school-configuration.dto';

@ApiTags('School Configuration')
@Controller('school-configuration')
@ApiBearerAuth()
export class SchoolConfigurationController {
  constructor(
    private readonly schoolConfigurationService: SchoolConfigurationService,
  ) {}

  @Post()
  create(@Body() createDto: CreateSchoolConfigurationDto) {
    return this.schoolConfigurationService.create(createDto);
  }

  // ✅ PAGINATED FIND ALL
  @Get()
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

  @Get('active')
  findActive() {
    return this.schoolConfigurationService.findActive();
  }

  @Get('academic-year')
  getCurrentAcademicYear() {
    return this.schoolConfigurationService.getCurrentAcademicYear();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.schoolConfigurationService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSchoolConfigurationDto,
  ) {
    return this.schoolConfigurationService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.schoolConfigurationService.remove(id);
  }
}
