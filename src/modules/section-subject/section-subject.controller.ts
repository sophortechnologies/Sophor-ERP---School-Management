import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { SectionSubjectService } from './section-subject.service';
import { CreateSectionSubjectDto } from './dto/create-section-subject.dto';
import { UpdateSectionSubjectDto } from './dto/update-section-subject.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Section-Subjects')
@Controller('section-subjects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SectionSubjectController {
  constructor(private readonly service: SectionSubjectService) {}

  // Assign subject + teacher to a section
  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  create(@Body() dto: CreateSectionSubjectDto) {
    return this.service.create(dto);
  }

  // Get all assignments
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  findAll() {
    return this.service.findAll();
  }

  // Get subjects of a section
  @Get('section/:sectionId')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  findBySection(
    @Param('sectionId', ParseIntPipe) sectionId: number,
  ) {
    return this.service.findBySection(sectionId);
  }

  // Update assigned teacher
  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSectionSubjectDto,
  ) {
    return this.service.update(id, dto);
  }

  // Remove assignment
  @Delete(':id')
  @Roles('SUPER_ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
