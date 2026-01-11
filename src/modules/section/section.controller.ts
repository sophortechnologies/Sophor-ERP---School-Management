import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { SectionService } from './section.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Sections')
@ApiBearerAuth()
@Controller('sections')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a new section' })
  @ApiBody({ type: CreateSectionDto })
  @ApiResponse({ status: 201, description: 'Section created' })
  create(@Body() dto: CreateSectionDto) {
    return this.sectionService.create(dto);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get all sections' })
  @ApiResponse({ status: 200, description: 'List of sections' })
  findAll() {
    return this.sectionService.findAll();
  }

  @Get('class/:classId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get sections by class ID' })
  @ApiParam({ name: 'classId', type: Number })
  @ApiResponse({ status: 200, description: 'Sections for class' })
  findByClass(@Param('classId', ParseIntPipe) classId: number) {
    return this.sectionService.findByClass(classId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get section by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Section details' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sectionService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update section' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateSectionDto })
  @ApiResponse({ status: 200, description: 'Section updated' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.sectionService.update(id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete section' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Section deleted' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sectionService.remove(id);
  }
}
